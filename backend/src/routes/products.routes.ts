import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { query } from "../db.js";
import { productFromRow } from "../mappers.js";
import type { AuthedRequest } from "../types.js";

const router = Router();

const productSelect = `
  select p.*,
    coalesce(jsonb_agg(jsonb_build_object(
      'id', f.id,
      'userId', f.user_id,
      'userName', u.name,
      'rating', f.rating,
      'comment', f.comment,
      'createdAt', f.created_at
    )) filter (where f.id is not null), '[]'::jsonb) as feedback
  from products p
  left join product_feedback f on f.product_id = p.id
  left join users u on u.id = f.user_id
`;

router.get("/", async (req, res, next) => {
  try {
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const params: unknown[] = [];
    const where = type ? "where p.product_type = $1" : "";
    if (type) params.push(type);
    const { rows } = await query(`${productSelect} ${where} group by p.id order by p.created_at desc`, params);
    res.json({ products: rows.map(productFromRow) });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const input = z.object({
      name: z.string().min(1),
      price: z.number().positive(),
      unit: z.string().default("kg"),
      quantity: z.number().int().min(0).default(0),
      seller: z.string().min(1),
      location: z.string().min(1),
      description: z.string().default(""),
      category: z.string().min(1),
      freshness: z.string().default("Fresh"),
      isOrganic: z.boolean().default(false),
      productType: z.string().default("grocery"),
      condition: z.string().optional(),
      images: z.array(z.any()).default([])
    }).parse(req.body);

    const { rows } = await query(
      `insert into products
        (owner_id, name, price, unit, quantity, seller, location, description, category, freshness, is_organic, product_type, condition, images)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       returning *, '[]'::jsonb as feedback`,
      [
        req.user!.id,
        input.name,
        input.price,
        input.unit,
        input.quantity,
        input.seller,
        input.location,
        input.description,
        input.category,
        input.freshness,
        input.isOrganic,
        input.productType,
        input.condition,
        JSON.stringify(input.images)
      ]
    );

    res.status(201).json({ product: productFromRow(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/feedback", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const input = z.object({
      rating: z.number().int().min(1).max(5),
      comment: z.string().default("")
    }).parse(req.body);

    const { rows } = await query(
      `insert into product_feedback (product_id, user_id, rating, comment)
       values ($1, $2, $3, $4)
       returning id, user_id as "userId", rating, comment, created_at as "createdAt"`,
      [req.params.id, req.user!.id, input.rating, input.comment]
    );

    const user = await query("select name from users where id = $1", [req.user!.id]);
    res.status(201).json({ feedback: { ...rows[0], userName: user.rows[0]?.name ?? "User" } });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/like", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const input = z.object({ liked: z.boolean() }).parse(req.body);

    if (input.liked) {
      await query("delete from product_likes where product_id = $1 and user_id = $2", [req.params.id, req.user!.id]);
    } else {
      await query("insert into product_likes (product_id, user_id) values ($1, $2) on conflict do nothing", [req.params.id, req.user!.id]);
    }

    const count = await query("select count(*)::int as count from product_likes where product_id = $1", [req.params.id]);
    await query("update products set likes_count = $2 where id = $1", [req.params.id, count.rows[0].count]);
    res.json({ liked: !input.liked, likesCount: count.rows[0].count });
  } catch (error) {
    next(error);
  }
});

export default router;

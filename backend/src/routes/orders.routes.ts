import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { query } from "../db.js";
import type { AuthedRequest } from "../types.js";

const router = Router();

const orderFromRow = (row: any) => ({
  id: row.id,
  items: row.items,
  totalAmount: Number(row.total_amount),
  status: row.status,
  orderDate: row.created_at,
  deliveryAddress: row.delivery_address,
  paymentMethod: row.payment_method,
  type: row.order_type,
  trackingNumber: row.tracking_number
});

router.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await query("select * from orders where user_id = $1 order by created_at desc", [req.user!.id]);
    res.json({ orders: rows.map(orderFromRow) });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const input = z.object({
      items: z.array(z.any()).min(1),
      totalAmount: z.number().positive(),
      deliveryAddress: z.string().min(3),
      paymentMethod: z.string().default("Cash on Delivery"),
      type: z.enum(["grocery", "artifact", "mixed"]).default("grocery")
    }).parse(req.body);

    const { rows } = await query(
      `insert into orders (user_id, items, total_amount, delivery_address, payment_method, order_type)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [req.user!.id, JSON.stringify(input.items), input.totalAmount, input.deliveryAddress, input.paymentMethod, input.type]
    );

    res.status(201).json({ order: orderFromRow(rows[0]) });
  } catch (error) {
    next(error);
  }
});

export default router;

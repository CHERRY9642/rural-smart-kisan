import { Router } from "express";
import { z } from "zod";
import { hashPassword, requireAuth, signToken, verifyPassword } from "../auth.js";
import { query } from "../db.js";
import { userFromRow } from "../mappers.js";
import type { AuthedRequest } from "../types.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6),
  phone: z.string().min(10),
  state: z.string().min(2),
  district: z.string().min(2),
  language: z.string().min(1).default("en"),
  plan: z.string().min(1).default("free"),
  role: z.string().min(1).default("farmer")
});

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6)
});

router.post("/signup", async (req, res, next) => {
  try {
    const input = signupSchema.parse(req.body);
    const passwordHash = await hashPassword(input.password);
    const { rows } = await query(
      `insert into users (name, email, password_hash, phone, state, district, language, plan, role)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       returning *`,
      [input.name, input.email, passwordHash, input.phone, input.state, input.district, input.language, input.plan, input.role]
    );

    const user = userFromRow(rows[0]);
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ user, token });
  } catch (error: any) {
    if (error?.code === "23505") {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const { rows } = await query("select * from users where email = $1", [input.email]);
    const row = rows[0];

    if (!row || !(await verifyPassword(input.password, row.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = userFromRow(row);
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await query("select * from users where id = $1", [req.user!.id]);
    if (!rows[0]) return res.status(404).json({ message: "User not found" });
    res.json({ user: userFromRow(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.put("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const input = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      phone: z.string().min(10).optional(),
      state: z.string().min(2).optional(),
      district: z.string().min(2).optional(),
      language: z.string().min(1).optional(),
      farmSize: z.string().optional(),
      mainCrops: z.string().optional()
    }).parse(req.body);

    const { rows } = await query(
      `update users set
        name = coalesce($2, name),
        email = coalesce($3, email),
        phone = coalesce($4, phone),
        state = coalesce($5, state),
        district = coalesce($6, district),
        language = coalesce($7, language),
        farm_size = coalesce($8, farm_size),
        main_crops = coalesce($9, main_crops),
        updated_at = now()
       where id = $1
       returning *`,
      [req.user!.id, input.name, input.email, input.phone, input.state, input.district, input.language, input.farmSize, input.mainCrops]
    );

    res.json({ user: userFromRow(rows[0]) });
  } catch (error) {
    next(error);
  }
});

export default router;

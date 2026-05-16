import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { query } from "../db.js";
import type { AuthedRequest } from "../types.js";

const router = Router();

router.post("/requests", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const input = z.object({
      farmerName: z.string().min(2),
      farmLocation: z.string().min(2),
      phoneNumber: z.string().min(10),
      email: z.string().email().optional().or(z.literal("")),
      farmSize: z.string().min(1),
      produceType: z.string().min(1),
      estimatedQuantity: z.string().min(1),
      preferredDuration: z.string().min(1),
      nearestFacility: z.string().optional(),
      specialRequirements: z.string().optional()
    }).parse(req.body);

    const { rows } = await query(
      `insert into cold_storage_requests
       (user_id, farmer_name, farm_location, phone_number, email, farm_size, produce_type, estimated_quantity, preferred_duration, nearest_facility, special_requirements)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       returning *`,
      [
        req.user!.id,
        input.farmerName,
        input.farmLocation,
        input.phoneNumber,
        input.email || null,
        input.farmSize,
        input.produceType,
        input.estimatedQuantity,
        input.preferredDuration,
        input.nearestFacility,
        input.specialRequirements
      ]
    );

    res.status(201).json({ request: rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;

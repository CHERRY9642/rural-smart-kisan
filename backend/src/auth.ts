import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Response } from "express";
import { config } from "./config.js";
import type { AuthUser, AuthedRequest } from "./types.js";

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signToken = (user: AuthUser) =>
  jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"] });

export const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret) as AuthUser;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }
};

import type { Request } from "express";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export type AuthedRequest = Request & {
  user?: AuthUser;
};

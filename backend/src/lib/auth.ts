import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { env } from "../config/env.js";

const AUTH_COOKIE = "auth_token";
const TOKEN_TTL = "7d";

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
  storeId?: number | null;
  name?: string | null;
};

type TokenPayload = {
  sub: number;
  email: string;
  role: UserRole;
  storeId?: number | null;
  name?: string | null;
};

export type AuthenticatedRequest = Request & { user?: AuthUser };

const isProd = env.NODE_ENV === "production";

const apiKeyUser: AuthUser = {
  id: 0,
  email: "api-key@system",
  role: UserRole.SUPER_ADMIN,
  storeId: null,
  name: "API Key",
};

export function signUser(user: AuthUser) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId ?? null,
      name: user.name ?? null,
    },
    env.JWT_SECRET,
    { expiresIn: TOKEN_TTL },
  );
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE, {
    path: "/",
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
}

function extractToken(req: Request) {
  const header = req.headers["authorization"];
  if (header && typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  const bearerArray = Array.isArray(header) ? header[0] : null;
  if (bearerArray && bearerArray.startsWith("Bearer ")) return bearerArray.slice("Bearer ".length);

  const cookieToken = (req as AuthenticatedRequest).cookies?.[AUTH_COOKIE];
  if (cookieToken && typeof cookieToken === "string") return cookieToken;

  return null;
}

export async function authenticateRequest(req: Request): Promise<AuthUser | null> {
  // API key fallback for backward compatibility / scripts
  const key = req.headers["x-api-key"] || req.headers["authorization"];
  const tokenHeader = Array.isArray(key) ? key[0] : key;
  if (tokenHeader && tokenHeader === env.ADMIN_API_KEY) {
    return apiKeyUser;
  }

  const token = extractToken(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload;
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      storeId: decoded.storeId ?? null,
      name: decoded.name ?? null,
    };
  } catch (err) {
    console.warn("auth token invalid", (err as Error).message);
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await authenticateRequest(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  (req as AuthenticatedRequest).user = user;
  next();
}

export function requireRole(roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user ?? (await authenticateRequest(req));
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(user.role)) return res.status(403).json({ error: "Forbidden" });
    (req as AuthenticatedRequest).user = user;
    next();
  };
}

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function publicUser(user: { id: number; email: string; name?: string | null; role: UserRole; storeId?: number | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    storeId: user.storeId ?? null,
  };
}

import type { NextFunction, Request, Response } from "express";

// Rate limiter middleware with optional Redis-backed counters.
// In development or single-instance deployments the in-memory Map is used.
// For production we expect REDIS_URL to be configured and a Redis client
// to be available; this gives a global counter across processes.

import { redis } from "../lib/redis.js";

interface Options {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  statusCode?: number;
}

type Counter = { count: number; startsAt: number };
const buckets = new Map<string, Counter>();

export function rateLimit(options: Options) {
  const {
    windowMs,
    max,
    keyGenerator = (req) => req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown",
    message = "Too many requests",
    statusCode = 429,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate:${keyGenerator(req)}`;

    if (redis) {
      try {
        const count = await redis.incr(key);
        if (count === 1) {
          // first request – set expiration
          await redis.pexpire(key, windowMs);
        }
        if (count > max) {
          return res.status(statusCode).json({ error: message });
        }
        return next();
      } catch (err) {
        console.error("Redis rate limiter error", err);
        // if Redis is failing, degrade to in-memory to avoid blocking traffic
      }
    }

    // fallback to in-memory bucket
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now - entry.startsAt > windowMs) {
      buckets.set(key, { count: 1, startsAt: now });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return res.status(statusCode).json({ error: message });
    }

    buckets.set(key, entry);
    next();
  };
}

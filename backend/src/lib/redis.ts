import { Redis } from "ioredis";
import { env } from "../config/env.js";

// create a shared Redis client; the URL should come from environment
// when running in development, the URL may be empty and we won't connect.
let client: Redis | null = null;

if (env.REDIS_URL) {
  client = new Redis(env.REDIS_URL, {
    // Rate limiting must never make every API route wait for an unavailable Redis.
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 1_000,
    retryStrategy: (attempt) => (attempt > 3 ? null : Math.min(attempt * 100, 500)),
  });
  client.on("error", (err) => {
    console.error("Redis connection error", err);
  });
} else {
  console.warn("REDIS_URL not provided; Redis-dependent features will be disabled.");
}

export const redis = client;

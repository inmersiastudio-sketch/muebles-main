import Redis from "ioredis";
import { env } from "../config/env.js";

// create a shared Redis client; the URL should come from environment
// when running in development, the URL may be empty and we won't connect.
let client: Redis.Redis | null = null;

if (env.REDIS_URL) {
  client = new (Redis as any)(env.REDIS_URL);
  client.on("error", (err) => {
    console.error("Redis connection error", err);
  });
} else {
  console.warn("REDIS_URL not provided; Redis-dependent features will be disabled.");
}

export const redis = client;

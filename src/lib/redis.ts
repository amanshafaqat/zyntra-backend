import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

/**
 * Redis is optional in Part 1: when REDIS_URL is set it backs the rate
 * limiter (shared counters across instances); otherwise the in-memory
 * store is used and this export stays null.
 */
export const redis: Redis | null = env.REDIS_URL
  ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: true })
  : null;

export async function connectRedis(): Promise<void> {
  if (!redis) {
    logger.info("Redis not configured — using in-memory rate limiting");
    return;
  }
  await redis.connect();
  logger.info("Redis connected");
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    logger.info("Redis disconnected");
  }
}

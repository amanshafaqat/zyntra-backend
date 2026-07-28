import rateLimit, { type Options } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "@/lib/redis";
import { ApiError } from "@/utils/api-error";

function buildLimiter(options: Partial<Options>, prefix: string) {
  const r = redis;
  return rateLimit({
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, _res, next) => next(ApiError.tooMany()),
    ...(r
      ? { store: new RedisStore({ prefix: `rl:${prefix}:`, sendCommand: (...args: string[]) => r.call(...(args as [string, ...string[]])) as never }) }
      : {}),
    ...options,
  });
}

/** Global: 300 requests / 5 min per IP. */
export const globalLimiter = buildLimiter({ windowMs: 5 * 60 * 1000, limit: 300 }, "global");

/** Auth endpoints: 20 requests / 15 min per IP (login, register, codes). */
export const authLimiter = buildLimiter({ windowMs: 15 * 60 * 1000, limit: 20 }, "auth");

/** Code-sending endpoints: 5 requests / 15 min per IP. */
export const codeLimiter = buildLimiter({ windowMs: 15 * 60 * 1000, limit: 5 }, "code");

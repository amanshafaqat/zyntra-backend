import { redis } from "@/lib/redis";
import { logger } from "@/config/logger";

/**
 * Cache abstraction over Redis with a bounded in-memory fallback, so caching
 * works whether or not Redis is configured. Keys are namespaced per concern by
 * the caller (e.g. "reco:<userId>"). Values are JSON-serialised.
 */

interface MemoryEntry {
  value: string;
  expiresAt: number;
}

const MEMORY_MAX = 1000;
const memory = new Map<string, MemoryEntry>();

function memorySet(key: string, value: string, ttlSeconds: number): void {
  if (memory.size >= MEMORY_MAX) {
    // Evict the oldest inserted key (Map preserves insertion order).
    const oldest = memory.keys().next().value;
    if (oldest !== undefined) memory.delete(oldest);
  }
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function memoryGet(key: string): string | null {
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry.value;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = redis ? await redis.get(key) : memoryGet(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      logger.warn({ err, key }, "Cache get failed");
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      const raw = JSON.stringify(value);
      if (redis) await redis.set(key, raw, "EX", ttlSeconds);
      else memorySet(key, raw, ttlSeconds);
    } catch (err) {
      logger.warn({ err, key }, "Cache set failed");
    }
  },

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      if (redis) await redis.del(...keys);
      else for (const k of keys) memory.delete(k);
    } catch (err) {
      logger.warn({ err, keys }, "Cache del failed");
    }
  },

  /** Invalidate every key matching a prefix (used on writes). */
  async delByPrefix(prefix: string): Promise<void> {
    try {
      if (redis) {
        const found: string[] = [];
        let cursor = "0";
        do {
          const [next, batch] = await redis.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100);
          cursor = next;
          found.push(...batch);
        } while (cursor !== "0");
        if (found.length) await redis.del(...found);
      } else {
        for (const k of memory.keys()) if (k.startsWith(prefix)) memory.delete(k);
      }
    } catch (err) {
      logger.warn({ err, prefix }, "Cache delByPrefix failed");
    }
  },

  /** Get-or-compute helper. */
  async remember<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== null) return hit;
    const value = await compute();
    await this.set(key, value, ttlSeconds);
    return value;
  },
};

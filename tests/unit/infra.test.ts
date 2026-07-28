import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { sanitizeInput } from "@/middlewares/sanitize.middleware";
import { cache } from "@/lib/cache";
import { jobQueue } from "@/lib/job-queue";
import { mlService } from "@/lib/ml-service";

const fakeReq = (body: unknown, query: Record<string, unknown> = {}) =>
  ({ body, query }) as unknown as Request;

const runSanitize = (req: Request) =>
  new Promise<void>((resolve) => sanitizeInput(req, {} as Response, (() => resolve()) as NextFunction));

describe("sanitizeInput", () => {
  it("strips HTML tags from string fields", async () => {
    const req = fakeReq({ name: "<script>alert(1)</script>Aman" });
    await runSanitize(req);
    expect(req.body.name).toBe("alert(1)Aman");
  });

  it("removes prototype-pollution keys", async () => {
    const req = fakeReq(JSON.parse('{"__proto__":{"admin":true},"name":"Ali"}'));
    await runSanitize(req);
    expect(Object.keys(req.body)).toEqual(["name"]);
    expect(({} as Record<string, unknown>).admin).toBeUndefined();
  });

  it("sanitizes nested objects and arrays", async () => {
    const req = fakeReq({ projects: ["<b>One</b>", { title: "<i>Two</i>" }] });
    await runSanitize(req);
    expect(req.body.projects[0]).toBe("One");
    expect(req.body.projects[1].title).toBe("Two");
  });

  it("strips null bytes and control characters", async () => {
    const req = fakeReq({ note: "safe\u0000value" });
    await runSanitize(req);
    expect(req.body.note).toBe("safevalue");
  });

  it("leaves plain values untouched", async () => {
    const req = fakeReq({ cgpa: "3.42", verified: true, count: 5 });
    await runSanitize(req);
    expect(req.body).toEqual({ cgpa: "3.42", verified: true, count: 5 });
  });
});

describe("cache (in-memory fallback)", () => {
  it("stores and retrieves a value", async () => {
    await cache.set("test:key", { a: 1 }, 60);
    expect(await cache.get<{ a: number }>("test:key")).toEqual({ a: 1 });
  });

  it("returns null for a missing key", async () => {
    expect(await cache.get("test:absent")).toBeNull();
  });

  it("deletes by prefix", async () => {
    await cache.set("pfx:a", 1, 60);
    await cache.set("pfx:b", 2, 60);
    await cache.delByPrefix("pfx:");
    expect(await cache.get("pfx:a")).toBeNull();
    expect(await cache.get("pfx:b")).toBeNull();
  });

  it("remember computes once then serves from cache", async () => {
    const compute = vi.fn().mockResolvedValue("computed");
    await cache.del("test:remember");
    expect(await cache.remember("test:remember", 60, compute)).toBe("computed");
    expect(await cache.remember("test:remember", 60, compute)).toBe("computed");
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it("expires entries after their TTL", async () => {
    vi.useFakeTimers();
    await cache.set("test:ttl", "v", 1);
    vi.advanceTimersByTime(1500);
    expect(await cache.get("test:ttl")).toBeNull();
    vi.useRealTimers();
  });
});

describe("jobQueue", () => {
  it("runs a registered handler", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    jobQueue.register("test.ok", handler);
    jobQueue.enqueue("test.ok", { x: 1 });
    await vi.waitFor(() => expect(handler).toHaveBeenCalledWith({ x: 1 }));
  });

  it("retries a failing handler up to maxAttempts", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("boom"));
    jobQueue.register("test.fail", handler);
    jobQueue.enqueue("test.fail", {}, 2);
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2), { timeout: 5000 });
  });

  it("ignores an unregistered job name without throwing", () => {
    expect(() => jobQueue.enqueue("test.missing", {})).not.toThrow();
  });
});

describe("mlService local fallback", () => {
  const input = {
    cgpa: 3.4, ielts: 7, toefl: 0, strengthOverall: 70,
    cgpaMin: 2.8, ieltsMin: 6.5, ranking: 800,
    academicFit: 87, languageFit: 78,
  };

  it("uses the local model when ML_SERVICE_URL is unset", async () => {
    const result = await mlService.predict(input);
    expect(result.source).toBe("local-model");
    expect(result.admissionProbability).toBeGreaterThanOrEqual(5);
    expect(result.admissionProbability).toBeLessThanOrEqual(95);
  });

  it("raises confidence as more profile signal is present", async () => {
    const sparse = await mlService.predict({ ...input, cgpa: 0, ielts: 0, strengthOverall: 0 });
    const rich = await mlService.predict(input);
    expect(rich.confidence).toBeGreaterThan(sparse.confidence);
  });
});

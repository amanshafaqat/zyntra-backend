import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { jobQueue } from "@/lib/job-queue";
import { env } from "@/config/env";
import { asyncHandler } from "@/utils/async-handler";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    let database = "up";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "down";
    }

    let cache = "not_configured";
    if (redis) {
      try {
        await redis.ping();
        cache = "up";
      } catch {
        cache = "down";
      }
    }

    const healthy = database === "up";
    const memory = process.memoryUsage();

    res.status(healthy ? 200 : 503).json({
      status: healthy ? "ok" : "degraded",
      version: "1.0.0",
      environment: env.NODE_ENV,
      database,
      cache,
      integrations: {
        claude: env.hasClaude ? "configured" : "template_fallback",
        mlService: env.hasMlService ? "configured" : "local_model_fallback",
        mail: env.SMTP_HOST ? "configured" : "dev_transport",
      },
      pendingJobs: jobQueue.size,
      memoryMb: Math.round(memory.heapUsed / 1024 / 1024),
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }),
);

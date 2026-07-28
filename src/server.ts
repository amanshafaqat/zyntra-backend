import http from "node:http";
import { createApp } from "@/app";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { connectDatabase, disconnectDatabase } from "@/lib/prisma";
import { connectRedis, disconnectRedis } from "@/lib/redis";
import { jobQueue } from "@/lib/job-queue";
import { startScheduler, stopScheduler } from "@/modules/scheduler/scheduler";

async function main(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`Zyntra API listening on port ${env.PORT} (${env.NODE_ENV})`);
    logger.info(`Docs available at ${env.PUBLIC_URL}/docs`);
    startScheduler();
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down`);
    stopScheduler();
    server.close(async () => {
      // Give queued background jobs (audit writes, emails) a moment to drain.
      const deadline = Date.now() + 5_000;
      while (jobQueue.size > 0 && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (jobQueue.size > 0) logger.warn({ pending: jobQueue.size }, "Exiting with pending background jobs");

      await disconnectDatabase();
      await disconnectRedis();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 15_000).unref();
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => logger.error({ reason }, "Unhandled rejection"));
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception — exiting");
    process.exit(1);
  });
}

void main().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});

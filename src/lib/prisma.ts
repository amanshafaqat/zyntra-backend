import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

export const prisma = new PrismaClient({
  log: env.isDev ? ["warn", "error"] : ["error"],
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("PostgreSQL connected");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("PostgreSQL disconnected");
}

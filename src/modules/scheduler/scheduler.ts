import { logger } from "@/config/logger";
import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { applicationsService } from "@/modules/applications/applications.service";

/**
 * Lightweight in-process scheduler for background synchronisation. Runs the
 * deadline-reminder sweep on an interval (default hourly) without external
 * infra like cron or a job queue — appropriate for the current stage.
 *
 * The sweep is idempotent: each (application, threshold) reminder fires once,
 * enforced by the ReminderSent unique constraint, so overlapping runs are safe.
 */

let timer: NodeJS.Timeout | null = null;
let cleanupTimer: NodeJS.Timeout | null = null;
let running = false;

const INTERVAL_MS = env.isProd ? 60 * 60 * 1000 : 15 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

export async function runReminderSweep(): Promise<{ created: number; emailed: number }> {
  if (running) {
    logger.debug("Reminder sweep already running; skipping overlap");
    return { created: 0, emailed: 0 };
  }
  running = true;
  try {
    const result = await applicationsService.runDeadlineReminders({ sendEmail: true });
    if (result.created > 0) logger.info(result, "Deadline reminder sweep completed");
    return result;
  } catch (err) {
    logger.error({ err }, "Deadline reminder sweep failed");
    return { created: 0, emailed: 0 };
  } finally {
    running = false;
  }
}

/**
 * Removes expired refresh tokens, consumed/expired verification codes and
 * revoked sessions. Keeps the auth tables small and bounds index growth.
 */
export async function runTokenCleanup(): Promise<{ refreshTokens: number; verificationTokens: number }> {
  const now = new Date();
  const staleRevoked = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    const [refreshTokens, verificationTokens] = await prisma.$transaction([
      prisma.refreshToken.deleteMany({
        where: { OR: [{ expiresAt: { lt: now } }, { revokedAt: { lt: staleRevoked } }] },
      }),
      prisma.verificationToken.deleteMany({
        where: { OR: [{ expiresAt: { lt: now } }, { consumedAt: { not: null } }] },
      }),
    ]);
    const result = { refreshTokens: refreshTokens.count, verificationTokens: verificationTokens.count };
    if (result.refreshTokens + result.verificationTokens > 0) logger.info(result, "Token cleanup completed");
    return result;
  } catch (err) {
    logger.error({ err }, "Token cleanup failed");
    return { refreshTokens: 0, verificationTokens: 0 };
  }
}

export function startScheduler(): void {
  if (timer) return;
  // Kick off shortly after boot, then on the interval.
  setTimeout(() => void runReminderSweep(), 10_000).unref();
  timer = setInterval(() => void runReminderSweep(), INTERVAL_MS);
  timer.unref();

  setTimeout(() => void runTokenCleanup(), 60_000).unref();
  cleanupTimer = setInterval(() => void runTokenCleanup(), CLEANUP_INTERVAL_MS);
  cleanupTimer.unref();

  logger.info(`Background scheduler started (reminders every ${Math.round(INTERVAL_MS / 60000)} min, cleanup daily)`);
}

export function stopScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
  logger.info("Background scheduler stopped");
}

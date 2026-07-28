import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { prisma } from "@/lib/prisma";
import { catalogService } from "@/modules/catalog/catalog.service";
import { notificationService } from "@/modules/notifications/notifications.service";
import { runReminderSweep } from "@/modules/scheduler/scheduler";

/**
 * Push notifications: this backend persists a device's push subscription and
 * exposes the user's undelivered notifications for the client (web push / the
 * extension) to display. Actual transport (FCM/APNs/Web Push) is a delivery
 * concern layered on top of these records and is intentionally pluggable.
 */
const subscribeSchema = z.object({
  endpoint: z.string().url("A valid push endpoint URL is required"),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }).optional(),
  userAgent: z.string().max(300).optional(),
});

const syncController = {
  // Client pull-sync: latest notifications + unread count in one call.
  pull: asyncHandler(async (req, res) => {
    const notifications = await notificationService.list(req.user!.id);
    res.json({
      notifications,
      unread: notifications.filter((n) => !n.read).length,
      syncedAt: new Date().toISOString(),
    });
  }),

  // Upcoming admission deadline service (public catalog data, auth-gated for consistency).
  upcomingDeadlines: asyncHandler(async (req, res) => {
    const withinDays = Number(req.query.withinDays ?? 120);
    const limit = Number(req.query.limit ?? 20);
    res.json(await catalogService.upcomingDeadlines({ withinDays, limit }));
  }),

  // Register a push subscription for this user's device.
  subscribe: asyncHandler(async (req, res) => {
    const { endpoint, keys, userAgent } = req.body as z.infer<typeof subscribeSchema>;
    const record = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { userId: req.user!.id, p256dh: keys?.p256dh ?? null, auth: keys?.auth ?? null, userAgent: userAgent ?? null },
      create: {
        userId: req.user!.id,
        endpoint,
        p256dh: keys?.p256dh ?? null,
        auth: keys?.auth ?? null,
        userAgent: userAgent ?? null,
      },
    });
    res.status(201).json({ id: record.id, message: "Push subscription registered." });
  }),

  unsubscribe: asyncHandler(async (req, res) => {
    await prisma.pushSubscription.deleteMany({ where: { userId: req.user!.id, endpoint: req.body.endpoint } });
    res.json({ message: "Push subscription removed." });
  }),

  // Admin-triggered background sweep (in addition to the automatic scheduler).
  triggerSweep: asyncHandler(async (_req, res) => {
    res.json(await runReminderSweep());
  }),
};

const unsubscribeSchema = z.object({ endpoint: z.string().url() });

export const syncRouter = Router();
syncRouter.use(requireAuth);
syncRouter.get("/pull", syncController.pull);
syncRouter.get("/upcoming-deadlines", syncController.upcomingDeadlines);
syncRouter.post("/push/subscribe", validate({ body: subscribeSchema }), syncController.subscribe);
syncRouter.post("/push/unsubscribe", validate({ body: unsubscribeSchema }), syncController.unsubscribe);
syncRouter.post("/run-reminders", requireRole("admin"), syncController.triggerSweep);

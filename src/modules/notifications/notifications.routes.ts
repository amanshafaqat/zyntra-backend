import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { notificationService } from "./notifications.service";

const idParam = z.object({ id: z.string().min(1) });

const notificationController = {
  list: asyncHandler(async (req, res) => {
    res.json(await notificationService.list(req.user!.id));
  }),
  markAllRead: asyncHandler(async (req, res) => {
    await notificationService.markAllRead(req.user!.id);
    res.json({ message: "All notifications marked as read." });
  }),
  markRead: asyncHandler(async (req, res) => {
    await notificationService.markRead(req.user!.id, req.params.id);
    res.json({ message: "Notification marked as read." });
  }),
};

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);
notificationsRouter.get("/", notificationController.list);
notificationsRouter.post("/read-all", notificationController.markAllRead);
notificationsRouter.post("/:id/read", validate({ params: idParam }), notificationController.markRead);

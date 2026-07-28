import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { ChatService } from "@/modules/chat/chat.service";

const router = Router();
router.use(requireAuth);

router.get(
  "/sessions",
  asyncHandler(async (req, res) => {
    const sessions = await ChatService.listSessions(req.user!.id);
    res.json(sessions);
  })
);

router.post(
  "/sessions",
  asyncHandler(async (req, res) => {
    const { title } = req.body;
    const session = await ChatService.createSession(req.user!.id, title);
    res.status(201).json(session);
  })
);

router.get(
  "/sessions/:id",
  asyncHandler(async (req, res) => {
    const session = await ChatService.getSession(req.user!.id, req.params.id);
    res.json(session);
  })
);

router.post(
  "/sessions/:id/messages",
  asyncHandler(async (req, res) => {
    const { content } = req.body;
    const result = await ChatService.sendMessage(req.user!.id, req.params.id, content);
    res.json(result);
  })
);

router.delete(
  "/sessions/:id",
  asyncHandler(async (req, res) => {
    await ChatService.deleteSession(req.user!.id, req.params.id);
    res.json({ message: "Chat session deleted successfully" });
  })
);

export const chatRouter = router;

import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { auditService } from "./audit.service";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
  entity: z.string().trim().optional(),
  action: z.enum(["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "STATUS_CHANGE", "SECURITY"]).optional(),
  actorId: z.string().trim().optional(),
});

const auditController = {
  list: asyncHandler(async (req, res) => {
    res.json(await auditService.list(req.query as never));
  }),
};

export const auditRouter = Router();
auditRouter.use(requireAuth, requireRole("admin"));
auditRouter.get("/", validate({ query: listQuerySchema }), auditController.list);

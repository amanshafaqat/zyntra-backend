import { Router } from "express";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { usersController } from "./users.controller";
import { listUsersQuerySchema, updateMeSchema } from "./users.dto";

export const usersRouter = Router();

usersRouter.patch("/me", requireAuth, validate({ body: updateMeSchema }), usersController.updateMe);
usersRouter.delete("/me", requireAuth, usersController.deleteMe);
usersRouter.get("/", requireAuth, requireRole("admin"), validate({ query: listUsersQuerySchema }), usersController.list);

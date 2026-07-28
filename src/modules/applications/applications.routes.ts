import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { applicationsService } from "./applications.service";
import {
  applicationIdParam,
  applicationNoteParam,
  createApplicationSchema,
  noteSchema,
  updateStatusSchema,
} from "./applications.dto";

const applicationsController = {
  list: asyncHandler(async (req, res) => {
    res.json(await applicationsService.list(req.user!.id));
  }),
  get: asyncHandler(async (req, res) => {
    res.json(await applicationsService.get(req.user!.id, req.params.id));
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json(await applicationsService.create(req.user!.id, req.body));
  }),
  updateStatus: asyncHandler(async (req, res) => {
    res.json(await applicationsService.updateStatus(req.user!.id, req.params.id, req.body));
  }),
  remove: asyncHandler(async (req, res) => {
    await applicationsService.remove(req.user!.id, req.params.id);
    res.json({ message: "Application removed." });
  }),
  addNote: asyncHandler(async (req, res) => {
    res.status(201).json(await applicationsService.addNote(req.user!.id, req.params.id, req.body));
  }),
  removeNote: asyncHandler(async (req, res) => {
    res.json(await applicationsService.removeNote(req.user!.id, req.params.id, req.params.noteId));
  }),
};

export const applicationsRouter = Router();
applicationsRouter.use(requireAuth);
applicationsRouter.get("/", applicationsController.list);
applicationsRouter.post("/", validate({ body: createApplicationSchema }), applicationsController.create);
applicationsRouter.get("/:id", validate({ params: applicationIdParam }), applicationsController.get);
applicationsRouter.patch("/:id/status", validate({ params: applicationIdParam, body: updateStatusSchema }), applicationsController.updateStatus);
applicationsRouter.delete("/:id", validate({ params: applicationIdParam }), applicationsController.remove);
applicationsRouter.post("/:id/notes", validate({ params: applicationIdParam, body: noteSchema }), applicationsController.addNote);
applicationsRouter.delete("/:id/notes/:noteId", validate({ params: applicationNoteParam }), applicationsController.removeNote);

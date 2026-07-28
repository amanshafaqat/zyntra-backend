import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { avatarUpload } from "@/middlewares/upload.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { profileController } from "./profile.controller";
import { updateProfileSchema } from "./profile.dto";

import { asyncHandler } from "@/utils/async-handler";
import { ConsentService } from "./consent.service";
import { DraftService } from "./draft.service";

export const profileRouter = Router();

profileRouter.use(requireAuth);
profileRouter.get("/", profileController.get);
profileRouter.put("/", validate({ body: updateProfileSchema }), profileController.update);
profileRouter.get("/strength", profileController.strength);
profileRouter.post("/avatar", avatarUpload.single("avatar"), profileController.uploadAvatar);

// ── Extraction Consent ────────────────────────────────────────────────────────
profileRouter.get(
  "/consent",
  asyncHandler(async (req, res) => {
    res.json(await ConsentService.getConsent(req.user!.id));
  })
);

profileRouter.post(
  "/consent",
  asyncHandler(async (req, res) => {
    const { granted } = req.body;
    res.json(await ConsentService.updateConsent(req.user!.id, Boolean(granted)));
  })
);

// ── Profile Drafts ─────────────────────────────────────────────────────────────
profileRouter.post(
  "/drafts/generate",
  asyncHandler(async (req, res) => {
    const { documentIds } = req.body || {};
    res.json(await DraftService.generateDraft(req.user!.id, documentIds));
  })
);

profileRouter.get(
  "/drafts/current",
  asyncHandler(async (req, res) => {
    res.json(await DraftService.getCurrentDraft(req.user!.id));
  })
);

profileRouter.get(
  "/drafts/:id",
  asyncHandler(async (req, res) => {
    res.json(await DraftService.getDraftById(req.user!.id, req.params.id));
  })
);

profileRouter.patch(
  "/drafts/:id/suggestions",
  asyncHandler(async (req, res) => {
    const { updates } = req.body;
    res.json(await DraftService.updateSuggestions(req.user!.id, req.params.id, updates || []));
  })
);

profileRouter.post(
  "/drafts/:id/apply",
  asyncHandler(async (req, res) => {
    const { acceptedIds } = req.body || {};
    res.json(await DraftService.applyDraft(req.user!.id, req.params.id, acceptedIds || []));
  })
);

profileRouter.post(
  "/drafts/:id/discard",
  asyncHandler(async (req, res) => {
    res.json(await DraftService.discardDraft(req.user!.id, req.params.id));
  })
);


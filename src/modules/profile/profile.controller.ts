import { ApiError } from "@/utils/api-error";
import { asyncHandler } from "@/utils/async-handler";
import { profileService } from "./profile.service";

export const profileController = {
  get: asyncHandler(async (req, res) => {
    res.json(await profileService.get(req.user!.id));
  }),

  update: asyncHandler(async (req, res) => {
    res.json(await profileService.update(req.user!.id, req.body));
  }),

  strength: asyncHandler(async (req, res) => {
    res.json(await profileService.strength(req.user!.id));
  }),

  uploadAvatar: asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("Attach an image file in the avatar field.");
    res.json(await profileService.setAvatar(req.user!.id, req.file.filename));
  }),
};

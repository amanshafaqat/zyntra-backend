import fs from "node:fs/promises";
import path from "node:path";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { ApiError } from "@/utils/api-error";
import { cache } from "@/lib/cache";
import { toProfileDto, type ProfileDto } from "@/modules/auth/auth.serializer";
import { avatarDir } from "@/middlewares/upload.middleware";
import { profileRepository } from "./profile.repository";
import { buildStrengthReport, type StrengthReport } from "./profile.strength";
import type { UpdateProfileDto } from "./profile.dto";

export const profileService = {
  async get(userId: string): Promise<ProfileDto> {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) throw ApiError.notFound("Profile not found.");
    return toProfileDto(profile);
  },

  async update(userId: string, dto: UpdateProfileDto): Promise<ProfileDto> {
    const profile = await profileRepository.upsert(userId, dto);
    await cache.del(`reco:${userId}`);
    return toProfileDto(profile);
  },

  /**
   * SOP factor stays 0 until the SOP module lands in Part 2 — the report
   * shape and all nine factors are already final for the frontend.
   */
  async strength(userId: string): Promise<StrengthReport> {
    const profile = await this.get(userId);
    return buildStrengthReport(profile, false);
  },

  async setAvatar(userId: string, filename: string): Promise<{ avatarUrl: string }> {
    const previous = await profileRepository.getAvatar(userId);
    const relative = `/uploads/avatars/${filename}`;
    await profileRepository.setAvatar(userId, relative);

    // Best-effort cleanup of the replaced file.
    const prev = previous?.avatarUrl;
    if (prev && prev.startsWith("/uploads/avatars/")) {
      const prevPath = path.join(avatarDir, path.basename(prev));
      fs.unlink(prevPath).catch((err) => logger.warn({ err, prevPath }, "Could not remove old avatar"));
    }

    return { avatarUrl: `${env.PUBLIC_URL}${relative}` };
  },
};

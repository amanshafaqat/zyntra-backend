import type { Profile } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { UpdateProfileDto } from "./profile.dto";

export const profileRepository = {
  findByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({ where: { userId } });
  },

  upsert(userId: string, data: UpdateProfileDto): Promise<Profile> {
    return prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  },

  setAvatar(userId: string, avatarUrl: string): Promise<{ avatarUrl: string | null }> {
    return prisma.user.update({ where: { id: userId }, data: { avatarUrl }, select: { avatarUrl: true } });
  },

  getAvatar(userId: string): Promise<{ avatarUrl: string | null } | null> {
    return prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });
  },
};

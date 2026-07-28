import type { Prisma, TokenType, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { env } from "@/config/env";

export type UserWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>;

export const authRepository = {
  findByEmail(email: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({ where: { email }, include: { profile: true } });
  },

  findById(id: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({ where: { id }, include: { profile: true } });
  },

  createUser(data: { name: string; email: string; passwordHash: string }): Promise<UserWithProfile> {
    return prisma.user.create({
      data: { ...data, profile: { create: {} } },
      include: { profile: true },
    });
  },

  markVerified(id: string): Promise<UserWithProfile> {
    return prisma.user.update({ where: { id }, data: { verified: true }, include: { profile: true } });
  },

  updatePassword(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  updateName(id: string, name: string): Promise<UserWithProfile> {
    return prisma.user.update({ where: { id }, data: { name }, include: { profile: true } });
  },

  deleteUser(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  },

  // ── Verification / reset codes ────────────────────────────────────────────
  async issueCode(email: string, type: TokenType, codeHash: string): Promise<void> {
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { email, type } }),
      prisma.verificationToken.create({
        data: {
          email,
          type,
          codeHash,
          expiresAt: new Date(Date.now() + env.CODE_TTL_MINUTES * 60 * 1000),
        },
      }),
    ]);
  },

  findActiveCode(email: string, type: TokenType, codeHash: string) {
    return prisma.verificationToken.findFirst({
      where: { email, type, codeHash, consumedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  async consumeCode(id: string): Promise<void> {
    await prisma.verificationToken.update({ where: { id }, data: { consumedAt: new Date() } });
  },

  // ── Refresh tokens ────────────────────────────────────────────────────────
  async storeRefreshToken(data: {
    userId: string;
    tokenHash: string;
    userAgent?: string;
    ip?: string;
  }): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        ...data,
        expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
      },
    });
  },

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};

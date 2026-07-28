import type { NotificationKind, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toNotificationDto, type NotificationDto } from "@/modules/catalog/catalog.serializer";

export interface CreateNotificationInput {
  userId: string;
  kind: NotificationKind;
  text: string;
  href?: string;
}

export const notificationRepository = {
  listForUser(userId: string, limit = 60) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  create(data: CreateNotificationInput) {
    return prisma.notification.create({ data });
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  },

  async markOneRead(userId: string, id: string) {
    await prisma.notification.updateMany({ where: { userId, id }, data: { read: true } });
  },

  async pruneOldest(userId: string, keep: number) {
    // Retain the most recent `keep`; delete older rows to bound growth.
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: keep,
      select: { id: true },
    });
    if (rows.length === 0) return;
    await prisma.notification.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
  },

  createMany(data: Prisma.NotificationCreateManyInput[]) {
    return prisma.notification.createMany({ data });
  },
};

export const notificationService = {
  async list(userId: string): Promise<NotificationDto[]> {
    const rows = await notificationRepository.listForUser(userId);
    return rows.map(toNotificationDto);
  },

  async markAllRead(userId: string): Promise<void> {
    await notificationRepository.markAllRead(userId);
  },

  async markRead(userId: string, id: string): Promise<void> {
    await notificationRepository.markOneRead(userId, id);
  },

  async push(userId: string, kind: NotificationKind, text: string, href?: string): Promise<NotificationDto> {
    const created = await notificationRepository.create({ userId, kind, text, href });
    await notificationRepository.pruneOldest(userId, 60);
    return toNotificationDto(created);
  },
};

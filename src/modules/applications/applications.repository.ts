import type { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const include = {
  program: { include: { university: { include: { country: true } } } },
  notes: { orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.ApplicationInclude;

export const applicationsRepository = {
  listForUser(userId: string) {
    return prisma.application.findMany({
      where: { userId },
      include,
      orderBy: [{ program: { deadline: "asc" } }, { updatedAt: "desc" }],
    });
  },

  findById(userId: string, id: string) {
    return prisma.application.findFirst({ where: { id, userId }, include });
  },

  create(userId: string, programId: string, status: ApplicationStatus) {
    return prisma.application.create({
      data: { userId, programId, status },
      include,
    });
  },

  updateStatus(id: string, status: ApplicationStatus) {
    return prisma.application.update({ where: { id }, data: { status }, include });
  },

  delete(id: string) {
    return prisma.application.delete({ where: { id } });
  },

  addNote(applicationId: string, text: string) {
    return prisma.applicationNote.create({ data: { applicationId, text } });
  },

  deleteNote(id: string) {
    return prisma.applicationNote.delete({ where: { id } });
  },

  findExisting(userId: string, programId: string) {
    return prisma.application.findUnique({ where: { userId_programId: { userId, programId } } });
  },

  findUsersWithDeadlinesWithin(fromDays: number[]) {
    // Load every application whose deadline falls within `max(fromDays)` days,
    // then let the caller decide which thresholds to fire.
    const horizon = new Date(Date.now() + Math.max(...fromDays) * 24 * 60 * 60 * 1000);
    return prisma.application.findMany({
      where: {
        program: { deadline: { gte: new Date(), lte: horizon } },
        status: { notIn: ["ACCEPTED", "REJECTED"] },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        program: { include: { university: true } },
        reminders: { select: { threshold: true } },
      },
    });
  },

  recordReminder(applicationId: string, threshold: number) {
    return prisma.reminderSent.upsert({
      where: { applicationId_threshold: { applicationId, threshold } },
      update: {},
      create: { applicationId, threshold },
    });
  },
};

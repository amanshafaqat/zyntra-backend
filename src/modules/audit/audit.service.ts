import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jobQueue } from "@/lib/job-queue";
import { logger } from "@/config/logger";

export interface AuditEntryInput {
  actorId?: string | null;
  actorEmail?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  summary: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Prisma.InputJsonValue;
}

const JOB = "audit.write";

// Persist audit entries off the request path so logging never slows a response.
jobQueue.register<AuditEntryInput>(JOB, async (entry) => {
  await prisma.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      actorEmail: entry.actorEmail ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      summary: entry.summary,
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
      metadata: entry.metadata,
    },
  });
});

export const auditService = {
  /** Fire-and-forget audit record. */
  record(entry: AuditEntryInput): void {
    try {
      jobQueue.enqueue(JOB, entry);
    } catch (err) {
      logger.warn({ err }, "Failed to enqueue audit entry");
    }
  },

  async list(query: { page: number; pageSize: number; entity?: string; action?: AuditAction; actorId?: string }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;
    if (query.actorId) where.actorId = query.actorId;

    const [total, logs] = await prisma.$transaction([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return {
      total,
      page: query.page,
      pageSize: query.pageSize,
      logs: logs.map((l) => ({
        id: l.id,
        actorId: l.actorId,
        actorEmail: l.actorEmail,
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        summary: l.summary,
        ip: l.ip,
        createdAt: l.createdAt.toISOString(),
      })),
    };
  },
};

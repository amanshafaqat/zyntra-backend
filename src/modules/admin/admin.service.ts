import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/cache";
import { ApiError } from "@/utils/api-error";
import { toUserDto } from "@/modules/auth/auth.serializer";
import { intakeLabelFor, slugify } from "../../../prisma/catalog-data";
import {
  statusToDb,
  statusToUi,
  toApplicationDto,
  toProgramEntry,
  toScholarshipDto,
  type ApplicationDto,
  type ProgramEntryDto,
  type ScholarshipDto,
} from "@/modules/catalog/catalog.serializer";
import type {
  AdminAppStatusDto,
  AdminListQuery,
  AdminUserStatusDto,
  ProgramBodyDto,
  ProgramUpdateDto,
  ScholarshipBodyDto,
  UniversityBodyDto,
} from "./admin.dto";

const programInclude = {
  university: { include: { country: true } },
} satisfies Prisma.ProgramInclude;

async function requireCountry(name: string) {
  const country = await prisma.country.findUnique({ where: { name } });
  if (!country) throw ApiError.badRequest(`Country “${name}” is not in the catalog.`);
  return country;
}

async function requireUniversity(name: string) {
  const uni = await prisma.university.findUnique({ where: { name } });
  if (!uni) throw ApiError.badRequest(`University “${name}” is not in the catalog.`);
  return uni;
}

/** Any catalog mutation invalidates cached countries and all recommendation sets. */
async function invalidateCatalogCaches(): Promise<void> {
  await Promise.all([cache.del("catalog:countries"), cache.delByPrefix("reco:")]);
}

export const adminService = {
  // ── Users ─────────────────────────────────────────────────────────────────
  async listUsers(query: AdminListQuery) {
    const where: Prisma.UserWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {};
    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { profile: true, _count: { select: { applications: true } } },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);
    return {
      total,
      page: query.page,
      pageSize: query.pageSize,
      users: users.map((u) => ({ ...toUserDto(u), status: u.status, applicationCount: u._count.applications })),
    };
  },

  async setUserStatus(id: string, dto: AdminUserStatusDto) {
    const exists = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!exists) throw ApiError.notFound("User not found.");
    if (exists.role === "admin") throw ApiError.forbidden("Admin accounts cannot be suspended.");
    const user = await prisma.user.update({
      where: { id },
      data: { status: dto.status },
      include: { profile: true },
    });
    if (dto.status === "suspended") await prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
    return { ...toUserDto(user), status: user.status };
  },

  async deleteUser(id: string) {
    const exists = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!exists) throw ApiError.notFound("User not found.");
    if (exists.role === "admin") throw ApiError.forbidden("Admin accounts cannot be deleted here.");
    await prisma.user.delete({ where: { id } });
  },

  // ── Universities ────────────────────────────────────────────────────────────
  async createUniversity(dto: UniversityBodyDto) {
    const country = await requireCountry(dto.countryName);
    const created = await prisma.university.create({
      data: {
        countryId: country.id,
        name: dto.name,
        city: dto.city,
        ranking: dto.ranking,
        ieltsMin: dto.ieltsMin,
        cgpaMin: dto.cgpaMin,
        description: dto.description,
      },
    });
    await invalidateCatalogCaches();
    return created;
  },

  async updateUniversity(id: string, dto: UniversityBodyDto) {
    const country = await requireCountry(dto.countryName);
    const exists = await prisma.university.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound("University not found.");
    const updated = await prisma.university.update({
      where: { id },
      data: {
        countryId: country.id,
        name: dto.name,
        city: dto.city,
        ranking: dto.ranking,
        ieltsMin: dto.ieltsMin,
        cgpaMin: dto.cgpaMin,
        description: dto.description,
      },
    });
    await invalidateCatalogCaches();
    return updated;
  },

  async deleteUniversity(id: string) {
    const exists = await prisma.university.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound("University not found.");
    await prisma.university.delete({ where: { id } }); // cascades programs
    await invalidateCatalogCaches();
  },

  // ── Programs ────────────────────────────────────────────────────────────────
  async createProgram(dto: ProgramBodyDto): Promise<ProgramEntryDto> {
    const uni = await requireUniversity(dto.universityName);
    const deadline = new Date(dto.deadline);
    const created = await prisma.program.create({
      data: {
        universityId: uni.id,
        name: dto.name,
        fee: dto.fee,
        deadline,
        intakeLabel: dto.intakeLabel || intakeLabelFor(deadline.toISOString()),
        slug: slugify(`${uni.name}-${dto.name}`),
        officialProgramUrl: dto.officialProgramUrl,
        officialApplicationUrl: dto.officialApplicationUrl,
        sourceUrl: dto.sourceUrl,
        lastVerifiedAt: dto.lastVerifiedAt ? new Date(dto.lastVerifiedAt) : dto.verificationStatus === "VERIFIED" ? new Date() : null,
        verificationStatus: dto.verificationStatus || "UNVERIFIED",
      },
      include: programInclude,
    });
    await invalidateCatalogCaches();
    return toProgramEntry(created);
  },

  async updateProgram(id: string, dto: ProgramUpdateDto): Promise<ProgramEntryDto> {
    const exists = await prisma.program.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound("Program not found.");
    const data: Prisma.ProgramUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.fee !== undefined) data.fee = dto.fee;
    if (dto.intakeLabel !== undefined) data.intakeLabel = dto.intakeLabel;
    if (dto.officialProgramUrl !== undefined) data.officialProgramUrl = dto.officialProgramUrl;
    if (dto.officialApplicationUrl !== undefined) data.officialApplicationUrl = dto.officialApplicationUrl;
    if (dto.sourceUrl !== undefined) data.sourceUrl = dto.sourceUrl;
    if (dto.lastVerifiedAt !== undefined) data.lastVerifiedAt = dto.lastVerifiedAt ? new Date(dto.lastVerifiedAt) : null;
    if (dto.verificationStatus !== undefined) data.verificationStatus = dto.verificationStatus;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.deadline !== undefined) {
      const deadline = new Date(dto.deadline);
      data.deadline = deadline;
      if (dto.intakeLabel === undefined) data.intakeLabel = intakeLabelFor(deadline.toISOString());
    }
    if (dto.universityName !== undefined) {
      const uni = await requireUniversity(dto.universityName);
      data.university = { connect: { id: uni.id } };
    }
    const updated = await prisma.program.update({ where: { id }, data, include: programInclude });
    await invalidateCatalogCaches();
    return toProgramEntry(updated);
  },

  async deleteProgram(id: string) {
    const exists = await prisma.program.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound("Program not found.");
    await prisma.program.delete({ where: { id } });
    await invalidateCatalogCaches();
  },

  // ── Scholarships ─────────────────────────────────────────────────────────────
  async createScholarship(dto: ScholarshipBodyDto): Promise<ScholarshipDto> {
    const created = await prisma.scholarship.create({
      data: { ...dto, deadline: new Date(dto.deadline) },
    });
    return toScholarshipDto(created);
  },

  async updateScholarship(id: string, dto: ScholarshipBodyDto): Promise<ScholarshipDto> {
    const exists = await prisma.scholarship.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound("Scholarship not found.");
    const updated = await prisma.scholarship.update({
      where: { id },
      data: { ...dto, deadline: new Date(dto.deadline) },
    });
    return toScholarshipDto(updated);
  },

  async deleteScholarship(id: string) {
    const exists = await prisma.scholarship.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound("Scholarship not found.");
    await prisma.scholarship.delete({ where: { id } });
  },

  // ── Applications (all users) ───────────────────────────────────────────────��─
  async listApplications(query: AdminListQuery) {
    const where: Prisma.ApplicationWhereInput = query.search
      ? {
          OR: [
            { user: { name: { contains: query.search, mode: "insensitive" } } },
            { user: { email: { contains: query.search, mode: "insensitive" } } },
            { program: { name: { contains: query.search, mode: "insensitive" } } },
            { program: { university: { name: { contains: query.search, mode: "insensitive" } } } },
          ],
        }
      : {};
    const [total, rows] = await prisma.$transaction([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          program: { include: { university: { include: { country: true } } } },
          notes: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);
    return {
      total,
      page: query.page,
      pageSize: query.pageSize,
      applications: rows.map((r) => ({
        ...toApplicationDto(r),
        user: r.user,
      })),
    };
  },

  async setApplicationStatus(id: string, dto: AdminAppStatusDto): Promise<ApplicationDto> {
    const exists = await prisma.application.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound("Application not found.");
    const updated = await prisma.application.update({
      where: { id },
      data: { status: statusToDb(dto.status) },
      include: {
        program: { include: { university: { include: { country: true } } } },
        notes: { orderBy: { createdAt: "desc" } },
      },
    });
    return toApplicationDto(updated);
  },

  async deleteApplication(id: string) {
    const exists = await prisma.application.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound("Application not found.");
    await prisma.application.delete({ where: { id } });
  },

  // ── Analytics / dashboard ─────────────────────────────────────────────────────
  async analytics() {
    const [users, verifiedUsers, applications, programs, universities, scholarships, documents, sopDrafts] =
      await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { verified: true } }),
        prisma.application.count(),
        prisma.program.count(),
        prisma.university.count(),
        prisma.scholarship.count(),
        prisma.document.count(),
        prisma.sopDraft.count(),
      ]);

    const [byStatusRaw, byCountryRaw, signups] = await Promise.all([
      prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.application.findMany({
        select: { program: { select: { university: { select: { country: { select: { name: true, flag: true } } } } } } },
      }),
      prisma.user.findMany({ select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
    ]);

    const applicationsByStatus = byStatusRaw.map((r) => ({
      status: statusToUi(r.status),
      count: r._count._all,
    }));

    const countryMap = new Map<string, { country: string; flag: string; count: number }>();
    for (const row of byCountryRaw) {
      const c = row.program.university.country;
      const entry = countryMap.get(c.name) ?? { country: c.name, flag: c.flag, count: 0 };
      entry.count += 1;
      countryMap.set(c.name, entry);
    }
    const applicationsByCountry = [...countryMap.values()].sort((a, b) => b.count - a.count);

    const signupMap = new Map<string, number>();
    for (const s of signups) {
      const key = `${s.createdAt.getUTCFullYear()}-${String(s.createdAt.getUTCMonth() + 1).padStart(2, "0")}`;
      signupMap.set(key, (signupMap.get(key) ?? 0) + 1);
    }
    const signupsByMonth = [...signupMap.entries()].map(([month, count]) => ({ month, count }));

    return {
      totals: {
        users,
        verifiedUsers,
        applications,
        programs,
        universities,
        scholarships,
        documents,
        sopDrafts,
      },
      applicationsByStatus,
      applicationsByCountry,
      signupsByMonth,
    };
  },
};

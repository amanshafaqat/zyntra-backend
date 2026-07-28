import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProgramFiltersDto, UpcomingDeadlinesQuery } from "./catalog.dto";

const programInclude = {
  university: { include: { country: true } },
} satisfies Prisma.ProgramInclude;

export const catalogRepository = {
  listCountries() {
    return prisma.country.findMany({
      orderBy: { name: "asc" },
      include: { universities: { include: { programs: true }, orderBy: { name: "asc" } } },
    });
  },

  listPrograms(filters: ProgramFiltersDto) {
    const where: Prisma.ProgramWhereInput = { isActive: true };
    const uniWhere: Prisma.UniversityWhereInput = {};

    if (filters.country) uniWhere.country = { name: filters.country };
    if (filters.maxIelts) uniWhere.ieltsMin = { lte: filters.maxIelts };
    if (filters.minRanking) uniWhere.ranking = { lte: filters.minRanking };
    if (Object.keys(uniWhere).length > 0) where.university = uniWhere;

    if (filters.program) where.name = filters.program;
    if (filters.search) {
      const q = filters.search;
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { university: { name: { contains: q, mode: "insensitive" } } },
        { university: { city: { contains: q, mode: "insensitive" } } },
      ];
    }

    return prisma.$transaction([
      prisma.program.count({ where }),
      prisma.program.findMany({
        where,
        include: programInclude,
        orderBy: [{ university: { ranking: "asc" } }, { name: "asc" } as const],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    ]);
  },

  /** Post-fetch cost filter — feePKR is derived, not stored. */
  findAllForRecommendations() {
    return prisma.program.findMany({
      where: { isActive: true },
      include: programInclude,
      orderBy: [{ university: { ranking: "asc" } }],
    });
  },

  findProgramBySlug(slug: string) {
    return prisma.program.findUnique({ where: { slug }, include: programInclude });
  },

  findProgramById(id: string) {
    return prisma.program.findUnique({ where: { id }, include: programInclude });
  },

  upcomingDeadlines(query: UpcomingDeadlinesQuery) {
    const now = new Date();
    const to = new Date(Date.now() + query.withinDays * 24 * 60 * 60 * 1000);
    return prisma.program.findMany({
      where: { deadline: { gte: now, lte: to } },
      include: programInclude,
      orderBy: { deadline: "asc" },
      take: query.limit,
    });
  },

  listScholarships(country?: string) {
    return prisma.scholarship.findMany({
      where: country && country !== "All" ? { country } : undefined,
      orderBy: { deadline: "asc" },
    });
  },

  // ── Saved programs ────────────────────────────────────────────────────────
  listSavedIds(userId: string) {
    return prisma.savedProgram.findMany({
      where: { userId },
      select: { program: { select: { slug: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async isSaved(userId: string, programId: string) {
    const row = await prisma.savedProgram.findUnique({ where: { userId_programId: { userId, programId } } });
    return !!row;
  },

  saveProgram(userId: string, programId: string) {
    return prisma.savedProgram.create({ data: { userId, programId } });
  },

  unsaveProgram(userId: string, programId: string) {
    return prisma.savedProgram.delete({ where: { userId_programId: { userId, programId } } });
  },
};

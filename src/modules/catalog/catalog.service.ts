import { ApiError } from "@/utils/api-error";
import { cache } from "@/lib/cache";
import { profileService } from "@/modules/profile/profile.service";
import { catalogRepository } from "./catalog.repository";
import type { ProgramFiltersDto, UpcomingDeadlinesQuery } from "./catalog.dto";
import { scoreProgram, type RecommendationDto } from "./matching";
import {
  toCountryDto,
  toProgramEntry,
  toScholarshipDto,
  type CountryDto,
  type ProgramEntryDto,
  type ScholarshipDto,
} from "./catalog.serializer";

export const catalogService = {
  async listOptions(): Promise<{
    programs: string[];
    universities: string[];
    countries: string[];
  }> {
    return cache.remember("catalog:options", 3600, async () => {
      const allPrograms = await catalogRepository.findAllForRecommendations();
      const programNames = Array.from(new Set(allPrograms.map((p) => p.name))).sort();
      const universityNames = Array.from(new Set(allPrograms.map((p) => p.university.name))).sort();
      const countryNames = Array.from(new Set(allPrograms.map((p) => p.university.country.name))).sort();
      return {
        programs: programNames,
        universities: universityNames,
        countries: countryNames,
      };
    });
  },

  async listCountries(): Promise<CountryDto[]> {
    return cache.remember("catalog:countries", 3600, async () => {
      const rows = await catalogRepository.listCountries();
      return rows.map(toCountryDto);
    });
  },

  async listPrograms(filters: ProgramFiltersDto): Promise<{
    total: number;
    page: number;
    pageSize: number;
    programs: ProgramEntryDto[];
  }> {
    const [total, rows] = await catalogRepository.listPrograms(filters);
    let programs = rows.map(toProgramEntry);
    if (filters.maxFeePKR !== undefined) {
      programs = programs.filter((p) => p.feePKR <= filters.maxFeePKR!);
    }
    return { total, page: filters.page, pageSize: filters.pageSize, programs };
  },

  async getProgram(slug: string): Promise<ProgramEntryDto> {
    const row = await catalogRepository.findProgramBySlug(slug);
    if (!row) throw ApiError.notFound("Program not found.");
    return toProgramEntry(row);
  },

  async getProgramWithRecommendation(slug: string, userId: string): Promise<RecommendationDto> {
    const row = await catalogRepository.findProgramBySlug(slug);
    if (!row) throw ApiError.notFound("Program not found.");
    const [profile, strength] = await Promise.all([profileService.get(userId), profileService.strength(userId)]);
    return scoreProgram(toProgramEntry(row), profile, strength);
  },

  async upcomingDeadlines(query: UpcomingDeadlinesQuery): Promise<ProgramEntryDto[]> {
    const rows = await catalogRepository.upcomingDeadlines(query);
    return rows.map(toProgramEntry);
  },

  async listScholarships(country?: string): Promise<ScholarshipDto[]> {
    const rows = await catalogRepository.listScholarships(country);
    return rows.map(toScholarshipDto);
  },

  async listRecommendations(userId: string): Promise<RecommendationDto[]> {
    return cache.remember(`reco:${userId}`, 300, async () => {
      const [profile, strength, programs] = await Promise.all([
        profileService.get(userId),
        profileService.strength(userId),
        catalogRepository.findAllForRecommendations(),
      ]);
      return programs
        .map((p) => scoreProgram(toProgramEntry(p), profile, strength))
        .sort((a, b) => b.matchScore - a.matchScore);
    });
  },

  // ── Saved / bookmarks ─────────────────────────────────────────────────────
  async listSaved(userId: string): Promise<string[]> {
    const rows = await catalogRepository.listSavedIds(userId);
    return rows.map((r) => r.program.slug);
  },

  async toggleSaved(userId: string, programSlug: string): Promise<string[]> {
    const program = await catalogRepository.findProgramBySlug(programSlug);
    if (!program) throw ApiError.notFound("Program not found.");
    const already = await catalogRepository.isSaved(userId, program.id);
    if (already) await catalogRepository.unsaveProgram(userId, program.id);
    else await catalogRepository.saveProgram(userId, program.id);
    return this.listSaved(userId);
  },
};

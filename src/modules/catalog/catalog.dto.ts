import { z } from "zod";

export const programFiltersSchema = z.object({
  search: z.string().trim().optional(),
  country: z.string().trim().optional(),
  program: z.string().trim().optional(),
  maxFeePKR: z.coerce.number().int().nonnegative().optional(),
  minRanking: z.coerce.number().int().positive().optional(),
  maxIelts: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});
export type ProgramFiltersDto = z.infer<typeof programFiltersSchema>;

export const scholarshipFiltersSchema = z.object({
  country: z.string().trim().optional(),
});
export type ScholarshipFiltersDto = z.infer<typeof scholarshipFiltersSchema>;

export const upcomingDeadlinesQuerySchema = z.object({
  withinDays: z.coerce.number().int().min(1).max(365).default(120),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type UpcomingDeadlinesQuery = z.infer<typeof upcomingDeadlinesQuerySchema>;

export const toggleSavedSchema = z.object({
  programId: z.string().min(1, "programId is required"),
});
export type ToggleSavedDto = z.infer<typeof toggleSavedSchema>;

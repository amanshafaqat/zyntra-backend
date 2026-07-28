import { z } from "zod";

// ── Users ─────────────────────────────────────────────────────────────────────
export const adminUserStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});
export type AdminUserStatusDto = z.infer<typeof adminUserStatusSchema>;

// ── Universities ────────────────────────────────────────────────────────────��─
export const universityBodySchema = z.object({
  countryName: z.string().trim().min(1, "Country is required"),
  name: z.string().trim().min(2).max(160),
  city: z.string().trim().min(1).max(80),
  ranking: z.coerce.number().int().min(1).max(2000),
  ieltsMin: z.coerce.number().min(0).max(9),
  cgpaMin: z.coerce.number().min(0).max(4),
  description: z.string().trim().min(10).max(600),
});
export type UniversityBodyDto = z.infer<typeof universityBodySchema>;

const httpsUrlSchema = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .refine((u) => u.startsWith("https://") || u.startsWith("http://localhost"), {
    message: "URL must use HTTPS protocol",
  })
  .nullable()
  .optional();

// ── Programs ──────────────────────────────────────────────────────────────────
export const programBodySchema = z.object({
  universityName: z.string().trim().min(2),
  name: z.string().trim().min(2).max(120),
  fee: z.coerce.number().int().min(0).max(1_000_000),
  deadline: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: "Enter a valid deadline date" }),
  intakeLabel: z.string().trim().max(40).default(""),
  officialProgramUrl: httpsUrlSchema,
  officialApplicationUrl: httpsUrlSchema,
  sourceUrl: httpsUrlSchema,
  lastVerifiedAt: z
    .string()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: "Enter a valid date" })
    .nullable()
    .optional(),
  verificationStatus: z
    .enum(["VERIFIED", "PARTIALLY_VERIFIED", "SECONDARY_SOURCE", "MODELED", "UNVERIFIED", "STALE", "UNSUPPORTED"])
    .default("UNVERIFIED"),
  isActive: z.boolean().optional(),
});
export type ProgramBodyDto = z.infer<typeof programBodySchema>;

export const programUpdateSchema = programBodySchema.partial().extend({
  fee: z.coerce.number().int().min(0).max(1_000_000).optional(),
  isActive: z.boolean().optional(),
});
export type ProgramUpdateDto = z.infer<typeof programUpdateSchema>;

// ── Scholarships ────────────────────────────────────────────────────────────��─
export const scholarshipBodySchema = z.object({
  name: z.string().trim().min(2).max(160),
  country: z.string().trim().min(1),
  flag: z.string().trim().min(1).max(8),
  amount: z.string().trim().min(1).max(120),
  deadline: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: "Enter a valid deadline date" }),
  coverage: z.enum(["Full", "Partial"]),
  description: z.string().trim().min(10).max(600),
  eligiblePrograms: z.array(z.string().trim().min(1)).min(1, "List at least one eligible program"),
});
export type ScholarshipBodyDto = z.infer<typeof scholarshipBodySchema>;

// ── Applications (admin) ───────────────────────────────────────────────────────
export const adminAppStatusSchema = z.object({
  status: z.enum(["Not Started", "In Progress", "Submitted", "Decision Pending", "Accepted", "Rejected"]),
});
export type AdminAppStatusDto = z.infer<typeof adminAppStatusSchema>;

// ── Shared params / query ──────────────────────────────────────────────────────
export const idParam = z.object({ id: z.string().min(1) });

export const adminListQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;

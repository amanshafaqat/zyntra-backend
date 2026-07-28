import { z } from "zod";

const shortText = z.string().trim().max(120).default("");
const longText = z.string().trim().max(2000).default("");
const stringList = z.array(z.string().trim().min(1).max(200)).max(50).default([]);

const numericString = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || (!Number.isNaN(parseFloat(v)) && parseFloat(v) >= min && parseFloat(v) <= max), {
      message: `${label} must be between ${min} and ${max}`,
    });

/** Mirrors the frontend UserProfile shape (all fields present, strings for numerics). */
export const updateProfileSchema = z.object({
  degree: shortText,
  institution: shortText,
  cgpa: numericString("CGPA", 0, 4),
  graduationYear: z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || /^(19|20)\d{2}$/.test(v), { message: "Enter a valid 4-digit year" }),
  ielts: numericString("IELTS", 0, 9),
  toefl: numericString("TOEFL", 0, 120),
  pte: numericString("PTE", 10, 90),
  gre: numericString("GRE", 260, 340),
  gmat: numericString("GMAT", 200, 805),
  experience: longText,
  projects: stringList,
  certifications: stringList,
  research: longText,
  achievements: longText,
  extracurriculars: longText,
  leadership: longText,
  budgetPKR: z
    .string()
    .trim()
    .max(30)
    .default("")
    .refine((v) => v === "" || /\d/.test(v), { message: "Budget must contain a number" }),
  preferredCountries: stringList,
  preferredPrograms: stringList,
  careerGoals: longText,
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

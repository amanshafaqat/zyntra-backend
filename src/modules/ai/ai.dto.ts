import { z } from "zod";

export const explainRecommendationSchema = z.object({
  programId: z.string().min(1, "programId is required"),
});
export type ExplainRecommendationDto = z.infer<typeof explainRecommendationSchema>;

export const gapAnalysisSchema = z.object({
  programId: z.string().min(1, "programId is required"),
});
export type GapAnalysisDto = z.infer<typeof gapAnalysisSchema>;

export const generateSopSchema = z.object({
  university: z.string().trim().min(1, "University is required"),
  program: z.string().trim().min(1, "Program is required"),
  highlights: z.string().trim().max(1500).optional(),
});
export type AiGenerateSopDto = z.infer<typeof generateSopSchema>;

export const improveSopSchema = z.object({
  content: z.string().trim().min(40, "Provide at least a paragraph to improve").max(20000),
  instruction: z.string().trim().max(400).optional(),
  university: z.string().trim().max(160).optional(),
  program: z.string().trim().max(120).optional(),
});
export type ImproveSopDto = z.infer<typeof improveSopSchema>;

export const careerGuidanceSchema = z.object({
  question: z.string().trim().max(500).optional(),
});
export type CareerGuidanceDto = z.infer<typeof careerGuidanceSchema>;

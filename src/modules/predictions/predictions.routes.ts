import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { ApiError } from "@/utils/api-error";
import { mlService } from "@/lib/ml-service";
import { profileService } from "@/modules/profile/profile.service";
import { catalogRepository } from "@/modules/catalog/catalog.repository";
import { toProgramEntry, type ProgramEntryDto } from "@/modules/catalog/catalog.serializer";
import { scoreProgram } from "@/modules/catalog/matching";
import type { ProfileDto } from "@/modules/auth/auth.serializer";
import type { StrengthReport } from "@/modules/profile/profile.strength";

// ── DTOs ──────────────────────────────────────────────────────────────────────
const predictSchema = z.object({ programId: z.string().min(1, "programId is required") });
const matchSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  country: z.string().trim().optional(),
});

const clamp = (n: number, min = 0, max = 100): number => Math.max(min, Math.min(max, Math.round(n)));

/** Recomputes the fit sub-scores matching matching.ts, feeding the ML model. */
function fitInputs(entry: ProgramEntryDto, p: ProfileDto, strength: StrengthReport) {
  const cgpa = parseFloat(p.cgpa) || 0;
  const ielts = parseFloat(p.ielts) || 0;
  const toefl = parseFloat(p.toefl) || 0;
  const academicFit = cgpa === 0 ? 30 : clamp(60 + (cgpa - entry.cgpaMin) * 45, 20, 100);
  const languageFit = ielts === 0 ? 30 : clamp(60 + (ielts - entry.ieltsMin) * 35, 20, 100);
  return {
    cgpa,
    ielts,
    toefl,
    strengthOverall: strength.overall,
    cgpaMin: entry.cgpaMin,
    ieltsMin: entry.ieltsMin,
    ranking: entry.ranking,
    academicFit,
    languageFit,
  };
}

export const predictionService = {
  async predictAdmission(userId: string, programSlug: string) {
    const program = await catalogRepository.findProgramBySlug(programSlug);
    if (!program) throw ApiError.notFound("Program not found.");
    const [profile, strength] = await Promise.all([profileService.get(userId), profileService.strength(userId)]);
    const entry = toProgramEntry(program);
    const prediction = await mlService.predict(fitInputs(entry, profile, strength));
    return {
      programId: entry.id,
      university: entry.university,
      program: entry.program,
      readinessScore: prediction.admissionProbability,
      admissionProbability: prediction.admissionProbability,
      readinessDisclaimer: "Rule-based estimate using your profile and published program requirements.",
      confidence: prediction.confidence,
      source: prediction.source,
    };
  },

  /**
   * University matching service: scores every program locally, then refines the
   * readiness score of the top candidates through the ML model.
   */
  async match(userId: string, limit: number, country?: string) {
    const [profile, strength, programs] = await Promise.all([
      profileService.get(userId),
      profileService.strength(userId),
      catalogRepository.findAllForRecommendations(),
    ]);

    let scored = programs
      .map((p) => scoreProgram(toProgramEntry(p), profile, strength))
      .sort((a, b) => b.matchScore - a.matchScore);
    if (country && country !== "All") scored = scored.filter((s) => s.country === country);

    const top = scored.slice(0, limit);
    const refined = await Promise.all(
      top.map(async (rec) => {
        const prediction = await mlService.predict(fitInputs(rec, profile, strength));
        return {
          programId: rec.id,
          university: rec.university,
          program: rec.program,
          country: rec.country,
          flag: rec.flag,
          matchScore: rec.matchScore,
          readinessScore: prediction.admissionProbability,
          admissionProbability: prediction.admissionProbability,
          readinessDisclaimer: "Rule-based estimate using your profile and published program requirements.",
          confidence: prediction.confidence,
          source: prediction.source,
        };
      }),
    );

    return { total: scored.length, source: mlService.isEnabled ? "ml-service" : "local-model", matches: refined };
  },
};

const predictionController = {
  status: asyncHandler(async (_req, res) => {
    res.json({ mlServiceEnabled: mlService.isEnabled });
  }),
  admission: asyncHandler(async (req, res) => {
    res.json(await predictionService.predictAdmission(req.user!.id, req.body.programId));
  }),
  match: asyncHandler(async (req, res) => {
    const { limit, country } = req.query as unknown as { limit: number; country?: string };
    res.json(await predictionService.match(req.user!.id, limit, country));
  }),
};

export const predictionsRouter = Router();
predictionsRouter.use(requireAuth);
predictionsRouter.get("/status", predictionController.status);
predictionsRouter.post("/admission", validate({ body: predictSchema }), predictionController.admission);
predictionsRouter.get("/match", validate({ query: matchSchema }), predictionController.match);

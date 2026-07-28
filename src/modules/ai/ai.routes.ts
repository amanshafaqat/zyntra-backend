import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { prisma } from "@/lib/prisma";
import { aiService } from "./ai.service";
import {
  careerGuidanceSchema,
  explainRecommendationSchema,
  gapAnalysisSchema,
  generateSopSchema,
  improveSopSchema,
} from "./ai.dto";

const aiController = {
  status: asyncHandler(async (_req, res) => {
    res.json({ mode: aiService.mode() });
  }),
  explain: asyncHandler(async (req, res) => {
    res.json(await aiService.explainRecommendation(req.user!.id, req.body.programId));
  }),
  gapAnalysis: asyncHandler(async (req, res) => {
    res.json(await aiService.gapAnalysis(req.user!.id, req.body.programId));
  }),
  generateSop: asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { name: true } });
    res.json(await aiService.generateSop(req.user!.id, user?.name ?? "Applicant", req.body));
  }),
  improveSop: asyncHandler(async (req, res) => {
    res.json(await aiService.improveSop(req.body));
  }),
  careerGuidance: asyncHandler(async (req, res) => {
    res.json(await aiService.careerGuidance(req.user!.id, req.body));
  }),
};

export const aiRouter = Router();
aiRouter.use(requireAuth);
aiRouter.get("/status", aiController.status);
aiRouter.post("/recommendation-explanation", validate({ body: explainRecommendationSchema }), aiController.explain);
aiRouter.post("/gap-analysis", validate({ body: gapAnalysisSchema }), aiController.gapAnalysis);
aiRouter.post("/sop/generate", validate({ body: generateSopSchema }), aiController.generateSop);
aiRouter.post("/sop/improve", validate({ body: improveSopSchema }), aiController.improveSop);
aiRouter.post("/career-guidance", validate({ body: careerGuidanceSchema }), aiController.careerGuidance);

import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { ApiError } from "@/utils/api-error";
import { asyncHandler } from "@/utils/async-handler";
import { prisma } from "@/lib/prisma";
import { profileService } from "@/modules/profile/profile.service";
import type { ProfileDto } from "@/modules/auth/auth.serializer";
import { toSopDto, type SopDraftDto } from "@/modules/catalog/catalog.serializer";

// ── DTOs ──────────────────────────────────────────────────────────────────────
export const generateSopSchema = z.object({
  university: z.string().trim().min(1, "University is required"),
  program: z.string().trim().min(1, "Program is required"),
  highlights: z.string().trim().max(1500).optional(),
});
export type GenerateSopDto = z.infer<typeof generateSopSchema>;

export const saveSopSchema = z.object({
  content: z.string().trim().min(1, "SOP content cannot be empty").max(20000),
});
export type SaveSopDto = z.infer<typeof saveSopSchema>;

export const sopIdParam = z.object({ id: z.string().min(1) });

// ── Template (exact port of the frontend buildSopTemplate) ─────────────────────
function buildSopTemplate(
  university: string,
  program: string,
  p: ProfileDto,
  name: string,
  highlights?: string,
): string {
  const degree = p.degree || "my undergraduate degree in computing";
  const cgpa = p.cgpa ? ` with a CGPA of ${p.cgpa}` : "";
  const exp = p.experience
    ? `Professionally, ${p.experience.trim().replace(/\.$/, "")}. This experience taught me how theory behaves under real constraints and sharpened my collaboration and delivery skills.`
    : "Alongside my studies, I invested in practical projects that pushed me beyond coursework and taught me how software behaves under real constraints.";
  const proj =
    p.projects.filter(Boolean).length > 0
      ? `Projects such as ${p.projects.filter(Boolean).slice(0, 2).join(" and ")} let me apply these ideas end to end — from problem framing to deployment.`
      : "";
  const research = p.research
    ? `My research exposure — ${p.research.trim().replace(/\.$/, "")} — convinced me that I want an environment where inquiry is part of the curriculum.`
    : "";
  const goals = p.careerGoals
    ? p.careerGoals.trim().replace(/\.$/, "")
    : "to build intelligent systems that solve high-impact problems and to contribute to Pakistan's growing technology ecosystem";
  const extra = highlights?.trim() ? `\n\n${highlights.trim()}` : "";

  return `Dear Admissions Committee,

My decision to pursue ${program} at ${university} is the deliberate next step in a path I began with ${degree}${cgpa}. What started as curiosity about how software shapes decisions has matured into a focused ambition: ${goals}.

During my undergraduate studies I built a strong foundation in algorithms, software systems, and applied mathematics. ${proj} ${exp}

${research ? research + "\n\n" : ""}${university} stands out to me for the way its ${program} curriculum connects rigorous fundamentals with applied work, and for a research culture that rewards initiative. I am confident I can contribute to seminars, group projects, and the wider student community — and that the program will give me the depth I currently lack.${extra}

I would be honoured to join ${university} and to bring the same persistence to your program that has carried me this far.

Sincerely,
${name}`;
}

// ── Repository ────────────────────────────────────────────────────────────────
const sopRepository = {
  listForUser(userId: string) {
    return prisma.sopDraft.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  },
  findOwned(userId: string, id: string) {
    return prisma.sopDraft.findFirst({ where: { id, userId } });
  },
  create(data: { userId: string; university: string; program: string; content: string }) {
    return prisma.sopDraft.create({ data });
  },
  updateContent(id: string, content: string) {
    return prisma.sopDraft.update({ where: { id }, data: { content } });
  },
  delete(id: string) {
    return prisma.sopDraft.delete({ where: { id } });
  },
};

// ── Service ───────────────────────────────────────────────────────────────────
export const sopService = {
  async list(userId: string): Promise<SopDraftDto[]> {
    return (await sopRepository.listForUser(userId)).map(toSopDto);
  },

  async get(userId: string, id: string): Promise<SopDraftDto> {
    const draft = await sopRepository.findOwned(userId, id);
    if (!draft) throw ApiError.notFound("Draft not found.");
    return toSopDto(draft);
  },

  async generate(userId: string, name: string, dto: GenerateSopDto): Promise<SopDraftDto> {
    const profile = await profileService.get(userId);
    const content = buildSopTemplate(dto.university, dto.program, profile, name, dto.highlights);
    const created = await sopRepository.create({
      userId,
      university: dto.university,
      program: dto.program,
      content,
    });
    return toSopDto(created);
  },

  async save(userId: string, id: string, content: string): Promise<SopDraftDto> {
    const draft = await sopRepository.findOwned(userId, id);
    if (!draft) throw ApiError.notFound("Draft not found.");
    return toSopDto(await sopRepository.updateContent(id, content));
  },

  async remove(userId: string, id: string): Promise<void> {
    const draft = await sopRepository.findOwned(userId, id);
    if (!draft) throw ApiError.notFound("Draft not found.");
    await sopRepository.delete(id);
  },
};

// ── HTTP layer ────────────────────────────────────────────────────────────────
const sopController = {
  list: asyncHandler(async (req, res) => {
    res.json(await sopService.list(req.user!.id));
  }),
  get: asyncHandler(async (req, res) => {
    res.json(await sopService.get(req.user!.id, req.params.id));
  }),
  generate: asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { name: true } });
    res.status(201).json(await sopService.generate(req.user!.id, user?.name ?? "Applicant", req.body));
  }),
  save: asyncHandler(async (req, res) => {
    res.json(await sopService.save(req.user!.id, req.params.id, req.body.content));
  }),
  remove: asyncHandler(async (req, res) => {
    await sopService.remove(req.user!.id, req.params.id);
    res.json({ message: "Draft deleted." });
  }),
};

export const sopRouter = Router();
sopRouter.use(requireAuth);
sopRouter.get("/", sopController.list);
sopRouter.post("/generate", validate({ body: generateSopSchema }), sopController.generate);
sopRouter.get("/:id", validate({ params: sopIdParam }), sopController.get);
sopRouter.put("/:id", validate({ params: sopIdParam, body: saveSopSchema }), sopController.save);
sopRouter.delete("/:id", validate({ params: sopIdParam }), sopController.remove);

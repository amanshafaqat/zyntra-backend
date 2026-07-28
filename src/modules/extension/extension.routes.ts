import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { requireExtensionAuth } from "@/middlewares/extension-auth.middleware";
import { authLimiter } from "@/middlewares/rate-limit.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { ApiError } from "@/utils/api-error";
import { signExtensionToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { authRepository } from "@/modules/auth/auth.repository";
import { toUserDto } from "@/modules/auth/auth.serializer";
import { profileService } from "@/modules/profile/profile.service";
import { catalogService } from "@/modules/catalog/catalog.service";
import { applicationsService } from "@/modules/applications/applications.service";
import { catalogRepository } from "@/modules/catalog/catalog.repository";
import { toProgramEntry } from "@/modules/catalog/catalog.serializer";

// ── DTOs ──────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// ── Autofill field mapping ──────────────────────────────────────────────────────
interface AutofillField {
  key: string;
  label: string;
  value: string;
  ready: boolean;
}

function buildAutofill(
  user: { name: string; email: string },
  profile: Awaited<ReturnType<typeof profileService.get>>,
): { fields: AutofillField[]; readyCount: number; totalCount: number } {
  const fields: AutofillField[] = [
    { key: "fullName", label: "Full name", value: user.name, ready: !!user.name },
    { key: "email", label: "Email", value: user.email, ready: !!user.email },
    { key: "degree", label: "Degree", value: profile.degree, ready: !!profile.degree },
    { key: "institution", label: "Institution", value: profile.institution, ready: !!profile.institution },
    { key: "cgpa", label: "CGPA", value: profile.cgpa, ready: !!profile.cgpa },
    { key: "graduationYear", label: "Graduation year", value: profile.graduationYear, ready: !!profile.graduationYear },
    { key: "ielts", label: "IELTS", value: profile.ielts, ready: !!profile.ielts },
    { key: "careerGoals", label: "Statement / goals", value: profile.careerGoals, ready: !!profile.careerGoals },
  ];
  const readyCount = fields.filter((f) => f.ready).length;
  return { fields, readyCount, totalCount: fields.length };
}

// ── Service ───────────────────────────────────────────────────────────────────
export const extensionService = {
  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw ApiError.unauthorized("No account exists with this email.");
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Incorrect password.");
    if (user.status === "suspended") throw ApiError.forbidden("This account has been suspended.");
    if (!user.verified) throw ApiError.forbidden("Verify your account in the Zyntra app first.");

    const token = signExtensionToken(user.id);
    return { token, user: toUserDto(user) };
  },

  async session(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) throw ApiError.unauthorized("This account no longer exists.");
    const profile = await profileService.get(userId);
    const strength = await profileService.strength(userId);
    const autofill = buildAutofill(user, profile);
    return {
      user: toUserDto(user),
      completion: strength.completion,
      autofill: { readyCount: autofill.readyCount, totalCount: autofill.totalCount },
    };
  },

  async profileSummary(userId: string) {
    const [profile, strength] = await Promise.all([profileService.get(userId), profileService.strength(userId)]);
    return {
      degree: profile.degree,
      institution: profile.institution,
      cgpa: profile.cgpa,
      ielts: profile.ielts,
      completion: strength.completion,
      readiness: strength.overall,
    };
  },

  async autofill(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    if (!user) throw ApiError.unauthorized("This account no longer exists.");
    const profile = await profileService.get(userId);
    return buildAutofill(user, profile);
  },

  async savedUniversities(userId: string) {
    const slugs = await catalogService.listSaved(userId);
    const rows = await Promise.all(slugs.map((slug) => catalogRepository.findProgramBySlug(slug)));
    return rows
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .map(toProgramEntry)
      .map((p) => ({
        programId: p.id,
        university: p.university,
        program: p.program,
        country: p.country,
        flag: p.flag,
        deadline: p.deadline,
        portal: p.portal,
      }));
  },

  async savedApplications(userId: string) {
    const apps = await applicationsService.list(userId);
    return apps.map((a) => ({
      id: a.id,
      programId: a.programId,
      university: a.university,
      program: a.program,
      country: a.country,
      flag: a.flag,
      status: a.status,
      deadline: a.deadline,
    }));
  },

  /** One call that hydrates the whole extension popup, for background sync. */
  async sync(userId: string) {
    const [session, autofill, savedUniversities, savedApplications] = await Promise.all([
      this.session(userId),
      this.autofill(userId),
      this.savedUniversities(userId),
      this.savedApplications(userId),
    ]);
    // `session` carries a summary autofill; replace it with the full field map.
    return { ...session, autofill, savedUniversities, savedApplications, syncedAt: new Date().toISOString() };
  },
};

// ── HTTP layer ────────────────────────────────────────────────────────────────
const extensionController = {
  login: asyncHandler(async (req, res) => {
    res.json(await extensionService.login(req.body.email, req.body.password));
  }),
  session: asyncHandler(async (req, res) => {
    res.json(await extensionService.session(req.user!.id));
  }),
  profile: asyncHandler(async (req, res) => {
    res.json(await extensionService.profileSummary(req.user!.id));
  }),
  autofill: asyncHandler(async (req, res) => {
    res.json(await extensionService.autofill(req.user!.id));
  }),
  savedUniversities: asyncHandler(async (req, res) => {
    res.json(await extensionService.savedUniversities(req.user!.id));
  }),
  savedApplications: asyncHandler(async (req, res) => {
    res.json(await extensionService.savedApplications(req.user!.id));
  }),
  sync: asyncHandler(async (req, res) => {
    res.json(await extensionService.sync(req.user!.id));
  }),
  logout: asyncHandler(async (_req, res) => {
    // Extension tokens are stateless and short-lived; the client discards it.
    res.json({ message: "Signed out of the extension." });
  }),
};

export const extensionRouter = Router();
extensionRouter.post("/auth/login", authLimiter, validate({ body: loginSchema }), extensionController.login);
extensionRouter.post("/auth/logout", extensionController.logout);
extensionRouter.get("/session", requireExtensionAuth, extensionController.session);
extensionRouter.get("/profile", requireExtensionAuth, extensionController.profile);
extensionRouter.get("/autofill", requireExtensionAuth, extensionController.autofill);
extensionRouter.get("/saved-universities", requireExtensionAuth, extensionController.savedUniversities);
extensionRouter.get("/saved-applications", requireExtensionAuth, extensionController.savedApplications);
extensionRouter.get("/sync", requireExtensionAuth, extensionController.sync);

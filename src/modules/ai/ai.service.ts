import { llm } from "@/lib/llm";
import { logger } from "@/config/logger";
import { ApiError } from "@/utils/api-error";
import type { ProfileDto } from "@/modules/auth/auth.serializer";
import { profileService } from "@/modules/profile/profile.service";
import { catalogRepository } from "@/modules/catalog/catalog.repository";
import { toProgramEntry } from "@/modules/catalog/catalog.serializer";
import { scoreProgram, type RecommendationDto } from "@/modules/catalog/matching";
import type { AiGenerateSopDto, CareerGuidanceDto, ImproveSopDto } from "./ai.dto";

const SYSTEM_ADVISOR =
  "You are Zyntra's admissions advisor for Pakistani students applying to Master's programs in Germany, Australia, Ireland, Italy and Finland. Be specific, encouraging, honest about gaps, and concise. Never invent universities, fees or deadlines beyond what the user provides.";

async function loadScored(userId: string, programSlug: string): Promise<{ rec: RecommendationDto; profile: ProfileDto }> {
  const program = await catalogRepository.findProgramBySlug(programSlug);
  if (!program) throw ApiError.notFound("Program not found.");
  const [profile, strength] = await Promise.all([profileService.get(userId), profileService.strength(userId)]);
  return { rec: scoreProgram(toProgramEntry(program), profile, strength), profile };
}

const AI_DISCLAIMER =
  "AI-generated guidance. Always verify official requirements and deadlines directly on the university portal.";

export const aiService = {
  /** Whether responses are AI-generated or deterministic templates (surfaced to the UI). */
  mode(): "claude" | "groq" | "template" {
    return llm.mode;
  },

  async explainRecommendation(userId: string, programSlug: string) {
    const { rec } = await loadScored(userId, programSlug);
    const prompt = `Explain in 3-4 short sentences why this program fits the student.
Program: ${rec.program} at ${rec.university}, ${rec.country}.
Match score: ${rec.matchScore}/100. Academic readiness score: ${rec.readinessScore}/100.
Key reasons: ${rec.reasons.join("; ")}.
Requirements — CGPA min ${rec.cgpaMin}, IELTS min ${rec.ieltsMin}, ranking ${rec.ranking}, annual fee ${rec.fee} ${rec.currency}.`;

    const explanation = await this.tryClaude(prompt, () => templateExplanation(rec));
    return {
      programId: rec.id,
      matchScore: rec.matchScore,
      readinessScore: rec.readinessScore,
      admissionProbability: rec.readinessScore, // deprecated alias
      explanation,
      mode: this.mode(),
      disclaimer: AI_DISCLAIMER,
    };
  },

  async gapAnalysis(userId: string, programSlug: string) {
    const { rec } = await loadScored(userId, programSlug);
    const unmet = rec.gaps.filter((g) => !g.met);
    const prompt = `A student is applying to ${rec.program} at ${rec.university}.
These requirement gaps are unmet: ${unmet.map((g) => `${g.label} (needs ${g.required}, has ${g.yours})`).join("; ") || "none — all core requirements met"}.
For each gap, give one concrete, realistic action a Pakistani applicant can take in the next few months. Keep each to one sentence. If there are no gaps, give two ways to strengthen the application further.`;

    const advice = await this.tryClaude(prompt, () => templateGapAdvice(rec));
    return { programId: rec.id, gaps: rec.gaps, advice, mode: this.mode(), disclaimer: AI_DISCLAIMER };
  },

  async generateSop(userId: string, name: string, dto: AiGenerateSopDto) {
    const profile = await profileService.get(userId);
    const prompt = `Write a compelling ~500 word Statement of Purpose for ${name}, applying to ${dto.program} at ${dto.university}.
Use only these facts:
Degree: ${profile.degree || "undergraduate computing degree"}; CGPA: ${profile.cgpa || "n/a"}; IELTS: ${profile.ielts || "n/a"}.
Experience: ${profile.experience || "n/a"}.
Projects: ${profile.projects.join(", ") || "n/a"}.
Research: ${profile.research || "n/a"}.
Career goals: ${profile.careerGoals || "build impactful software"}.
${dto.highlights ? `Emphasise: ${dto.highlights}` : ""}
Write in first person, no placeholders, ready to submit.`;

    const content = await this.tryClaude(prompt, () => templateSop(dto, profile, name), 1600);
    return { university: dto.university, program: dto.program, content, mode: this.mode(), disclaimer: AI_DISCLAIMER };
  },

  async improveSop(dto: ImproveSopDto) {
    const focus = dto.instruction?.trim() || "clarity, structure, specificity and a confident tone";
    const context = dto.university && dto.program ? ` The target is ${dto.program} at ${dto.university}.` : "";
    const prompt = `Improve the following Statement of Purpose, focusing on ${focus}.${context}
Keep the author's facts and voice; do not invent achievements. Return only the improved SOP.

---
${dto.content}`;

    const content = await this.tryClaude(prompt, () => templateImprove(dto), 1800);
    return { content, mode: this.mode(), disclaimer: AI_DISCLAIMER };
  },

  async careerGuidance(userId: string, dto: CareerGuidanceDto) {
    const profile = await profileService.get(userId);
    const strength = await profileService.strength(userId);
    const question = dto.question?.trim() || "What should I focus on to maximise my chances of admission and a strong tech career abroad?";
    const prompt = `A Pakistani student asks: "${question}"
Their profile — degree: ${profile.degree || "n/a"}, CGPA: ${profile.cgpa || "n/a"}, IELTS: ${profile.ielts || "n/a"}, readiness score ${strength.overall}/100, weakest area: ${strength.weakest.label}.
Preferred countries: ${profile.preferredCountries.join(", ") || "open"}. Goals: ${profile.careerGoals || "n/a"}.
Give focused, actionable guidance in 4-6 sentences.`;

    const guidance = await this.tryClaude(prompt, () => templateCareer(profile, strength.overall, strength.weakest.label, question));
    return {
      guidance,
      weakestArea: strength.weakest.label,
      readiness: strength.overall,
      mode: this.mode(),
      disclaimer: AI_DISCLAIMER,
    };
  },

  /** Runs LLM when enabled, otherwise the provided template fn. Never throws on AI failure. */
  async tryClaude(prompt: string, fallback: () => string, maxTokens?: number): Promise<string> {
    if (!llm.isEnabled) return fallback();
    try {
      return await llm.complete({ system: SYSTEM_ADVISOR, messages: [{ role: "user", content: prompt }], maxTokens });
    } catch (err) {
      logger.warn({ err }, `${llm.mode.toUpperCase()} call failed; using template fallback`);
      return fallback();
    }
  },
};

// ── Deterministic fallbacks (used offline / in the FYP demo) ────────────────────
function templateExplanation(rec: RecommendationDto): string {
  const prob =
    rec.readinessScore >= 70 ? "a strong academic fit" : rec.readinessScore >= 45 ? "a realistic fit" : "a reach, but achievable";
  return `${rec.program} at ${rec.university} scores ${rec.matchScore}/100 for your profile, with an academic readiness score of ${rec.readinessScore}/100 (${prob}). ${rec.reasons.slice(0, 2).join(". ")}. With a QS ranking near ${rec.ranking} and an annual tuition of ${rec.fee} ${rec.currency}, it balances quality and cost well for an international applicant from Pakistan.`;
}

function templateGapAdvice(rec: RecommendationDto): string {
  const unmet = rec.gaps.filter((g) => !g.met);
  if (unmet.length === 0) {
    return "You meet the core requirements. Strengthen your application further by (1) adding a well-documented project with a live demo, and (2) securing a strong academic reference that speaks to your research potential.";
  }
  return unmet.map((g, i) => `${i + 1}. ${g.label}: ${g.advice}`).join(" ");
}

function templateSop(dto: AiGenerateSopDto, p: ProfileDto, name: string): string {
  const degree = p.degree || "my undergraduate degree in computing";
  const cgpa = p.cgpa ? ` with a CGPA of ${p.cgpa}` : "";
  const exp = p.experience
    ? `Professionally, ${p.experience.trim().replace(/\.$/, "")}. This taught me how theory behaves under real constraints.`
    : "Alongside my studies I built practical projects that pushed me beyond coursework.";
  const proj = p.projects.filter(Boolean).length
    ? `Projects such as ${p.projects.filter(Boolean).slice(0, 2).join(" and ")} let me apply these ideas end to end.`
    : "";
  const goals = p.careerGoals?.trim().replace(/\.$/, "") || "build intelligent systems that solve high-impact problems";
  const extra = dto.highlights?.trim() ? `\n\n${dto.highlights.trim()}` : "";
  return `Dear Admissions Committee,

My decision to pursue ${dto.program} at ${dto.university} is the deliberate next step in a path I began with ${degree}${cgpa}. What began as curiosity about how software shapes decisions has matured into a focused ambition: ${goals}.

During my studies I built a strong foundation in algorithms, software systems and applied mathematics. ${proj} ${exp}

${dto.university} stands out for the way its ${dto.program} curriculum connects rigorous fundamentals with applied work. I am confident I can contribute to its seminars, projects and community.${extra}

I would be honoured to join ${dto.university} and bring the same persistence to your program that has carried me this far.

Sincerely,
${name}`;
}

function templateImprove(dto: ImproveSopDto): string {
  // Offline improvement: tighten whitespace, ensure paragraphing and a closing.
  const cleaned = dto.content.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const hasClosing = /sincerely|regards|yours faithfully/i.test(cleaned);
  return hasClosing ? cleaned : `${cleaned}\n\nSincerely,\nThe Applicant`;
}

function templateCareer(p: ProfileDto, readiness: number, weakest: string, _question: string): string {
  const country = p.preferredCountries[0] || "your target country";
  return `Your current readiness score is ${readiness}/100, and your weakest area is ${weakest}. Prioritise that first: concrete, measurable improvements there move your admission odds the most. For ${country}, aim to clear the language and CGPA thresholds of your shortlisted programs, then differentiate with one or two substantial projects and a focused Statement of Purpose. Apply to a balanced mix of reach, match and safe programs rather than only the most competitive. Finally, start your document and scholarship preparation early — deadlines cluster between September and March, and strong applications are rarely assembled at the last minute.`;
}

import type { ProfileDto } from "@/modules/auth/auth.serializer";
import type { StrengthReport } from "@/modules/profile/profile.strength";
import type { ProgramEntryDto } from "./catalog.serializer";

/**
 * Exact port of the frontend scoring formula (src/lib/matching.ts) so the
 * backend never disagrees with the UI. Any tuning here must be mirrored there.
 */

export interface GapItemDto {
  label: string;
  required: string;
  yours: string;
  met: boolean;
  advice: string;
}

export interface RecommendationDto extends ProgramEntryDto {
  matchScore: number;
  readinessScore: number;
  /** @deprecated Use readinessScore instead. Retained for backward compatibility. */
  admissionProbability: number;
  readinessDisclaimer: string;
  gaps: GapItemDto[];
  reasons: string[];
}

const clamp = (n: number, min = 0, max = 100): number => Math.max(min, Math.min(max, Math.round(n)));

function parseBudgetPKR(raw: string): number | null {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return parseInt(digits, 10);
}

export function scoreProgram(entry: ProgramEntryDto, p: ProfileDto, strength: StrengthReport): RecommendationDto {
  const cgpa = parseFloat(p.cgpa) || 0;
  const ielts = parseFloat(p.ielts) || 0;
  const toefl = parseFloat(p.toefl) || 0;
  const budget = parseBudgetPKR(p.budgetPKR);
  const totalCostPKR = entry.feePKR + entry.livingCostMonthly * entry.pkrRate * 12;

  const gaps: GapItemDto[] = [
    {
      label: "CGPA",
      required: `${entry.cgpaMin.toFixed(1)} / 4.0`,
      yours: p.cgpa ? `${cgpa.toFixed(2)} / 4.0` : "Not provided",
      met: cgpa >= entry.cgpaMin,
      advice: cgpa >= entry.cgpaMin
        ? "Your CGPA meets this program's cutoff."
        : "A strong research profile and relevant experience can offset a borderline CGPA.",
    },
    {
      label: "IELTS",
      required: `${entry.ieltsMin.toFixed(1)}+`,
      yours: p.ielts ? ielts.toFixed(1) : p.toefl ? `TOEFL ${p.toefl}` : "Not provided",
      met: ielts >= entry.ieltsMin || toefl >= 79,
      advice: ielts >= entry.ieltsMin
        ? "Your language score clears the requirement."
        : `Book an IELTS retake targeting ${entry.ieltsMin.toFixed(1)} or convert an equivalent TOEFL score.`,
    },
    {
      label: "Annual budget",
      required: `≈ PKR ${totalCostPKR.toLocaleString()}`,
      yours: budget ? `PKR ${budget.toLocaleString()}` : "Not provided",
      met: budget === null ? false : budget >= totalCostPKR * 0.6,
      advice: "Tuition plus living cost. Scholarships and part-time work rights can close a moderate gap.",
    },
  ];

  const academicFit = cgpa === 0 ? 30 : clamp(60 + (cgpa - entry.cgpaMin) * 45, 20, 100);
  const languageFit = ielts === 0 ? 30 : clamp(60 + (ielts - entry.ieltsMin) * 35, 20, 100);
  const budgetFit =
    budget === null ? 55 : clamp(100 - Math.max(0, (totalCostPKR - budget) / Math.max(budget, 1)) * 120, 15, 100);
  const prefCountry =
    p.preferredCountries.length === 0 ? 70 : p.preferredCountries.includes(entry.country) ? 100 : 35;
  const prefProgram =
    p.preferredPrograms.length === 0 ? 70 : p.preferredPrograms.includes(entry.program) ? 100 : 40;

  const matchScore = Math.round(
    academicFit * 0.3 + languageFit * 0.2 + budgetFit * 0.2 + prefCountry * 0.15 + prefProgram * 0.15,
  );

  const selectivity = entry.ranking <= 300 ? 0.72 : entry.ranking <= 500 ? 0.82 : 0.9;
  const readinessScore = Math.round(
    clamp((academicFit * 0.45 + languageFit * 0.25 + strength.overall * 0.3) * selectivity, 5, 95),
  );
  const readinessDisclaimer =
    "Rule-based estimate using your profile and published program requirements. This is guidance, not a guarantee of admission.";

  const reasons: string[] = [];
  if (prefCountry === 100) reasons.push(`${entry.country} is in your preferred countries`);
  if (prefProgram === 100) reasons.push(`${entry.program} matches your preferred field`);
  if (cgpa >= entry.cgpaMin && cgpa > 0) reasons.push("Your CGPA clears the admission cutoff");
  if (ielts >= entry.ieltsMin && ielts > 0) reasons.push("Language requirement already met");
  if (budgetFit >= 80 && budget !== null) reasons.push("Total yearly cost fits your budget");
  if (entry.feePKR < 500_000) reasons.push("Very low tuition for international students");
  if (reasons.length === 0) reasons.push("Complete more of your profile to sharpen this match");

  return {
    ...entry,
    matchScore,
    readinessScore,
    admissionProbability: readinessScore,
    readinessDisclaimer,
    gaps,
    reasons: reasons.slice(0, 4),
  };
}

import type { ProfileDto } from "@/modules/auth/auth.serializer";

/**
 * Exact port of the frontend's 9-factor readiness formula
 * (src/lib/matching.ts) so both sides always agree:
 * CGPA 25% · Language 15% · Experience 15% · Projects 10% · Certifications 10%
 * · Research 10% · Achievements 5% · Leadership 5% · SOP 5%.
 */

export interface StrengthFactor {
  key: string;
  label: string;
  weight: number;
  score: number;
  tip: string;
}

export interface StrengthReport {
  overall: number;
  factors: StrengthFactor[];
  weakest: StrengthFactor;
  completion: number;
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

function textScore(text: string, full = 150): number {
  const len = text.trim().length;
  if (len === 0) return 0;
  return clamp(20 + (len / full) * 80);
}

function languageScore(p: ProfileDto): number {
  const ielts = parseFloat(p.ielts);
  if (!Number.isNaN(ielts)) return clamp(((ielts - 5.0) / 3.0) * 100);
  const toefl = parseFloat(p.toefl);
  if (!Number.isNaN(toefl)) return clamp(((toefl - 60) / 60) * 100);
  const pte = parseFloat(p.pte);
  if (!Number.isNaN(pte)) return clamp(((pte - 42) / 48) * 100);
  return 0;
}

export function buildStrengthReport(p: ProfileDto, sopSaved: boolean): StrengthReport {
  const cgpa = parseFloat(p.cgpa);
  const factors: StrengthFactor[] = [
    { key: "cgpa", label: "CGPA", weight: 0.25, score: Number.isNaN(cgpa) ? 0 : clamp(((cgpa - 2.0) / 2.0) * 100), tip: "Most partner universities require 2.6–3.1. A verified transcript strengthens this factor." },
    { key: "language", label: "Language Proficiency", weight: 0.15, score: languageScore(p), tip: "IELTS 7.0+ or TOEFL 100+ is preferred by most universities in the dataset." },
    { key: "experience", label: "Experience", weight: 0.15, score: textScore(p.experience), tip: "Even 6–12 months of relevant internship or work experience helps significantly." },
    { key: "projects", label: "Projects", weight: 0.1, score: clamp(p.projects.filter(Boolean).length * 25), tip: "Add GitHub links and deployment URLs to substantiate your projects." },
    { key: "certifications", label: "Certifications", weight: 0.1, score: clamp(p.certifications.filter(Boolean).length * 30), tip: "AWS, Google and Coursera specialisations from top universities count well." },
    { key: "research", label: "Research", weight: 0.1, score: textScore(p.research, 180), tip: "Publishing even one conference paper can raise this score by 30+ points." },
    { key: "achievements", label: "Achievements", weight: 0.05, score: textScore(p.achievements, 120), tip: "Hackathon wins, competitions and academic honours all count." },
    { key: "leadership", label: "Leadership", weight: 0.05, score: textScore(p.leadership, 120), tip: "President or head roles in societies and student bodies are strong signals." },
    { key: "sop", label: "SOP Quality", weight: 0.05, score: sopSaved ? 80 : 0, tip: "A focused, well-structured SOP with a clear narrative dramatically improves this." },
  ];

  const overall = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));
  const weakest = [...factors].sort((a, b) => a.score - b.score)[0];

  const fields = [p.degree, p.institution, p.cgpa, p.graduationYear, p.ielts || p.toefl || p.pte, p.experience, p.budgetPKR, p.careerGoals];
  const listFields = [p.projects.length > 0, p.certifications.length > 0, p.preferredCountries.length > 0, p.preferredPrograms.length > 0];
  const completion = Math.round(
    ((fields.filter((f) => f && f.trim()).length + listFields.filter(Boolean).length) / (fields.length + listFields.length)) * 100,
  );

  return { overall, factors, weakest, completion };
}

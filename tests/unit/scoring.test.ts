import { describe, expect, it } from "vitest";
import { buildStrengthReport } from "@/modules/profile/profile.strength";
import { scoreProgram } from "@/modules/catalog/matching";
import type { ProfileDto } from "@/modules/auth/auth.serializer";
import type { ProgramEntryDto } from "@/modules/catalog/catalog.serializer";

const emptyProfile = (): ProfileDto => ({
  degree: "", institution: "", cgpa: "", graduationYear: "",
  ielts: "", toefl: "", pte: "", gre: "", gmat: "",
  experience: "", projects: [], certifications: [], research: "",
  achievements: "", extracurriculars: "", leadership: "",
  budgetPKR: "", preferredCountries: [], preferredPrograms: [], careerGoals: "",
});

const strongProfile = (): ProfileDto => ({
  ...emptyProfile(),
  degree: "BS Software Engineering",
  institution: "UMT",
  cgpa: "3.60",
  graduationYear: "2026",
  ielts: "7.5",
  experience: "Two years of backend engineering at a fintech, building payment services in Node.js and Postgres.",
  projects: ["Zyntra platform", "OCR pipeline", "Ride sharing app"],
  certifications: ["AWS Cloud Practitioner", "Deep Learning Specialization"],
  research: "Co-authored a workshop paper on low-resource Urdu text recognition and extended the dataset.",
  achievements: "Winner of the UMT hackathon and four semesters on the Dean's List.",
  leadership: "Led a four-person FYP team and the computing society events wing for a year.",
  budgetPKR: "6,000,000",
  preferredCountries: ["Germany"],
  preferredPrograms: ["MSc Computer Science"],
  careerGoals: "Applied machine learning research in Europe.",
});

const program = (over: Partial<ProgramEntryDto> = {}): ProgramEntryDto => ({
  id: "tum-mscs",
  university: "University of Passau",
  city: "Passau",
  country: "Germany",
  flag: "🇩🇪",
  currency: "EUR",
  pkrRate: 305,
  program: "MSc Computer Science",
  fee: 500,
  feePKR: 152_500,
  livingCostMonthly: 950,
  ieltsMin: 6.5,
  cgpaMin: 2.8,
  ranking: 801,
  deadline: "2026-10-01",
  description: "Strong computer science program.",
  portal: "DAAD",
  intakeLabel: "Fall 2027",
  verificationStatus: "UNVERIFIED",
  ...over,
});

describe("buildStrengthReport", () => {
  it("returns zero overall and zero completion for an empty profile", () => {
    const report = buildStrengthReport(emptyProfile(), false);
    expect(report.overall).toBe(0);
    expect(report.completion).toBe(0);
    expect(report.factors).toHaveLength(9);
  });

  it("weights the nine documented factors to exactly 1.0", () => {
    const report = buildStrengthReport(emptyProfile(), false);
    const total = report.factors.reduce((sum, f) => sum + f.weight, 0);
    expect(total).toBeCloseTo(1.0, 6);
  });

  it("scores a strong profile highly and reports full completion", () => {
    const report = buildStrengthReport(strongProfile(), true);
    expect(report.overall).toBeGreaterThan(60);
    expect(report.completion).toBe(100);
  });

  it("identifies the weakest factor", () => {
    const profile = { ...strongProfile(), research: "" };
    const report = buildStrengthReport(profile, true);
    expect(report.weakest.score).toBeLessThanOrEqual(
      Math.min(...report.factors.map((f) => f.score)) + 0.001,
    );
  });

  it("awards the SOP factor only when a draft is saved", () => {
    const without = buildStrengthReport(strongProfile(), false);
    const with_ = buildStrengthReport(strongProfile(), true);
    expect(with_.overall).toBeGreaterThan(without.overall);
  });

  it("falls back from IELTS to TOEFL to PTE for the language factor", () => {
    const toeflOnly = { ...emptyProfile(), toefl: "100" };
    const pteOnly = { ...emptyProfile(), pte: "70" };
    const lang = (p: ProfileDto) => buildStrengthReport(p, false).factors.find((f) => f.key === "language")!.score;
    expect(lang(toeflOnly)).toBeGreaterThan(0);
    expect(lang(pteOnly)).toBeGreaterThan(0);
    expect(lang(emptyProfile())).toBe(0);
  });
});

describe("scoreProgram", () => {
  it("clamps readiness score into the documented 5–95 band and provides a disclaimer", () => {
    const strength = buildStrengthReport(emptyProfile(), false);
    const rec = scoreProgram(program(), emptyProfile(), strength);
    expect(rec.readinessScore).toBeGreaterThanOrEqual(5);
    expect(rec.readinessScore).toBeLessThanOrEqual(95);
    expect(rec.admissionProbability).toBe(rec.readinessScore);
    expect(rec.readinessDisclaimer).toContain("Rule-based estimate");
  });

  it("marks CGPA and IELTS gaps as met for a qualified applicant", () => {
    const profile = strongProfile();
    const strength = buildStrengthReport(profile, true);
    const rec = scoreProgram(program(), profile, strength);
    const cgpaGap = rec.gaps.find((g) => g.label === "CGPA")!;
    const ieltsGap = rec.gaps.find((g) => g.label === "IELTS")!;
    expect(cgpaGap.met).toBe(true);
    expect(ieltsGap.met).toBe(true);
  });

  it("flags unmet requirements for an under-qualified applicant", () => {
    const profile = { ...emptyProfile(), cgpa: "2.20", ielts: "5.5" };
    const strength = buildStrengthReport(profile, false);
    const rec = scoreProgram(program(), profile, strength);
    expect(rec.gaps.find((g) => g.label === "CGPA")!.met).toBe(false);
    expect(rec.gaps.find((g) => g.label === "IELTS")!.met).toBe(false);
  });

  it("rewards a preferred country and program with a higher match score", () => {
    const base = { ...strongProfile(), preferredCountries: [], preferredPrograms: [] };
    const preferred = strongProfile();
    const strength = buildStrengthReport(preferred, true);
    const scoreBase = scoreProgram(program(), base, strength).matchScore;
    const scorePreferred = scoreProgram(program(), preferred, strength).matchScore;
    expect(scorePreferred).toBeGreaterThan(scoreBase);
  });

  it("gives a more selective university a lower readiness score, all else equal", () => {
    const profile = strongProfile();
    const strength = buildStrengthReport(profile, true);
    const elite = scoreProgram(program({ ranking: 100 }), profile, strength).readinessScore;
    const accessible = scoreProgram(program({ ranking: 800 }), profile, strength).readinessScore;
    expect(elite).toBeLessThan(accessible);
  });

  it("always returns at least one reason", () => {
    const strength = buildStrengthReport(emptyProfile(), false);
    const rec = scoreProgram(program(), emptyProfile(), strength);
    expect(rec.reasons.length).toBeGreaterThan(0);
    expect(rec.reasons.length).toBeLessThanOrEqual(4);
  });
});

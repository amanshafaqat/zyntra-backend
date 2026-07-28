import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import bcrypt from "bcrypt";
import { createApp } from "@/app";
import { prisma } from "@/lib/prisma";
import { env } from "@/config/env";

const API = env.API_PREFIX;
const EMAIL = "phase1.user@zyntra.test";
const ADMIN_EMAIL = "phase1.admin@zyntra.test";
const PASSWORD = "TestPassw0rd!";

let app: Express;
let userToken = "";
let adminToken = "";
let sampleProgramId = "";
let sampleProgramSlug = "";

async function seedUser(email: string, role: "user" | "admin") {
  const passwordHash = await bcrypt.hash(PASSWORD, env.BCRYPT_ROUNDS);
  return prisma.user.upsert({
    where: { email },
    update: { passwordHash, role, verified: true, status: "active" },
    create: { email, name: role === "admin" ? "Phase1 Admin" : "Phase1 User", passwordHash, role, verified: true, profile: { create: {} } },
  });
}

beforeAll(async () => {
  app = createApp();
  await seedUser(EMAIL, "user");
  await seedUser(ADMIN_EMAIL, "admin");

  const userRes = await request(app).post(`${API}/auth/login`).send({ email: EMAIL, password: PASSWORD });
  userToken = userRes.body.accessToken;

  const adminRes = await request(app).post(`${API}/auth/login`).send({ email: ADMIN_EMAIL, password: PASSWORD });
  adminToken = adminRes.body.accessToken;

  const prog = await prisma.program.findFirst({ select: { id: true, slug: true } });
  if (!prog) throw new Error("Catalog is not seeded — run seed before running tests.");
  sampleProgramId = prog.id;
  sampleProgramSlug = prog.slug;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [EMAIL, ADMIN_EMAIL] } } });
  await prisma.$disconnect();
});

describe("Phase 1: Catalog Options API", () => {
  it("returns database-derived options for programs, universities, and countries", async () => {
    const res = await request(app).get(`${API}/catalog/options`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.programs)).toBe(true);
    expect(Array.isArray(res.body.universities)).toBe(true);
    expect(Array.isArray(res.body.countries)).toBe(true);
    expect(res.body.programs.length).toBeGreaterThan(0);
    expect(res.body.universities.length).toBeGreaterThan(0);
    expect(res.body.countries.length).toBeGreaterThan(0);
  });
});

describe("Phase 1: Scoring Terminology & Compatibility", () => {
  it("exposes readinessScore and readinessDisclaimer on recommendation endpoints", async () => {
    const res = await request(app)
      .get(`${API}/catalog/programs/${sampleProgramSlug}/recommendation`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.readinessScore).toBeDefined();
    expect(typeof res.body.readinessScore).toBe("number");
    expect(res.body.readinessScore).toBeGreaterThanOrEqual(5);
    expect(res.body.readinessScore).toBeLessThanOrEqual(95);
    expect(res.body.readinessDisclaimer).toContain("Rule-based estimate");
    expect(res.body.admissionProbability).toBe(res.body.readinessScore); // Deprecated alias check
  });

  it("returns readinessScore for all recommended programs in deterministic order", async () => {
    const res = await request(app)
      .get(`${API}/catalog/recommendations`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    const first = res.body[0];
    expect(first.readinessScore).toBeDefined();
    expect(first.admissionProbability).toBe(first.readinessScore);
  });
});

describe("Phase 1: Program URL Schema & Admin HTTPS Validation", () => {
  it("includes URL and verification fields in catalog program response", async () => {
    const res = await request(app).get(`${API}/catalog/programs/${sampleProgramSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.verificationStatus).toBeDefined();
    expect(res.body.officialProgramUrl).toBeDefined();
  });

  it("allows admin to update program URLs with valid HTTPS URLs and verificationStatus", async () => {
    const res = await request(app)
      .patch(`${API}/admin/programs/${sampleProgramId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        officialProgramUrl: "https://passau.de/mscs",
        officialApplicationUrl: "https://passau.de/apply",
        sourceUrl: "https://passau.de/official",
        verificationStatus: "VERIFIED",
      });
    expect(res.status).toBe(200);
    expect(res.body.officialProgramUrl).toBe("https://passau.de/mscs");
    expect(res.body.officialApplicationUrl).toBe("https://passau.de/apply");
    expect(res.body.verificationStatus).toBe("VERIFIED");
  });

  it("rejects non-HTTPS external URLs with 422 validation error", async () => {
    const res = await request(app)
      .patch(`${API}/admin/programs/${sampleProgramId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        officialProgramUrl: "http://insecure-site.com/mscs",
      });
    expect(res.status).toBe(422);
  });

  it("prevents non-admin users from modifying program catalog fields", async () => {
    const res = await request(app)
      .patch(`${API}/admin/programs/${sampleProgramId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        officialProgramUrl: "https://hacker.com",
      });
    expect(res.status).toBe(403);
  });
});

describe("Phase 1: AI Output Transparency & Mode Labels", () => {
  it("surfaces AI disclaimers and offline template mode in AI responses", async () => {
    const res = await request(app)
      .post(`${API}/ai/gap-analysis`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ programId: sampleProgramSlug });
    expect(res.status).toBe(200);
    expect(res.body.disclaimer).toBeTruthy();
    expect(res.body.mode).toBe("template");
  });
});

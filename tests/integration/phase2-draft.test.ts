import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import bcrypt from "bcrypt";
import { createApp } from "@/app";
import { prisma } from "@/lib/prisma";
import { env } from "@/config/env";
import { documentsDir } from "@/modules/documents/documents.upload";

const API = env.API_PREFIX;
const EMAIL = "phase2.user@zyntra.test";
const OTHER_USER_EMAIL = "phase2.other@zyntra.test";
const PASSWORD = "TestPassw0rd!";

let app: Express;
let userToken = "";
let otherUserToken = "";
let docId = "";

async function seedUser(email: string) {
  const passwordHash = await bcrypt.hash(PASSWORD, env.BCRYPT_ROUNDS);
  return prisma.user.upsert({
    where: { email },
    update: { passwordHash, verified: true, status: "active" },
    create: { email, name: "Phase2 Test User", passwordHash, verified: true, profile: { create: { degree: "BS CS", cgpa: "3.2" } } },
  });
}

beforeAll(async () => {
  app = createApp();
  await seedUser(EMAIL);
  await seedUser(OTHER_USER_EMAIL);

  const u1 = await request(app).post(`${API}/auth/login`).send({ email: EMAIL, password: PASSWORD });
  userToken = u1.body.accessToken;

  const u2 = await request(app).post(`${API}/auth/login`).send({ email: OTHER_USER_EMAIL, password: PASSWORD });
  otherUserToken = u2.body.accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [EMAIL, OTHER_USER_EMAIL] } } });
  await prisma.$disconnect();
});

describe("Phase 2: Consent Management API", () => {
  it("defaults user extraction consent to false", async () => {
    const res = await request(app).get(`${API}/profile/consent`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.granted).toBe(false);
  });

  it("updates consent state for the authenticated user", async () => {
    const setRes = await request(app).post(`${API}/profile/consent`).set("Authorization", `Bearer ${userToken}`).send({ granted: true });
    expect(setRes.status).toBe(200);
    expect(setRes.body.granted).toBe(true);

    const getRes = await request(app).get(`${API}/profile/consent`).set("Authorization", `Bearer ${userToken}`);
    expect(getRes.body.granted).toBe(true);
  });
});

describe("Phase 2: Document Upload & Extraction Lifecycle", () => {
  it("uploads a document and automatically triggers text extraction", async () => {
    const tmpPdf = path.join(documentsDir, "integration-test-doc.pdf");
    fs.writeFileSync(
      tmpPdf,
      Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nBT\n(Degree: MSc Software Engineering. CGPA: 3.90. IELTS: 8.0.)\nET\n")
    );

    const res = await request(app)
      .post(`${API}/documents`)
      .set("Authorization", `Bearer ${userToken}`)
      .field("type", "Transcript")
      .attach("file", tmpPdf);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    docId = res.body.id;

    // Allow background trigger tick
    await new Promise((r) => setTimeout(r, 200));

    const extRes = await request(app)
      .get(`${API}/documents/${docId}/extraction`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(extRes.status).toBe(200);
    expect(extRes.body.status).toBe("EXTRACTED");
    expect(extRes.body.extractedText).toContain("MSc Software Engineering");
  });

  it("prevents another user from accessing extraction metadata", async () => {
    const res = await request(app)
      .get(`${API}/documents/${docId}/extraction`)
      .set("Authorization", `Bearer ${otherUserToken}`);
    expect(res.status).toBe(404);
  });
});

describe("Phase 2: Profile Draft Generation, Provenance & Transactional Apply", () => {
  let draftId = "";
  let suggestionId = "";

  it("generates a structured profile draft with provenance and conflict tags", async () => {
    const res = await request(app)
      .post(`${API}/profile/drafts/generate`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ documentIds: [docId] });

    expect(res.status).toBe(200);
    expect(res.body.id).toBeTruthy();
    expect(res.body.suggestions.length).toBeGreaterThan(0);
    draftId = res.body.id;

    const cgpaSuggestion = res.body.suggestions.find((s: { field: string }) => s.field === "cgpa");
    expect(cgpaSuggestion).toBeDefined();
    expect(cgpaSuggestion.state).toBe("CONFLICT"); // Existing profile has CGPA 3.2 vs proposed 3.90
    suggestionId = cgpaSuggestion.id;
  });

  it("accepts an edited suggestion and transactionally applies it to the Profile", async () => {
    // Update suggestion state to ACCEPTED
    await request(app)
      .patch(`${API}/profile/drafts/${draftId}/suggestions`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        updates: [{ id: suggestionId, state: "ACCEPTED", userEditedValue: "3.90" }],
      });

    // Apply draft
    const applyRes = await request(app)
      .post(`${API}/profile/drafts/${draftId}/apply`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ acceptedIds: [suggestionId] });

    expect(applyRes.status).toBe(200);
    expect(applyRes.body.profile.cgpa).toBe("3.90");
    expect(applyRes.body.strength.overall).toBeGreaterThan(0);
  });

  it("deleting the document cascades and removes dependent extractions & draft suggestions", async () => {
    await request(app).delete(`${API}/documents/${docId}`).set("Authorization", `Bearer ${userToken}`);

    const extRes = await prisma.documentExtraction.findUnique({ where: { documentId: docId } });
    expect(extRes).toBeNull();
  });
});

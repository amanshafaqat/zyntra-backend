import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import bcrypt from "bcrypt";
import { createApp } from "@/app";
import { prisma } from "@/lib/prisma";
import { env } from "@/config/env";

/**
 * Integration suite. Requires a reachable PostgreSQL instance (DATABASE_URL)
 * with the schema migrated:
 *   createdb zyntra_test && npx prisma migrate deploy
 * Every test seeds and cleans up its own rows, so the suite is re-runnable.
 */

const API = env.API_PREFIX;
const EMAIL = "integration.user@zyntra.test";
const ADMIN_EMAIL = "integration.admin@zyntra.test";
const PASSWORD = "TestPassw0rd!";

let app: Express;
let accessToken = "";
let adminToken = "";
let programSlug = "";

async function seedUser(email: string, role: "user" | "admin") {
  const passwordHash = await bcrypt.hash(PASSWORD, env.BCRYPT_ROUNDS);
  return prisma.user.upsert({
    where: { email },
    update: { passwordHash, role, verified: true, status: "active" },
    create: { email, name: role === "admin" ? "Test Admin" : "Test User", passwordHash, role, verified: true, profile: { create: {} } },
  });
}

beforeAll(async () => {
  app = createApp();
  await seedUser(EMAIL, "user");
  await seedUser(ADMIN_EMAIL, "admin");

  const program = await prisma.program.findFirst({ select: { slug: true } });
  if (!program) throw new Error("Catalog is not seeded — run `npm run seed` before the integration suite.");
  programSlug = program.slug;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [EMAIL, ADMIN_EMAIL] } } });
  await prisma.$disconnect();
});

describe("health", () => {
  it("reports database connectivity", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.database).toBe("up");
  });
});

describe("auth", () => {
  it("rejects login with a wrong password", async () => {
    const res = await request(app).post(`${API}/auth/login`).send({ email: EMAIL, password: "wrong-password" });
    expect(res.status).toBe(401);
    expect(res.body.message).toBeTruthy();
  });

  it("returns 422 with field errors on invalid input", async () => {
    const res = await request(app).post(`${API}/auth/login`).send({ email: "not-an-email", password: "" });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it("logs a verified user in and returns a session plus access token", async () => {
    const res = await request(app).post(`${API}/auth/login`).send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user.email).toBe(EMAIL);
    expect(res.body.profile).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
    accessToken = res.body.accessToken;

    const adminRes = await request(app).post(`${API}/auth/login`).send({ email: ADMIN_EMAIL, password: PASSWORD });
    adminToken = adminRes.body.accessToken;
  });

  it("sets an httpOnly refresh cookie", async () => {
    const res = await request(app).post(`${API}/auth/login`).send({ email: EMAIL, password: PASSWORD });
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((c) => c.startsWith("zyntra_refresh=") && c.includes("HttpOnly"))).toBe(true);
  });

  it("blocks a suspended account", async () => {
    await prisma.user.update({ where: { email: EMAIL }, data: { status: "suspended" } });
    const res = await request(app).post(`${API}/auth/login`).send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(403);
    await prisma.user.update({ where: { email: EMAIL }, data: { status: "active" } });
  });

  it("returns the session for a bearer token", async () => {
    const res = await request(app).get(`${API}/auth/session`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(EMAIL);
  });

  it("rejects an unauthenticated session request", async () => {
    const res = await request(app).get(`${API}/auth/session`);
    expect(res.status).toBe(401);
  });
});

describe("security middleware", () => {
  it("stamps a request id and API version on responses", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-request-id"]).toBeTruthy();
    expect(res.headers["x-api-version"]).toBeTruthy();
  });

  it("sanitizes HTML out of persisted input", async () => {
    const res = await request(app)
      .put(`${API}/profile`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ degree: "<script>x</script>BSSE", institution: "UMT", cgpa: "3.4" });
    expect(res.status).toBe(200);
    expect(res.body.degree).not.toContain("<script>");
  });

  it("returns 404 with a JSON body for unknown routes", async () => {
    const res = await request(app).get(`${API}/does-not-exist`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBeTruthy();
  });

  it("issues a CSRF token", async () => {
    const res = await request(app).get(`${API}/auth/csrf`);
    expect(res.status).toBe(200);
    expect(res.body.csrfToken).toHaveLength(64);
  });
});

describe("profile", () => {
  it("persists and returns a full profile", async () => {
    const res = await request(app)
      .put(`${API}/profile`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ degree: "BS Software Engineering", institution: "UMT", cgpa: "3.42", ielts: "7.0", preferredCountries: ["Germany"] });
    expect(res.status).toBe(200);
    expect(res.body.cgpa).toBe("3.42");
    expect(res.body.preferredCountries).toEqual(["Germany"]);
  });

  it("rejects an out-of-range CGPA", async () => {
    const res = await request(app)
      .put(`${API}/profile`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ cgpa: "9.9" });
    expect(res.status).toBe(422);
  });

  it("computes a strength report with nine factors", async () => {
    const res = await request(app).get(`${API}/profile/strength`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.factors).toHaveLength(9);
    expect(res.body.overall).toBeGreaterThanOrEqual(0);
  });
});

describe("catalog and recommendations", () => {
  it("lists the five documented countries", async () => {
    const res = await request(app).get(`${API}/catalog/countries`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body.every((c: { universities: unknown[] }) => c.universities.length === 5)).toBe(true);
  });

  it("filters programs by country", async () => {
    const res = await request(app).get(`${API}/catalog/programs?country=Germany&pageSize=100`);
    expect(res.status).toBe(200);
    expect(res.body.programs.every((p: { country: string }) => p.country === "Germany")).toBe(true);
  });

  it("returns 404 for an unknown program slug", async () => {
    const res = await request(app).get(`${API}/catalog/programs/not-a-real-program`);
    expect(res.status).toBe(404);
  });

  it("ranks recommendations by descending match score", async () => {
    const res = await request(app).get(`${API}/catalog/recommendations`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const scores = res.body.map((r: { matchScore: number }) => r.matchScore);
    expect(scores).toEqual([...scores].sort((a: number, b: number) => b - a));
  });

  it("toggles a saved program on and off", async () => {
    const on = await request(app).post(`${API}/catalog/saved/toggle`).set("Authorization", `Bearer ${accessToken}`).send({ programId: programSlug });
    expect(on.body).toContain(programSlug);
    const off = await request(app).post(`${API}/catalog/saved/toggle`).set("Authorization", `Bearer ${accessToken}`).send({ programId: programSlug });
    expect(off.body).not.toContain(programSlug);
  });
});

describe("applications", () => {
  let applicationId = "";

  it("creates an application for a real program", async () => {
    const res = await request(app).post(`${API}/applications`).set("Authorization", `Bearer ${accessToken}`).send({ programId: programSlug });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("Not Started");
    applicationId = res.body.id;
  });

  it("rejects a duplicate application with 409", async () => {
    const res = await request(app).post(`${API}/applications`).set("Authorization", `Bearer ${accessToken}`).send({ programId: programSlug });
    expect(res.status).toBe(409);
  });

  it("updates status and records a notification", async () => {
    const res = await request(app)
      .patch(`${API}/applications/${applicationId}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "Submitted" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Submitted");

    const notes = await request(app).get(`${API}/notifications`).set("Authorization", `Bearer ${accessToken}`);
    expect(notes.body.some((n: { kind: string }) => n.kind === "status")).toBe(true);
  });

  it("adds and removes a note", async () => {
    const added = await request(app).post(`${API}/applications/${applicationId}/notes`).set("Authorization", `Bearer ${accessToken}`).send({ text: "Requested a transcript." });
    expect(added.status).toBe(201);
    const noteId = added.body.notes[0].id;

    const removed = await request(app).delete(`${API}/applications/${applicationId}/notes/${noteId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(removed.status).toBe(200);
    expect(removed.body.notes).toHaveLength(0);
  });

  it("does not leak another user's application", async () => {
    const res = await request(app).get(`${API}/applications/${applicationId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it("deletes the application", async () => {
    const res = await request(app).delete(`${API}/applications/${applicationId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});

describe("browser extension APIs", () => {
  let extensionToken = "";

  it("issues an extension token on login", async () => {
    const res = await request(app).post(`${API}/extension/auth/login`).send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    extensionToken = res.body.token;
  });

  it("rejects a web access token on extension routes", async () => {
    const res = await request(app).get(`${API}/extension/session`).set("X-Extension-Token", accessToken);
    expect(res.status).toBe(401);
  });

  it("returns the popup session with the extension token", async () => {
    const res = await request(app).get(`${API}/extension/session`).set("X-Extension-Token", extensionToken);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(EMAIL);
    expect(res.body.autofill.totalCount).toBeGreaterThan(0);
  });

  it("returns an autofill field map", async () => {
    const res = await request(app).get(`${API}/extension/autofill`).set("X-Extension-Token", extensionToken);
    expect(res.status).toBe(200);
    expect(res.body.fields.some((f: { key: string }) => f.key === "fullName")).toBe(true);
    expect(res.body.readyCount).toBeLessThanOrEqual(res.body.totalCount);
  });

  it("hydrates the whole popup in one sync call", async () => {
    const res = await request(app).get(`${API}/extension/sync`).set("X-Extension-Token", extensionToken);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("savedUniversities");
    expect(res.body).toHaveProperty("savedApplications");
    expect(res.body).toHaveProperty("syncedAt");
  });

  it("rejects an unauthenticated extension request", async () => {
    const res = await request(app).get(`${API}/extension/autofill`);
    expect(res.status).toBe(401);
  });
});

describe("AI and predictions fallbacks", () => {
  it("reports template mode when no API key is configured", async () => {
    const res = await request(app).get(`${API}/ai/status`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe("template");
  });

  it("explains a recommendation without Claude configured", async () => {
    const res = await request(app).post(`${API}/ai/recommendation-explanation`).set("Authorization", `Bearer ${accessToken}`).send({ programId: programSlug });
    expect(res.status).toBe(200);
    expect(res.body.explanation.length).toBeGreaterThan(20);
  });

  it("predicts admission using the local model", async () => {
    const res = await request(app).post(`${API}/predictions/admission`).set("Authorization", `Bearer ${accessToken}`).send({ programId: programSlug });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe("local-model");
    expect(res.body.admissionProbability).toBeGreaterThanOrEqual(5);
  });
});

describe("admin RBAC", () => {
  it("denies a normal user access to admin routes", async () => {
    const res = await request(app).get(`${API}/admin/users`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
  });

  it("allows an admin to list users", async () => {
    const res = await request(app).get(`${API}/admin/users`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  it("refuses to suspend another admin", async () => {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: ADMIN_EMAIL } });
    const res = await request(app).patch(`${API}/admin/users/${admin.id}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "suspended" });
    expect(res.status).toBe(403);
  });

  it("returns analytics totals", async () => {
    const res = await request(app).get(`${API}/admin/analytics`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.totals.programs).toBe(59);
    expect(res.body.totals.universities).toBe(25);
  });

  it("writes an audit entry when an admin changes a user's status", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: EMAIL } });
    await request(app).patch(`${API}/admin/users/${user.id}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "suspended" });
    await request(app).patch(`${API}/admin/users/${user.id}/status`).set("Authorization", `Bearer ${adminToken}`).send({ status: "active" });

    // Audit writes are queued; give the queue a tick to drain.
    await new Promise((r) => setTimeout(r, 300));
    const res = await request(app).get(`${API}/admin/audit-logs?entity=user`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.logs.some((l: { action: string }) => l.action === "STATUS_CHANGE")).toBe(true);
  });
});

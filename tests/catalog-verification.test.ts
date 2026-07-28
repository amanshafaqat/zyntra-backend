import { describe, expect, it, beforeAll } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";

describe("Workstream 1 — Real Catalog & Verification API Tests", () => {
  let app: Express;

  beforeAll(async () => {
    app = createApp();
    const count = await prisma.program.count();
    expect(count).toBeGreaterThan(0);
  });

  it("should return options containing verified catalog programs and countries", async () => {
    const res = await request(app).get("/api/v1/catalog/options");
    expect(res.status).toBe(200);
    expect(res.body.programs).toBeDefined();
    expect(res.body.programs.length).toBeGreaterThan(0);
    expect(res.body.countries).toContain("Germany");
  });

  it("should return programs with official URLs and verification metadata", async () => {
    const res = await request(app).get("/api/v1/catalog/programs?page=1&pageSize=10");
    expect(res.status).toBe(200);
    expect(res.body.programs).toBeDefined();
    expect(res.body.programs.length).toBeGreaterThan(0);

    const prog = res.body.programs[0];
    expect(prog.officialProgramUrl).toBeDefined();
    expect(prog.verificationStatus).toBeDefined();
    expect(["VERIFIED", "PARTIALLY_VERIFIED", "MODELED", "UNVERIFIED"]).toContain(prog.verificationStatus);
  });

  it("should exclude inactive programs from public search", async () => {
    const target = await prisma.program.findUnique({ where: { slug: "passau-cs" } });
    if (target) {
      await prisma.program.update({ where: { id: target.id }, data: { isActive: false } });

      const res = await request(app).get("/api/v1/catalog/programs?search=Passau");
      expect(res.status).toBe(200);
      const found = res.body.programs.find((p: any) => p.id === "passau-cs");
      expect(found).toBeUndefined();

      // Re-enable passau-cs
      await prisma.program.update({ where: { id: target.id }, data: { isActive: true } });
    }
  });
});

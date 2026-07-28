import { describe, expect, it, beforeAll } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { GroundingValidator } from "../src/modules/chat/grounding.validator";
import type { ProgramEntryDto } from "../src/modules/catalog/catalog.serializer";

describe("Workstream 3 — Catalog-Grounded Counselling & Anti-Hallucination Tests", () => {
  let app: Express;
  const mockCandidates: ProgramEntryDto[] = [
    {
      id: "passau-cs",
      university: "University of Passau",
      city: "Passau",
      country: "Germany",
      flag: "🇩🇪",
      currency: "EUR",
      pkrRate: 325,
      program: "MSc Computer Science",
      fee: 0,
      feePKR: 0,
      livingCostMonthly: 992,
      ieltsMin: 5.5,
      cgpaMin: 2.8,
      ranking: 0,
      deadline: "2026-05-31",
      description: "Bavarian public university",
      portal: "DAAD",
      intakeLabel: "Winter 2026/27",
      officialProgramUrl: "https://www.uni-passau.de/en/msc-computer-science",
      officialApplicationUrl: "https://www.uni-passau.de/en/apply",
      sourceUrl: "https://www.uni-passau.de/en/msc-computer-science",
      verificationStatus: "VERIFIED",
    },
  ];

  beforeAll(() => {
    app = createApp();
  });

  it("should pass grounding validation when response cites valid candidates", () => {
    const text = "I recommend University of Passau MSc Computer Science. It has no tuition fee and requires IELTS 5.5. Check https://www.uni-passau.de/en/msc-computer-science";
    const res = GroundingValidator.validateAndGround(text, mockCandidates);
    expect(res.isFullyGrounded).toBe(true);
    expect(res.citedCandidates.length).toBe(1);
    expect(res.citedCandidates[0].id).toBe("passau-cs");
  });

  it("should sanitize hallucinated fake URLs not present in catalog", () => {
    const text = "Apply at https://fake-university-scam.com/apply for Passau CS";
    const res = GroundingValidator.validateAndGround(text, mockCandidates);
    expect(res.isFullyGrounded).toBe(false);
    expect(res.groundedText).not.toContain("fake-university-scam.com");
    expect(res.groundedText).toContain("[Official University Portal]");
  });

  it("should process chat message with catalog grounding context", async () => {
    // Create test user & profile & session
    const user = await prisma.user.upsert({
      where: { email: "grounded.test@zyntra.test" },
      update: { verified: true },
      create: {
        email: "grounded.test@zyntra.test",
        name: "Grounded User",
        passwordHash: "hash",
        verified: true,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { cgpa: "3.2", ielts: "7.0", preferredCountries: ["Germany"] },
      create: { userId: user.id, cgpa: "3.2", ielts: "7.0", preferredCountries: ["Germany"] },
    });

    const session = await prisma.chatSession.create({
      data: { userId: user.id, title: "Grounding Test Session" },
    });

    // Test sending message through ChatService
    const { ChatService } = await import("../src/modules/chat/chat.service");
    const result = await ChatService.sendMessage(user.id, session.id, "What programs suit my profile in Germany?");

    expect(result.assistantMessage).toBeDefined();
    expect(result.assistantMessage.content.length).toBeGreaterThan(0);
    expect(result.disclaimer).toContain("Zyntra Catalog");
    expect(result.candidates.length).toBeGreaterThan(0);

    // Cleanup
    await prisma.chatSession.delete({ where: { id: session.id } });
  });
});

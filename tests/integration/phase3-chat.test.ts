import { describe, expect, it, beforeAll } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { signAccessToken } from "../../src/lib/jwt";

describe("Phase 3 Chat Integration Tests", () => {
  let app: Express;
  let userToken: string;
  let userId: string;
  let sessionId: string;

  beforeAll(async () => {
    app = createApp();
    const user = await prisma.user.create({
      data: {
        email: `chat-test-${Date.now()}@example.com`,
        name: "Chat Test Student",
        passwordHash: "hash",
        verified: true,
        profile: { create: {} },
      },
    });
    userId = user.id;
    userToken = signAccessToken(user.id, user.role);
  });

  it("POST /api/v1/chat/sessions creates a new chat session", async () => {
    const res = await request(app)
      .post("/api/v1/chat/sessions")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "German Visa & Program Advice" });

    if (res.status !== 201) {
      console.log("POST SESSION ERR:", res.status, res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe("German Visa & Program Advice");
    sessionId = res.body.id;
  });

  it("GET /api/v1/chat/sessions lists user chat sessions", async () => {
    const res = await request(app)
      .get("/api/v1/chat/sessions")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/v1/chat/sessions/:id/messages sends message and returns AI response", async () => {
    const res = await request(app)
      .post(`/api/v1/chat/sessions/${sessionId}/messages`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ content: "What IELTS score do I need for Passau MSc Computer Science?" });

    expect(res.status).toBe(200);
    expect(res.body.userMessage).toBeDefined();
    expect(res.body.userMessage.content).toContain("Passau");
    expect(res.body.assistantMessage).toBeDefined();
    expect(res.body.assistantMessage.content.length).toBeGreaterThan(10);
    expect(res.body.disclaimer).toBeDefined();
  });

  it("GET /api/v1/chat/sessions/:id retrieves message history", async () => {
    const res = await request(app)
      .get(`/api/v1/chat/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(sessionId);
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(res.body.messages.length).toBe(2); // user + assistant
  });

  it("DELETE /api/v1/chat/sessions/:id deletes session and messages", async () => {
    const delRes = await request(app)
      .delete(`/api/v1/chat/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(delRes.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/v1/chat/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(getRes.status).toBe(404);
  });
});

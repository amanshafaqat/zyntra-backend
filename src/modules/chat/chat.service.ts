import { prisma } from "@/lib/prisma";
import { llm } from "@/lib/llm";
import { ApiError } from "@/utils/api-error";
import { profileService } from "@/modules/profile/profile.service";
import { catalogService } from "@/modules/catalog/catalog.service";
import { GroundingValidator } from "./grounding.validator";

const CHAT_SYSTEM_PROMPT =
  "You are Zyntra's AI Admissions Counsellor. Your job is to provide specific, encouraging, factual advice to Pakistani students applying for Master's programs in Germany, Australia, Ireland, Italy, and Finland. Always ground your advice strictly in the supplied catalog candidate list and the user's profile. NEVER invent fake university names, fees, deadlines, or URLs outside the provided candidate list. Include a clear disclaimer.";

const AI_DISCLAIMER =
  "AI-generated counselling advice grounded in Zyntra Catalog. Always verify official program requirements directly on university portals.";

export class ChatService {
  /**
   * Lists all active chat sessions for the user.
   */
  static async listSessions(userId: string) {
    return prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { messages: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true, sender: true },
        },
      },
    });
  }

  /**
   * Creates a new chat session.
   */
  static async createSession(userId: string, title?: string) {
    const defaultTitle = title?.trim() || "New Admissions Consultation";
    return prisma.chatSession.create({
      data: {
        userId,
        title: defaultTitle,
      },
    });
  }

  /**
   * Retrieves a chat session with complete message history.
   */
  static async getSession(userId: string, sessionId: string) {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session || session.userId !== userId) {
      throw ApiError.notFound("Chat session not found");
    }

    return session;
  }

  /**
   * Sends a user message and generates a catalog-grounded AI assistant response.
   */
  static async sendMessage(userId: string, sessionId: string, content: string) {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 10,
        },
      },
    });

    if (!session || session.userId !== userId) {
      throw ApiError.notFound("Chat session not found");
    }

    const trimmed = content.trim();
    if (!trimmed) {
      throw ApiError.badRequest("Message content cannot be empty.");
    }

    // 1. Save user message
    const userMsg = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: "user",
        content: trimmed,
      },
    });

    // 2. Load candidate programs from Zyntra database
    const [profile, strength, recommendations] = await Promise.all([
      profileService.get(userId),
      profileService.strength(userId),
      catalogService.listRecommendations(userId),
    ]);

    const topCandidates = recommendations.slice(0, 5);

    const candidatesSummary = topCandidates
      .map(
        (c, i) =>
          `[Candidate ${i + 1}] ${c.university} — ${c.program} (${c.country}) | Fee: ${c.fee} ${c.currency}/yr | Deadline: ${c.deadline} | Official URL: ${c.officialProgramUrl || c.portal} | Match Score: ${c.matchScore}%`
      )
      .join("\n");

    const contextSummary = `Student Context:
- Degree: ${profile.degree || "Not set"}; CGPA: ${profile.cgpa || "Not set"}; IELTS: ${profile.ielts || "Not set"}
- Readiness Score: ${strength.overall}/100; Weakest Area: ${strength.weakest.label}
- Preferred Countries: ${profile.preferredCountries.join(", ") || "Any"}

GROUNDED ZYNTRA CATALOG CANDIDATES (USE ONLY THESE):
${candidatesSummary}`;

    // 3. Generate Assistant Response
    let rawAssistantReply = "";
    let mode: "claude" | "groq" | "template" = llm.mode;

    if (llm.isEnabled) {
      try {
        const historyMessages = session.messages.map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        }));

        historyMessages.push({ role: "user", content: `${contextSummary}\n\nUser Question: ${trimmed}` });

        rawAssistantReply = await llm.complete({
          system: CHAT_SYSTEM_PROMPT,
          messages: historyMessages,
          maxTokens: 800,
        });
      } catch {
        mode = "template";
        rawAssistantReply = this.generateFallbackAdvice(trimmed, profile, strength.overall, topCandidates);
      }
    } else {
      mode = "template";
      rawAssistantReply = this.generateFallbackAdvice(trimmed, profile, strength.overall, topCandidates);
    }

    // 4. Run Post-Generation Grounding Validator
    const grounding = GroundingValidator.validateAndGround(rawAssistantReply, topCandidates);

    // 5. Save Assistant Response
    const assistantMsg = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: "assistant",
        content: grounding.groundedText,
      },
    });

    // 6. Update session title if first message
    if (session.messages.length === 0) {
      const autoTitle = trimmed.length > 30 ? `${trimmed.substring(0, 30)}…` : trimmed;
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: autoTitle },
      });
    }

    return {
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      mode,
      disclaimer: AI_DISCLAIMER,
      candidates: topCandidates,
      isFullyGrounded: grounding.isFullyGrounded,
    };
  }

  /**
   * Deletes a chat session.
   */
  static async deleteSession(userId: string, sessionId: string) {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw ApiError.notFound("Chat session not found");
    }

    return prisma.chatSession.delete({
      where: { id: sessionId },
    });
  }

  /**
   * Deterministic fallback advisor for offline demo mode.
   */
  private static generateFallbackAdvice(
    q: string,
    p: { degree?: string; cgpa?: string; ielts?: string; preferredCountries: string[] },
    score: number,
    candidates: any[] = []
  ): string {
    const queryLower = q.toLowerCase();
    const candidateNames = candidates.map((c) => `${c.university} (${c.program})`).slice(0, 3).join(", ");

    if (queryLower.includes("ielts") || queryLower.includes("language")) {
      return `For your target universities, an IELTS band score of 6.5 or 7.0 (with no sub-score below 6.0) is standard. Your current score is ${p.ielts || "not set"}. Top candidate programs matching your profile include: ${candidateNames || "Passau MSc CS"}.`;
    }

    if (queryLower.includes("tum") || queryLower.includes("germany") || queryLower.includes("tu munich")) {
      return `Public German universities like University of Passau or Paderborn require a minimum CGPA (often 2.5 on German scale / ~3.0+ PK scale) and matching bachelor's credit distribution. Your current CGPA is ${p.cgpa || "not set"}. Top candidate programs: ${candidateNames || "Passau MSc CS"}.`;
    }

    if (queryLower.includes("scholarship") || queryLower.includes("funding")) {
      return `Key scholarships for Pakistani applicants include DAAD (Germany), Erasmus Mundus (EU-wide), and Endeavour (Australia). Prepare your SOP, reference letters, and transcript early as scholarship deadlines close 3-6 months before intake starts. Recommended candidate options: ${candidateNames || "Passau MSc CS"}.`;
    }

    return `Based on your profile (CGPA: ${p.cgpa || "n/a"}, IELTS: ${p.ielts || "n/a"}, Academic Readiness Score: ${score}/100), top grounded Zyntra catalog candidates include: ${candidateNames || "University of Passau MSc CS"}. Focus on addressing your core gaps, securing 2 academic reference letters, and tailoring your SOP.`;
  }
}

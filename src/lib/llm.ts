import { env } from "@/config/env";
import { logger } from "@/config/logger";

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LlmCallOptions {
  system?: string;
  messages: LlmMessage[];
  maxTokens?: number;
  temperature?: number;
}

export class LlmUnavailableError extends Error {
  constructor() {
    super("No AI provider (Claude or Groq) is configured.");
    this.name = "LlmUnavailableError";
  }
}

/**
 * Unified LLM completion service supporting Anthropic Claude (messages API)
 * and Groq (OpenAI-compatible Chat Completions API).
 */
export const llm = {
  get isEnabled(): boolean {
    return env.hasClaude || env.hasGroq;
  },

  get mode(): "claude" | "groq" | "template" {
    if (env.hasClaude) return "claude";
    if (env.hasGroq) return "groq";
    return "template";
  },

  async complete(options: LlmCallOptions): Promise<string> {
    if (!this.isEnabled) throw new LlmUnavailableError();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      if (env.hasClaude) {
        // Call Anthropic Messages API
        const res = await fetch(`${env.ANTHROPIC_BASE_URL}/v1/messages`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "content-type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: env.ANTHROPIC_MODEL,
            max_tokens: options.maxTokens ?? env.AI_MAX_TOKENS,
            temperature: options.temperature ?? 0.6,
            ...(options.system ? { system: options.system } : {}),
            messages: options.messages,
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          logger.error({ status: res.status, detail }, "Claude API error");
          throw new Error(`Claude API responded ${res.status}`);
        }

        const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
        const text = (data.content ?? [])
          .filter((b) => b.type === "text" && typeof b.text === "string")
          .map((b) => b.text as string)
          .join("\n")
          .trim();

        if (!text) throw new Error("Claude API returned an empty completion");
        return text;
      } else {
        // Call Groq Chat Completions API
        const res = await fetch(`${env.GROQ_BASE_URL}/chat/completions`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: env.GROQ_MODEL,
            max_tokens: options.maxTokens ?? env.AI_MAX_TOKENS,
            temperature: options.temperature ?? 0.6,
            messages: [
              ...(options.system ? [{ role: "system", content: options.system }] : []),
              ...options.messages.map(m => ({ role: m.role, content: m.content })),
            ],
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          logger.error({ status: res.status, detail }, "Groq API error");
          throw new Error(`Groq API responded ${res.status}`);
        }

        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const text = data.choices?.[0]?.message?.content?.trim() ?? "";

        if (!text) throw new Error("Groq API returned an empty completion");
        return text;
      }
    } finally {
      clearTimeout(timeout);
    }
  },
};

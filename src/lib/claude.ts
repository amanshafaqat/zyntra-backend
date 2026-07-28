import { env } from "@/config/env";
import { logger } from "@/config/logger";

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeCallOptions {
  system?: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
}

export class ClaudeUnavailableError extends Error {
  constructor() {
    super("Claude AI is not configured.");
    this.name = "ClaudeUnavailableError";
  }
}

/**
 * Thin wrapper over the Anthropic Messages API using the runtime's global
 * fetch (Node 18+/22). When no API key is present, `isEnabled` is false and
 * callers fall back to the deterministic template engines — the product keeps
 * working offline and in the FYP demo environment.
 */
export const claude = {
  isEnabled: env.hasClaude,

  async complete(options: ClaudeCallOptions): Promise<string> {
    if (!env.hasClaude) throw new ClaudeUnavailableError();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
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
    } finally {
      clearTimeout(timeout);
    }
  },
};

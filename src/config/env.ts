import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default("/api/v1"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  CODE_TTL_MINUTES: z.coerce.number().int().positive().default(15),

  REDIS_URL: z.string().optional().default(""),

  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true"),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().default('"Zyntra" <no-reply@zyntra.app>'),

  UPLOAD_DIR: z.string().default("uploads"),
  MAX_AVATAR_MB: z.coerce.number().positive().default(2),
  PUBLIC_URL: z.string().default("http://localhost:4000"),

  // ── Claude AI (optional — falls back to template engine when unset) ──
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),
  ANTHROPIC_BASE_URL: z.string().default("https://api.anthropic.com"),
  AI_MAX_TOKENS: z.coerce.number().int().positive().default(1200),

  // ── Groq AI (optional — compatible fallback) ──
  GROQ_API_KEY: z.string().optional().default(""),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  GROQ_BASE_URL: z.string().default("https://api.groq.com/openai/v1"),

  // ── ML prediction service (FastAPI microservice, optional) ──
  ML_SERVICE_URL: z.string().optional().default(""),
  ML_SERVICE_TIMEOUT_MS: z.coerce.number().int().positive().default(4000),

  // ── Browser extension ──
  // Extra origins the extension calls from (chrome-extension://<id>).
  EXTENSION_ORIGINS: z.string().optional().default(""),
  // Short-lived extension session token TTL.
  EXTENSION_TOKEN_TTL: z.string().default("2h"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  // eslint-disable-next-line no-console
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === "production",
  isDev: parsed.data.NODE_ENV === "development",
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  extensionOrigins: parsed.data.EXTENSION_ORIGINS.split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  hasClaude: parsed.data.ANTHROPIC_API_KEY.length > 0,
  hasGroq: parsed.data.GROQ_API_KEY.length > 0,
  hasMlService: parsed.data.ML_SERVICE_URL.length > 0,
};

/**
 * Extra guardrails that only apply in production. These are fatal: shipping
 * with a placeholder secret or a wildcard CORS origin is worse than not
 * booting at all.
 */
if (env.isProd) {
  const fatal: string[] = [];

  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    fatal.push("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different");
  }
  for (const [name, value] of [
    ["JWT_ACCESS_SECRET", env.JWT_ACCESS_SECRET],
    ["JWT_REFRESH_SECRET", env.JWT_REFRESH_SECRET],
  ] as const) {
    if (value.length < 32) fatal.push(`${name} must be at least 32 characters in production`);
    if (/change[-_]?me|secret|placeholder|test/i.test(value)) fatal.push(`${name} still contains a placeholder value`);
  }
  if (env.corsOrigins.includes("*")) fatal.push("CORS_ORIGINS must not be a wildcard in production");
  if (env.corsOrigins.some((o) => o.startsWith("http://") && !o.includes("localhost"))) {
    fatal.push("CORS_ORIGINS must use https in production");
  }
  if (!env.PUBLIC_URL.startsWith("https://")) fatal.push("PUBLIC_URL must use https in production");
  if (!env.SMTP_HOST) fatal.push("SMTP_HOST is required in production (verification emails would be dropped)");

  if (fatal.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`Unsafe production configuration:\n${fatal.map((f) => `  - ${f}`).join("\n")}`);
    process.exit(1);
  }
}

export type Env = typeof env;

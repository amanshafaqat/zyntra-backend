import type { NextFunction, Request, Response } from "express";

/**
 * Defence-in-depth input hygiene.
 *
 * SQL injection is already structurally prevented: every query goes through
 * Prisma's parameterised client (no string-concatenated SQL anywhere). This
 * middleware addresses the remaining vectors:
 *
 *  - XSS: strips HTML tags and control characters from string inputs, so
 *    stored values can never carry `<script>` payloads into the frontend.
 *  - Prototype pollution: drops `__proto__`, `constructor` and `prototype`
 *    keys before they reach any merge/assign in application code.
 *  - Null bytes: removed, as they can truncate strings in downstream systems.
 *
 * Fields that legitimately need rich text (SOP content) are length-validated
 * by Zod and rendered as plain text by the frontend, so tag-stripping is safe.
 */

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const HTML_TAG = /<\/?[a-z][\s\S]*?>/gi;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function sanitizeString(value: string): string {
  return value.replace(HTML_TAG, "").replace(CONTROL_CHARS, "").trim();
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 8) return value; // guard against pathological nesting
  if (typeof value === "string") return sanitizeString(value);
  if (Array.isArray(value)) return value.map((v) => sanitizeValue(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_KEYS.has(key)) continue;
      out[key] = sanitizeValue(val, depth + 1);
    }
    return out;
  }
  return value;
}

/**
 * Multipart bodies are populated by Multer after this middleware, so file
 * metadata is untouched; only JSON/urlencoded fields are sanitized.
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body) as typeof req.body;
  }
  if (req.query && typeof req.query === "object") {
    // req.query is a getter in Express 5; assign per-key to stay compatible.
    const sanitized = sanitizeValue(req.query) as Record<string, unknown>;
    for (const key of Object.keys(sanitized)) {
      (req.query as Record<string, unknown>)[key] = sanitized[key];
    }
  }
  next();
}

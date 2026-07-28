import { randomBytes, timingSafeEqual } from "node:crypto";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import { env } from "@/config/env";
import { ApiError } from "@/utils/api-error";

/**
 * CSRF applies only where the browser sends credentials implicitly — here that
 * is the refresh-token cookie used by `POST /auth/refresh` and `/auth/logout`.
 * All other authenticated routes use a Bearer access token that a cross-site
 * form cannot attach, so they are not CSRF-reachable.
 *
 * Strategy: double-submit cookie. `GET /auth/csrf` issues a random token in a
 * readable cookie; the client echoes it in the `X-CSRF-Token` header. An
 * attacker's site can trigger the request but cannot read the cookie to
 * populate the header (same-origin policy).
 */

export const CSRF_COOKIE = "zyntra_csrf";
const CSRF_HEADER = "x-csrf-token";

const csrfCookieOptions: CookieOptions = {
  httpOnly: false, // readable by the frontend, by design
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  path: "/",
  maxAge: 12 * 60 * 60 * 1000,
};

export function issueCsrfToken(_req: Request, res: Response): void {
  const token = randomBytes(32).toString("hex");
  res.cookie(CSRF_COOKIE, token, csrfCookieOptions);
  res.json({ csrfToken: token });
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function requireCsrf(req: Request, _res: Response, next: NextFunction): void {
  // Bearer-authenticated calls carry no ambient cookie authority.
  if (req.headers.authorization?.startsWith("Bearer ")) return next();

  // No refresh cookie means nothing to protect on this request.
  const hasCookieAuth = Boolean(req.cookies?.zyntra_refresh);
  if (!hasCookieAuth) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;
  const headerToken = req.header(CSRF_HEADER);

  if (!cookieToken || !headerToken || !safeEqual(cookieToken, headerToken)) {
    return next(ApiError.forbidden("Invalid or missing CSRF token."));
  }
  next();
}

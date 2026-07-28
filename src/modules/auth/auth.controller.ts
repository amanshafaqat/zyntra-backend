import type { CookieOptions, Request, Response } from "express";
import { env } from "@/config/env";
import { asyncHandler } from "@/utils/async-handler";
import { ApiError } from "@/utils/api-error";
import { auditService } from "@/modules/audit/audit.service";
import { authService } from "./auth.service";

const REFRESH_COOKIE = "zyntra_refresh";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  path: `${env.API_PREFIX}/auth`,
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

const meta = (req: Request) => ({ userAgent: req.headers["user-agent"], ip: req.ip });

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, cookieOptions);
}

function readRefreshToken(req: Request): string | undefined {
  return (req.cookies?.[REFRESH_COOKIE] as string | undefined) ?? (req.body?.refreshToken as string | undefined);
}

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }),

  resendCode: asyncHandler(async (req, res) => {
    await authService.resendCode(req.body.email);
    res.json({ message: "A new verification code has been emailed." });
  }),

  verify: asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, ...session } = await authService.verifyEmail(req.body, meta(req));
    setRefreshCookie(res, refreshToken);
    res.json({ ...session, accessToken });
  }),

  login: asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, ...session } = await authService.login(req.body, meta(req));
    setRefreshCookie(res, refreshToken);
    auditService.record({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: "LOGIN",
      entity: "user",
      entityId: session.user.id,
      summary: "User signed in",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.json({ ...session, accessToken });
  }),

  refresh: asyncHandler(async (req, res) => {
    const raw = readRefreshToken(req);
    if (!raw) throw ApiError.unauthorized("No refresh token provided.");
    const { accessToken, refreshToken, ...session } = await authService.refresh(raw, meta(req));
    setRefreshCookie(res, refreshToken);
    res.json({ ...session, accessToken });
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(readRefreshToken(req));
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
    res.json({ message: "Signed out." });
  }),

  session: asyncHandler(async (req, res) => {
    const session = await authService.session(req.user!.id);
    res.json(session);
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    res.json({ message: "If an account exists with that email, a reset code has been sent." });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body);
    res.json({ message: "Password updated. You can log in with your new password." });
  }),

  changePassword: asyncHandler(async (req, res) => {
    await authService.changePassword(req.user!.id, req.body);
    auditService.record({
      actorId: req.user!.id,
      action: "SECURITY",
      entity: "user",
      entityId: req.user!.id,
      summary: "Password changed (all sessions revoked)",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.json({ message: "Password changed." });
  }),
};

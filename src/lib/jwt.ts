import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "@/config/env";
import { ApiError } from "@/utils/api-error";

export interface AccessPayload {
  sub: string;
  role: Role;
  type: "access";
}

export interface RefreshPayload {
  sub: string;
  jti: string;
  type: "refresh";
}

export function signAccessToken(userId: string, role: Role): string {
  const payload: AccessPayload = { sub: userId, role, type: "access" };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL } as jwt.SignOptions);
}

export function signRefreshToken(userId: string, jti: string): string {
  const payload: RefreshPayload = { sub: userId, jti, type: "refresh" };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
    if (decoded.type !== "access") throw new Error("wrong type");
    return decoded;
  } catch {
    throw ApiError.unauthorized("Your session has expired. Please log in again.");
  }
}

export function verifyRefreshToken(token: string): RefreshPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
    if (decoded.type !== "refresh") throw new Error("wrong type");
    return decoded;
  } catch {
    throw ApiError.unauthorized("Refresh token is invalid or expired. Please log in again.");
  }
}

export interface ExtensionPayload {
  sub: string;
  type: "extension";
}

/** Short-lived token used only by the browser extension popup session. */
export function signExtensionToken(userId: string): string {
  const payload: ExtensionPayload = { sub: userId, type: "extension" };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.EXTENSION_TOKEN_TTL } as jwt.SignOptions);
}

export function verifyExtensionToken(token: string): ExtensionPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as ExtensionPayload;
    if (decoded.type !== "extension") throw new Error("wrong type");
    return decoded;
  } catch {
    throw ApiError.unauthorized("Extension session expired. Please sign in again from the extension.");
  }
}

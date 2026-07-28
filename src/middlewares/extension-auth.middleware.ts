import type { NextFunction, Request, Response } from "express";
import { verifyExtensionToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/api-error";
import { asyncHandler } from "@/utils/async-handler";

/**
 * Authenticates browser-extension requests via a short-lived extension token
 * supplied in the `X-Extension-Token` header (or Bearer). Distinct from the
 * web app's access token so the two session types can be revoked independently.
 */
export const requireExtensionAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const headerToken = req.header("x-extension-token");
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined;
    const token = headerToken ?? bearer;
    if (!token) throw ApiError.unauthorized("Extension token required.");

    const payload = verifyExtensionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true },
    });
    if (!user) throw ApiError.unauthorized("This account no longer exists.");
    if (user.status === "suspended") throw ApiError.forbidden("This account has been suspended.");

    req.user = { id: user.id, role: user.role };
    next();
  },
);

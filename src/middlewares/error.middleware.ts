import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { ApiError } from "@/utils/api-error";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.path} does not exist.`));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message, ...(err.errors ? { errors: err.errors } : {}) });
    return;
  }

  if (err instanceof ZodError) {
    const errors: Record<string, string> = {};
    for (const issue of err.issues) errors[issue.path.join(".") || "_"] = issue.message;
    res.status(422).json({ message: "Validation failed. Check the highlighted fields.", errors });
    return;
  }

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? `File is too large. Maximum size is ${env.MAX_AVATAR_MB} MB.`
        : `Upload failed: ${err.message}.`;
    res.status(400).json({ message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ message: "A record with this value already exists." });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ message: "Resource not found." });
      return;
    }
  }

  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");
  res.status(500).json({
    message: env.isProd ? "Something went wrong on our side." : (err as Error)?.message ?? "Unknown error",
  });
}

import { randomUUID } from "node:crypto";
import path from "node:path";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express, type Request } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { openApiDocument } from "@/docs/openapi";
import { errorHandler, notFoundHandler } from "@/middlewares/error.middleware";
import { globalLimiter } from "@/middlewares/rate-limit.middleware";
import { sanitizeInput } from "@/middlewares/sanitize.middleware";

/** Semantic version of the HTTP contract, surfaced as X-API-Version. */
export const API_VERSION = "1.0.0";
import { adminRouter } from "@/modules/admin/admin.routes";
import { auditRouter } from "@/modules/audit/audit.routes";
import { aiRouter } from "@/modules/ai/ai.routes";
import { applicationsRouter } from "@/modules/applications/applications.routes";
import { authRouter } from "@/modules/auth/auth.routes";
import { catalogRouter } from "@/modules/catalog/catalog.routes";
import { chatRouter } from "@/modules/chat/chat.routes";
import { documentsRouter } from "@/modules/documents/documents.routes";
import { extensionRouter } from "@/modules/extension/extension.routes";
import { healthRouter } from "@/modules/health/health.routes";
import { notificationsRouter } from "@/modules/notifications/notifications.routes";
import { predictionsRouter } from "@/modules/predictions/predictions.routes";
import { profileRouter } from "@/modules/profile/profile.routes";
import { sopRouter } from "@/modules/sop/sop.routes";
import { syncRouter } from "@/modules/sync/sync.routes";
import { usersRouter } from "@/modules/users/users.routes";

export function createApp(): Express {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: env.isProd
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"], // Swagger UI injects styles
              imgSrc: ["'self'", "data:", "blob:"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      hsts: env.isProd ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
      referrerPolicy: { policy: "no-referrer" },
    }),
  );
  app.use(compression());
  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow same-origin/no-origin (curl, server-to-server), configured web
        // origins, and any chrome-extension:// origin (the browser extension).
        if (!origin) return cb(null, true);
        if (env.isDev) return cb(null, true);
        if (env.corsOrigins.includes(origin)) return cb(null, true);
        if (env.extensionOrigins.includes(origin)) return cb(null, true);
        if (origin.startsWith("chrome-extension://") || origin.startsWith("moz-extension://")) return cb(null, true);
        return cb(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Extension-Token"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(sanitizeInput);

  // Correlation id + API version on every response, for log tracing.
  app.use((req, res, next) => {
    const requestId = (req.header("x-request-id") ?? randomUUID()).slice(0, 64);
    res.setHeader("X-Request-Id", requestId);
    res.setHeader("X-API-Version", API_VERSION);
    (req as Request & { id?: string }).id = requestId;
    next();
  });
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as Request & { id?: string }).id ?? randomUUID(),
      autoLogging: { ignore: (req) => req.url === "/health" || req.url?.startsWith("/docs") === true },
      customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"),
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
      redact: {
        paths: ["req.headers.authorization", "req.headers.cookie", "req.headers['x-extension-token']"],
        remove: true,
      },
    }),
  );
  app.use(globalLimiter);

  // Static avatars (documents are streamed through an authenticated route, not served statically)
  app.use("/uploads/avatars", express.static(path.resolve(env.UPLOAD_DIR, "avatars"), { maxAge: "1d", immutable: true }));

  // API docs
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument as never, { customSiteTitle: "Zyntra API" }));

  // Routes
  app.use("/health", healthRouter);
  app.use(`${env.API_PREFIX}/health`, healthRouter);
  app.use(`${env.API_PREFIX}/auth`, authRouter);
  app.use(`${env.API_PREFIX}/users`, usersRouter);
  app.use(`${env.API_PREFIX}/profile`, profileRouter);
  app.use(`${env.API_PREFIX}/catalog`, catalogRouter);
  app.use(`${env.API_PREFIX}/chat`, chatRouter);
  app.use(`${env.API_PREFIX}/applications`, applicationsRouter);
  app.use(`${env.API_PREFIX}/documents`, documentsRouter);
  app.use(`${env.API_PREFIX}/notifications`, notificationsRouter);
  app.use(`${env.API_PREFIX}/sop`, sopRouter);
  app.use(`${env.API_PREFIX}/ai`, aiRouter);
  app.use(`${env.API_PREFIX}/predictions`, predictionsRouter);
  app.use(`${env.API_PREFIX}/extension`, extensionRouter);
  app.use(`${env.API_PREFIX}/sync`, syncRouter);
  // Mounted before adminRouter so the more specific path matches first.
  app.use(`${env.API_PREFIX}/admin/audit-logs`, auditRouter);
  app.use(`${env.API_PREFIX}/admin`, adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

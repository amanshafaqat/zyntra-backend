import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { issueCsrfToken, requireCsrf } from "@/middlewares/csrf.middleware";
import { authLimiter, codeLimiter } from "@/middlewares/rate-limit.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { authController } from "./auth.controller";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resendCodeSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.dto";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validate({ body: registerSchema }), authController.register);
authRouter.post("/resend-code", codeLimiter, validate({ body: resendCodeSchema }), authController.resendCode);
authRouter.post("/verify", authLimiter, validate({ body: verifyEmailSchema }), authController.verify);
authRouter.post("/login", authLimiter, validate({ body: loginSchema }), authController.login);
authRouter.get("/csrf", issueCsrfToken);
authRouter.post("/refresh", requireCsrf, validate({ body: refreshSchema }), authController.refresh);
authRouter.post("/logout", requireCsrf, authController.logout);
authRouter.get("/session", requireAuth, authController.session);
authRouter.post("/forgot-password", codeLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
authRouter.post("/reset-password", authLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);
authRouter.patch("/password", requireAuth, validate({ body: changePasswordSchema }), authController.changePassword);

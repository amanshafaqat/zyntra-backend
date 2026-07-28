import { z } from "zod";

const email = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

const password = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters");

const code = z
  .string({ required_error: "Code is required" })
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const registerSchema = z.object({
  name: z.string({ required_error: "Name is required" }).trim().min(2, "Name must be at least 2 characters").max(80),
  email,
  password,
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({ email, password: z.string({ required_error: "Password is required" }).min(1) });
export type LoginDto = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({ email, code });
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;

export const resendCodeSchema = z.object({ email });
export type ResendCodeDto = z.infer<typeof resendCodeSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({ email, code, password });
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  current: z.string({ required_error: "Current password is required" }).min(1, "Current password is required"),
  next: password,
});
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

export const refreshSchema = z.object({ refreshToken: z.string().min(1).optional() });
export type RefreshDto = z.infer<typeof refreshSchema>;

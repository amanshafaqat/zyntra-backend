import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { env } from "@/config/env";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt";
import { mailer } from "@/lib/mailer";
import { ApiError } from "@/utils/api-error";
import { sha256, sixDigitCode } from "@/utils/crypto";
import { authRepository, type UserWithProfile } from "./auth.repository";
import { toSessionDto, toUserDto, type SessionDto, type UserDto } from "./auth.serializer";
import type {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "./auth.dto";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface ClientMeta {
  userAgent?: string;
  ip?: string;
}

async function issueTokens(user: UserWithProfile, meta: ClientMeta): Promise<TokenPair> {
  const jti = randomUUID();
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, jti);
  await authRepository.storeRefreshToken({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(dto: RegisterDto): Promise<{ email: string }> {
    const existing = await authRepository.findByEmail(dto.email);
    if (existing) throw ApiError.conflict("An account with this email already exists. Log in instead.");

    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);
    const user = await authRepository.createUser({ name: dto.name, email: dto.email, passwordHash });

    const code = sixDigitCode();
    await authRepository.issueCode(user.email, "EMAIL_VERIFY", sha256(code));
    await mailer.sendVerificationCode(user.email, user.name, code);

    return { email: user.email };
  },

  async resendCode(email: string): Promise<void> {
    const user = await authRepository.findByEmail(email);
    if (!user) throw ApiError.notFound("Nothing to verify. Register first.");
    if (user.verified) throw ApiError.badRequest("This account is already verified. Log in instead.");

    const code = sixDigitCode();
    await authRepository.issueCode(user.email, "EMAIL_VERIFY", sha256(code));
    await mailer.sendVerificationCode(user.email, user.name, code);
  },

  async verifyEmail(dto: VerifyEmailDto, meta: ClientMeta): Promise<SessionDto & TokenPair> {
    const record = await authRepository.findActiveCode(dto.email, "EMAIL_VERIFY", sha256(dto.code));
    if (!record) throw ApiError.badRequest("That code doesn't match or has expired. Request a new one.");

    const user = await authRepository.findByEmail(dto.email);
    if (!user) throw ApiError.notFound("Account not found. Register again.");

    await authRepository.consumeCode(record.id);
    const verified = await authRepository.markVerified(user.id);
    const tokens = await issueTokens(verified, meta);
    return { ...toSessionDto(verified), ...tokens };
  },

  async login(dto: LoginDto, meta: ClientMeta): Promise<SessionDto & TokenPair> {
    const user = await authRepository.findByEmail(dto.email);
    if (!user) throw ApiError.unauthorized("No account exists with this email.");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Incorrect password. Try again or reset it.");
    if (user.status === "suspended") throw ApiError.forbidden("This account has been suspended. Contact support.");
    if (!user.verified) throw ApiError.forbidden("This account isn't verified yet. Check your inbox for the code.");

    const tokens = await issueTokens(user, meta);
    return { ...toSessionDto(user), ...tokens };
  },

  async refresh(rawToken: string, meta: ClientMeta): Promise<SessionDto & TokenPair> {
    const payload = verifyRefreshToken(rawToken);
    const tokenHash = sha256(rawToken);
    const stored = await authRepository.findRefreshToken(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // Reuse of a rotated/revoked token — revoke the whole family defensively.
      if (stored?.revokedAt) await authRepository.revokeAllForUser(stored.userId);
      throw ApiError.unauthorized("Refresh token is invalid or expired. Please log in again.");
    }

    const user = await authRepository.findById(payload.sub);
    if (!user) throw ApiError.unauthorized("This account no longer exists.");

    await authRepository.revokeRefreshToken(tokenHash); // rotation
    const tokens = await issueTokens(user, meta);
    return { ...toSessionDto(user), ...tokens };
  },

  async logout(rawToken: string | undefined): Promise<void> {
    if (rawToken) await authRepository.revokeRefreshToken(sha256(rawToken));
  },

  async session(userId: string): Promise<SessionDto> {
    const user = await authRepository.findById(userId);
    if (!user) throw ApiError.unauthorized("This account no longer exists.");
    return toSessionDto(user);
  },

  async forgotPassword(email: string): Promise<void> {
    // Never reveal whether an account exists.
    const user = await authRepository.findByEmail(email);
    if (!user) return;

    const code = sixDigitCode();
    await authRepository.issueCode(user.email, "PASSWORD_RESET", sha256(code));
    await mailer.sendPasswordResetCode(user.email, user.name, code);
  },

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const record = await authRepository.findActiveCode(dto.email, "PASSWORD_RESET", sha256(dto.code));
    if (!record) throw ApiError.badRequest("That code doesn't match. Request a new reset email.");

    const user = await authRepository.findByEmail(dto.email);
    if (!user) throw ApiError.notFound("Account not found.");

    await authRepository.consumeCode(record.id);
    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);
    await authRepository.updatePassword(user.id, passwordHash);
    await authRepository.revokeAllForUser(user.id);
  },

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await authRepository.findById(userId);
    if (!user) throw ApiError.unauthorized("This account no longer exists.");

    const valid = await bcrypt.compare(dto.current, user.passwordHash);
    if (!valid) throw ApiError.badRequest("Current password is incorrect.");

    const passwordHash = await bcrypt.hash(dto.next, env.BCRYPT_ROUNDS);
    await authRepository.updatePassword(userId, passwordHash);
    await authRepository.revokeAllForUser(userId);
  },

  async updateName(userId: string, name: string): Promise<UserDto> {
    const user = await authRepository.updateName(userId, name.trim());
    return toUserDto(user);
  },

  async deleteAccount(userId: string): Promise<void> {
    await authRepository.deleteUser(userId); // cascades profile + refresh tokens
  },
};

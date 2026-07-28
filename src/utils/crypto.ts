import { createHash, randomInt } from "node:crypto";

export const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

/** Cryptographically random 6-digit code, zero-padded. */
export const sixDigitCode = (): string => String(randomInt(0, 1_000_000)).padStart(6, "0");

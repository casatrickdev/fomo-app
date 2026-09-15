import { createHash, randomBytes, randomInt } from "crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function placeholderHandle(): string {
  return `kite_${randomBytes(4).toString("hex")}`;
}

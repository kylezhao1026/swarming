import crypto from "crypto";

export function generateInviteCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export function isInviteExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function getInviteExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 48);
  return expiry;
}

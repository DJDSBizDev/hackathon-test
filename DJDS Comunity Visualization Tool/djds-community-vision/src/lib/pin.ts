/** Facilitator PIN generation + hashing (BUILD-SPEC §9.1). Server-only. */
import bcrypt from "bcryptjs";

/** A 6-digit numeric PIN — easy to read aloud / type at a community event. */
export function generatePin(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return n.toString().padStart(6, "0");
}

export function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export function verifyPinHash(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

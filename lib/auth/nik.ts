import "server-only";
import { createHmac } from "node:crypto";

function getNikSecret() {
  const secret = process.env.NIK_HMAC_SECRET;

  if (!secret) {
    throw new Error("NIK_HMAC_SECRET belum dikonfigurasi.");
  }

  return secret;
}

export function normalizeNik(nik: string): string {
  return nik.replace(/\D/g, "");
}

export function hashNik(nik: string): string {
  const normalizedNik = normalizeNik(nik);

  if (!/^\d{16}$/.test(normalizedNik)) {
    throw new Error("NIK harus terdiri dari 16 digit.");
  }

  return createHmac("sha256", getNikSecret())
    .update(normalizedNik)
    .digest("hex");
}

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginWithIdentifier } from "@/lib/auth/login";
import { registerCitizen } from "@/lib/auth/register";

export type LoginState = {
  error?: string;
};

export type RegisterState = { error?: string; success?: boolean };

export async function register(
  _previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const nik = String(formData.get("nik") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const address = String(formData.get("address") ?? "");
  try {
    await registerCitizen({ nik, password, fullName, phone, address });
    return { success: true };
  } catch (error) {
    console.error("Citizen registration failed:", error);
    if (error instanceof Error && error.message === "NIK sudah terdaftar.") return { error: error.message };
    if (error instanceof Error && /wajib|minimal|16 digit/i.test(error.message)) return { error: error.message };
    return { error: "Pendaftaran gagal. Periksa data Anda dan coba kembali." };
  }
}

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await loginWithIdentifier({
      identifier,
      password,
    });
  } catch (error) {
    console.error("Login action failed:", error);
    return {
      error: "NIK/email atau password salah.",
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

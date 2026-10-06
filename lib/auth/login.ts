import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hashNik, normalizeNik } from "@/lib/auth/nik";

const INVALID_CREDENTIALS = "NIK/email atau password salah.";

type LoginInput = {
  identifier: string;
  password: string;
};

/** Authenticates citizens by NIK and staff/admin accounts by email. */
export async function loginWithIdentifier(input: LoginInput) {
  const identifier = input.identifier.trim();

  if (!identifier || !input.password) {
    throw new Error(INVALID_CREDENTIALS);
  }

  const supabase = await createClient();
  let email = identifier;
  let expectedRole: "ADMIN" | "PETUGAS" | "MASYARAKAT";

  if (/^\d{16}$/.test(normalizeNik(identifier))) {
    const nik = normalizeNik(identifier);
    const adminSupabase = createAdminClient();
    const { data: profile, error } = await adminSupabase
      .from("profiles")
      .select("auth_login_id, role, is_active")
      .eq("nik_hash", hashNik(nik))
      .eq("role", "MASYARAKAT")
      .maybeSingle();

    if (error) {
      console.error("Login profile lookup error:", error);
      throw new Error(INVALID_CREDENTIALS);
    }

    if (!profile?.is_active || !profile.auth_login_id) {
      throw new Error(INVALID_CREDENTIALS);
    }

    email = `${profile.auth_login_id}@auth.uptdsahu.local`;
    expectedRole = "MASYARAKAT";
  } else {
    // Staff and admin use their actual Supabase Auth email.
    expectedRole = "ADMIN";
  }

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (loginError) {
    console.error("Supabase login failed.");
    throw new Error(INVALID_CREDENTIALS);
  }

  // Check authorization from the authenticated profile, never from form data.
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const allowed = expectedRole === "MASYARAKAT"
    ? profile?.role === "MASYARAKAT"
    : profile?.role === "ADMIN" || profile?.role === "PETUGAS";

  if (profileError || !profile?.is_active || !allowed) {
    if (profileError) console.error("Login profile verification error:", profileError);
    await supabase.auth.signOut();
    throw new Error(INVALID_CREDENTIALS);
  }

  return { userId: profile.id, role: profile.role };
}

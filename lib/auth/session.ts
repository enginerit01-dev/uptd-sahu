import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        phone,
        address,
        role,
        is_active
      `,
    )
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile;
}

export async function requireAuth() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    redirect("/login?error=account-disabled");
  }

  return profile;
}

export async function requireRole(
  allowedRoles: Array<"ADMIN" | "PETUGAS" | "MASYARAKAT">,
) {
  const profile = await requireAuth();

  if (!allowedRoles.includes(profile.role)) {
    redirect("/dashboard?error=forbidden");
  }

  return profile;
}
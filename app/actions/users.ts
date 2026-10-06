"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/session";
import { hashNik, normalizeNik } from "@/lib/auth/nik";

const roles = ["ADMIN", "PETUGAS", "MASYARAKAT"] as const;

export async function createStaff(formData: FormData) {
  await requireRole(["ADMIN"]);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const role = String(formData.get("role") ?? "PETUGAS");
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !fullName || !["ADMIN", "PETUGAS"].includes(role)) {
    return { error: "Periksa nama, email, role, dan password (minimal 8 karakter)." };
  }
  const admin = createAdminClient();
  const authLoginId = crypto.randomUUID();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
  if (error || !data.user) {
    console.error("Create staff auth user error:", error);
    return { error: "Akun gagal dibuat. Email mungkin sudah digunakan." };
  }
  const { error: profileError } = await admin.from("profiles").insert({ id: data.user.id, nik_hash: null, auth_login_id: authLoginId, full_name: fullName, phone: phone || null, address: address || null, role, is_active: true });
  if (profileError) {
    console.error("Create staff profile error:", profileError);
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "Profil akun gagal dibuat." };
  }
  revalidatePath("/dashboard/pengguna");
  redirect("/dashboard/pengguna");
}

export async function updateUser(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rawNik = String(formData.get("nik") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !roles.includes(role as (typeof roles)[number])) return { error: "Data akun tidak valid." };

  const admin = createAdminClient();
  const { data: current, error: currentError } = await admin.from("profiles").select("id, role, nik_hash, auth_login_id, is_active").eq("id", id).maybeSingle();
  if (currentError || !current) return { error: "Akun tidak ditemukan." };
  if (actor.id === id && (!isActive || role !== "ADMIN")) return { error: "Akun admin yang sedang digunakan tidak dapat dinonaktifkan atau diturunkan role-nya." };
  if (current.role === "ADMIN" && (role !== "ADMIN" || !isActive)) {
    const { count, error: countError } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "ADMIN").eq("is_active", true);
    if (countError || (count ?? 0) <= 1) return { error: "Harus ada minimal satu admin aktif." };
  }
  const { data: authData, error: authReadError } = await admin.auth.admin.getUserById(id);
  if (authReadError || !authData.user) return { error: "Akun autentikasi tidak ditemukan." };

  let nikHash: string | null = current.nik_hash;
  let authEmail = authData.user.email ?? "";
  let authLoginId = current.auth_login_id;
  if (role === "MASYARAKAT") {
    if (rawNik) {
      const normalized = normalizeNik(rawNik);
      if (!/^\d{16}$/.test(normalized)) return { error: "NIK harus terdiri dari 16 digit." };
      nikHash = hashNik(normalized);
    } else if (current.role !== "MASYARAKAT") return { error: "NIK wajib diisi untuk mengubah role menjadi masyarakat." };
    authLoginId ||= crypto.randomUUID();
    authEmail = `${authLoginId}@auth.uptdsahu.local`;
  } else {
    nikHash = null;
    if (!email && (current.role === "MASYARAKAT" || authEmail.endsWith("@auth.uptdsahu.local"))) return { error: "Email aktif wajib diisi untuk akun admin/petugas." };
    if (email) {
      if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Format email tidak valid." };
      authEmail = email;
    }
  }

  // Reject an NIK already used by another profile before mutating the account.
  if (role === "MASYARAKAT" && nikHash && nikHash !== current.nik_hash) {
    const { data: duplicate } = await admin.from("profiles").select("id").eq("nik_hash", nikHash).neq("id", id).maybeSingle();
    if (duplicate) return { error: "NIK sudah digunakan akun lain." };
  }
  const { error: authUpdateError } = await admin.auth.admin.updateUserById(id, {
    email: authEmail,
    email_confirm: true,
    ban_duration: isActive ? "none" : "876000h",
  });
  if (authUpdateError) {
    console.error("Update auth account error:", authUpdateError);
    return { error: "Gagal memperbarui akun autentikasi. Periksa email." };
  }
  const { error } = await admin.from("profiles").update({ role, nik_hash: nikHash, auth_login_id: authLoginId, is_active: isActive }).eq("id", id);
  if (error) {
    console.error("Update profile account error:", error);
    await admin.auth.admin.updateUserById(id, { email: authData.user.email, email_confirm: true, ban_duration: current.is_active ? "none" : "876000h" });
    return { error: "Gagal menyimpan perubahan akun." };
  }
  revalidatePath("/dashboard/pengguna");
  revalidatePath(`/dashboard/pengguna/${id}`);
  redirect(`/dashboard/pengguna/${id}`);
}

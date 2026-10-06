import { createAdminClient } from "@/lib/supabase/admin";
import { hashNik, normalizeNik } from "@/lib/auth/nik";

type RegisterCitizenInput = {
  nik: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
};

export async function registerCitizen(
  input: RegisterCitizenInput,
) {
  const nik = normalizeNik(input.nik);

  if (!/^\d{16}$/.test(nik)) {
    throw new Error("NIK harus terdiri dari 16 digit.");
  }

  if (input.password.length < 8) {
    throw new Error(
      "Password harus memiliki minimal 8 karakter.",
    );
  }

  if (!input.fullName.trim()) {
    throw new Error("Nama lengkap wajib diisi.");
  }

  const nikHash = hashNik(nik);

  const supabase = createAdminClient();

  // Pastikan NIK belum terdaftar
  const { data: existingProfile, error: profileCheckError } =
    await supabase
      .from("profiles")
      .select("id")
      .eq("nik_hash", nikHash)
      .maybeSingle();

  if (profileCheckError) {
    throw new Error(
      `Gagal memeriksa NIK: ${profileCheckError.message}`,
    );
  }

  if (existingProfile) {
    throw new Error("NIK sudah terdaftar.");
  }

  // ID acak yang tidak berhubungan dengan NIK
  const authLoginId = crypto.randomUUID();

  // Identifier internal untuk Supabase Auth
  const authEmail =
    `${authLoginId}@auth.uptdsahu.local`;

  // Buat user di Supabase Auth
  const {
    data: authData,
    error: authError,
  } = await supabase.auth.admin.createUser({
    email: authEmail,
    password: input.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(
      authError?.message ?? "Gagal membuat user Auth.",
    );
  }

  // Buat profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      nik_hash: nikHash,
      auth_login_id: authLoginId,
      full_name: input.fullName.trim(),
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      role: "MASYARAKAT",
      is_active: true,
    });

  // Jika profile gagal dibuat, hapus user Auth
  if (profileError) {
    await supabase.auth.admin.deleteUser(
      authData.user.id,
    );

    throw new Error(
      `Gagal membuat profile: ${profileError.message}`,
    );
  }

  return {
    userId: authData.user.id,
    authLoginId,
  };
}
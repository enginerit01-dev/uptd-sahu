"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { informationConfigs } from "@/lib/information/config";

export async function saveInformation(formData: FormData) {
  const section = String(formData.get("section") ?? "");
  if (!Object.hasOwn(informationConfigs, section)) return { error: "Bagian informasi tidak valid." };
  const key = section as keyof typeof informationConfigs;
  await requireRole(["ADMIN"]);
  const config = informationConfigs[key];
  const values: Record<string, string | number | null> = {};
  for (const field of config.fields) {
    const value = String(formData.get(field.name) ?? "").trim();
    if (field.type === "number" && value) {
      const numberValue = Number(value);
      if (!Number.isFinite(numberValue) || numberValue < 0) return { error: `${field.label} harus berupa angka positif.` };
      values[field.name] = numberValue;
    } else values[field.name] = value || null;
  }
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size) {
    const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    if (!types[photo.type] || photo.size > 5 * 1024 * 1024) return { error: "Foto harus JPG, PNG, atau WebP dengan ukuran maksimal 5 MB." };
  }
  const supabase = await createClient();
  const { data: current, error: readError } = await supabase.from(config.table).select("*").limit(1).maybeSingle();
  if (readError) { console.error(`Read ${key} information error:`, readError); return { error: "Gagal membaca informasi." }; }
  if (photo instanceof File && photo.size && current && !("photo_path" in current)) {
    return { error: `Kolom photo_path belum tersedia pada schema ${config.table}.` };
  }
  let photoPath: string | null = current && "photo_path" in current ? String(current.photo_path ?? "") || null : null;
  if (photo instanceof File && photo.size) {
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[photo.type];
    photoPath = `informasi/${key}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("informasi").upload(photoPath, photo, { contentType: photo.type });
    if (uploadError) { console.error(`Upload ${key} information photo error:`, uploadError); return { error: "Gagal mengunggah foto." }; }
    values.photo_path = photoPath;
  }
  const result = current
    ? await supabase.from(config.table).update(values).eq("id", current.id)
    : await supabase.from(config.table).insert(values);
  if (result.error) {
    console.error(`Save ${key} information error:`, result.error);
    if (photoPath && photo instanceof File && photo.size) await supabase.storage.from("informasi").remove([photoPath]);
    return { error: "Gagal menyimpan informasi. Pastikan kolom tabel sesuai konfigurasi." };
  }
  if (current && current.photo_path && photoPath && current.photo_path !== photoPath) await supabase.storage.from("informasi").remove([current.photo_path]);
  revalidateTag("public-information", { expire: 0 });
  revalidatePath("/dashboard/informasi");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { recordConfigs } from "@/lib/records/config";

function getConfig(key: string) {
  if (!Object.hasOwn(recordConfigs, key)) throw new Error("Modul tidak ditemukan.");
  const config = recordConfigs[key];
  if (!config) throw new Error("Modul tidak ditemukan.");
  return config;
}

function getValues(formData: FormData, key: string) {
  const config = getConfig(key);
  const values: Record<string, string> = {};
  for (const field of config.fields) {
    const value = String(formData.get(field.name) ?? "").trim();
    if (field.required && !value) throw new Error(`${field.label} wajib diisi.`);
    if (field.type === "select" && value && !field.options?.includes(value)) {
      throw new Error(`${field.label} tidak valid.`);
    }
    values[field.name] = value || "";
  }
  return values;
}

function validFile(file: File) {
  const extensions: Record<string, string[]> = {
    pdf: ["application/pdf"], jpg: ["image/jpeg"], jpeg: ["image/jpeg"],
    png: ["image/png"], webp: ["image/webp"],
  };
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return file.size <= 10 * 1024 * 1024 && !!extensions[ext]?.includes(file.type);
}

export async function createRecord(formData: FormData) {
  const key = String(formData.get("module") ?? "");
  const config = getConfig(key);
  const profile = await requireRole(["ADMIN", "PETUGAS"]);
  let values: Record<string, string>;
  try { values = getValues(formData, key); } catch (error) {
    return { error: error instanceof Error ? error.message : "Data tidak valid." };
  }
  const file = formData.get("document");
  if (file instanceof File && file.size && !validFile(file)) return { error: "File harus PDF, JPG, PNG, atau WebP dengan ukuran maksimal 10 MB." };

  const supabase = await createClient();
  const { data, error } = await supabase.from(config.table).insert({ ...values, created_by: profile.id }).select("id").single();
  if (error || !data) {
    console.error(`Create ${key} record error:`, error);
    return { error: `Gagal menyimpan ${config.singular}. Periksa nomor atau data yang dimasukkan.` };
  }

  if (file instanceof File && file.size) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const safeName = `${crypto.randomUUID()}.${ext}`;
    const path = `${config.prefix}/${data.id}/${safeName}`;
    const { error: uploadError } = await supabase.storage.from(config.bucket).upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      console.error(`Upload ${key} document error:`, uploadError);
      await supabase.from(config.table).delete().eq("id", data.id);
      return { error: "Data tersimpan, tetapi dokumen gagal diunggah. Silakan coba kembali." };
    }
    const { error: pathError } = await supabase.from(config.table).update({ file_name: file.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 180), file_path: path }).eq("id", data.id);
    if (pathError) {
      console.error(`Save ${key} document path error:`, pathError);
      await supabase.storage.from(config.bucket).remove([path]);
      return { error: "Dokumen sudah diunggah tetapi gagal ditautkan ke data." };
    }
  }
  revalidatePath(config.route);
  redirect(config.route);
}

export async function updateRecord(formData: FormData) {
  const key = String(formData.get("module") ?? "");
  const id = String(formData.get("id") ?? "");
  const config = getConfig(key);
  await requireRole(["ADMIN", "PETUGAS"]);
  if (!id || id.length > 100) return { error: "Data tidak valid." };
  let values: Record<string, string>;
  try { values = getValues(formData, key); } catch (error) {
    return { error: error instanceof Error ? error.message : "Data tidak valid." };
  }
  const file = formData.get("document");
  if (file instanceof File && file.size && !validFile(file)) return { error: "File harus PDF, JPG, PNG, atau WebP dengan ukuran maksimal 10 MB." };

  const supabase = await createClient();
  const { data: current } = await supabase.from(config.table).select("file_path").eq("id", id).maybeSingle();
  if (!current) return { error: "Data tidak ditemukan." };
  const { error } = await supabase.from(config.table).update(values).eq("id", id);
  if (error) {
    console.error(`Update ${key} record error:`, error);
    return { error: `Gagal memperbarui ${config.singular}.` };
  }
  if (file instanceof File && file.size) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `${config.prefix}/${id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(config.bucket).upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      console.error(`Replace ${key} document error:`, uploadError);
      return { error: "Gagal mengunggah dokumen baru." };
    }
    const { error: updateFileError } = await supabase.from(config.table).update({ file_name: file.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 180), file_path: path }).eq("id", id);
    if (updateFileError) {
      await supabase.storage.from(config.bucket).remove([path]);
      console.error(`Update ${key} document reference error:`, updateFileError);
      return { error: "Gagal menyimpan dokumen baru." };
    }
    if (current.file_path) await supabase.storage.from(config.bucket).remove([current.file_path]);
  }
  revalidatePath(config.route);
  revalidatePath(`${config.route}/${id}`);
  redirect(`${config.route}/${id}`);
}

export async function deleteRecord(formData: FormData) {
  const key = String(formData.get("module") ?? "");
  const id = String(formData.get("id") ?? "");
  const config = getConfig(key);
  await requireRole(["ADMIN", "PETUGAS"]);
  if (!id || id.length > 100) throw new Error("Data tidak valid.");
  const supabase = await createClient();
  const { data: current } = await supabase.from(config.table).select("file_path").eq("id", id).maybeSingle();
  if (!current) return;
  const { error } = await supabase.from(config.table).delete().eq("id", id);
  if (error) {
    console.error(`Delete ${key} record error:`, error);
    throw new Error(`Gagal menghapus ${config.singular}.`);
  }
  if (current.file_path) {
    const { error: storageError } = await supabase.storage.from(config.bucket).remove([current.file_path]);
    if (storageError) console.error(`Delete ${key} storage file error:`, storageError);
  }
  revalidatePath(config.route);
}

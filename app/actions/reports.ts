"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";

export type ReportState = {
  success?: boolean;
  error?: string;
};

export async function createReport(
  _previousState: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const profile = await requireRole(["MASYARAKAT"]);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(
    formData.get("description") ?? "",
  ).trim();
  const category = String(
    formData.get("category") ?? "",
  ).trim();
  const location = String(
    formData.get("location") ?? "",
  ).trim();
  const files = formData.getAll("attachments").filter(
    (value): value is File => value instanceof File && value.size > 0,
  );

  if (!title) {
    return {
      error: "Judul laporan wajib diisi.",
    };
  }

  if (!description) {
    return {
      error: "Deskripsi laporan wajib diisi.",
    };
  }

  if (!category) {
    return {
      error: "Kategori laporan wajib dipilih.",
    };
  }

  const allowedFiles: Record<string, string[]> = {
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
    webp: ["image/webp"],
    pdf: ["application/pdf"],
  };
  const allowedCategories = ["Infrastruktur", "Administrasi", "Pelayanan Publik", "Lingkungan", "Lainnya"];
  if (title.length > 160 || description.length > 5000 || location.length > 300 || !allowedCategories.includes(category)) {
    return { error: "Periksa kembali panjang judul, kategori, lokasi, dan deskripsi laporan." };
  }
  if (files.length > 5 || files.reduce((total, file) => total + file.size, 0) > 25 * 1024 * 1024 || files.some((file) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    return file.size > 5 * 1024 * 1024 || !allowedFiles[ext]?.includes(file.type);
  })) {
    return { error: "Lampiran maksimal 5 file, masing-masing 5 MB (JPG, PNG, WebP, atau PDF)." };
  }

  const supabase = await createClient();

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: profile.id,
      title,
      description,
      category,
      location: location || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Create report error:", error);

    return {
      error: "Gagal mengirim laporan.",
    };
  }

  const uploadedPaths: string[] = [];
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const safeName = `${crypto.randomUUID()}.${extension}`;
    const path = `laporan/${report.id}/${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("laporan")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Report attachment upload error:", uploadError);
      if (uploadedPaths.length) await supabase.storage.from("laporan").remove(uploadedPaths);
      await supabase.from("reports").delete().eq("id", report.id);
      return { error: "Gagal mengunggah lampiran. Silakan coba kembali." };
    }
    uploadedPaths.push(path);
  }

  if (files.length) {
    const { error: attachmentError } = await supabase
      .from("report_attachments")
      .insert(files.map((file, index) => ({
        report_id: report.id,
        file_name: file.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 180),
        file_path: uploadedPaths[index],
        file_type: file.type,
        file_size: file.size,
      })));
    if (attachmentError) {
      console.error("Report attachment record error:", attachmentError);
      await supabase.storage.from("laporan").remove(uploadedPaths);
      await supabase.from("reports").delete().eq("id", report.id);
      return { error: "Gagal menyimpan data lampiran." };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pelaporan");
  revalidatePath(`/dashboard/pelaporan/${report.id}`);

  return {
    success: true,
  };
}

export async function updateReportStatus(
  formData: FormData,
): Promise<void> {
  const profile = await requireRole([
    "ADMIN",
    "PETUGAS",
  ]);

  const reportId = String(
    formData.get("reportId") ?? "",
  );

  const status = String(
    formData.get("status") ?? "",
  );

  const adminNote = String(
    formData.get("adminNote") ?? "",
  ).trim();

  const allowedStatuses = [
    "PENDING",
    "DIPROSES",
    "SELESAI",
    "DITOLAK",
  ] as const;

  if (!reportId) {
    throw new Error("ID laporan tidak ditemukan.");
  }

  if (
    !allowedStatuses.includes(
      status as (typeof allowedStatuses)[number],
    )
  ) {
    throw new Error("Status laporan tidak valid.");
  }
  if (adminNote.length > 2000) throw new Error("Catatan maksimal 2.000 karakter.");

  const supabase = await createClient();

  const { error } = await supabase
    .from("reports")
    .update({
      status,
      handled_by: profile.id,
      admin_note: adminNote || null,
    })
    .eq("id", reportId);

  if (error) {
    console.error(
      "Update report status error:",
      error,
    );

    throw new Error(
      "Gagal memperbarui status laporan.",
    );
  }

  revalidatePath("/dashboard/pelaporan");
  revalidatePath(`/dashboard/pelaporan/${reportId}`);
}

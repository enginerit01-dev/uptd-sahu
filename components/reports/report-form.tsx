"use client";

import { useActionState } from "react";
import { createReport, type ReportState } from "@/app/actions/reports";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ReportState = {};

export function ReportForm() {
  const [state, formAction, pending] = useActionState(
    createReport,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Judul Laporan
        </Label>

        <Input
          id="title"
          name="title"
          placeholder="Contoh: Jalan rusak di Desa..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachments">Lampiran</Label>
        <Input
          id="attachments"
          name="attachments"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          multiple
        />
        <p className="text-xs text-muted-foreground">Maksimal 5 file, 5 MB per file. Format JPG, PNG, WebP, atau PDF.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">
          Kategori
        </Label>

        <select
          id="category"
          name="category"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">
            Pilih kategori
          </option>

          <option value="Infrastruktur">
            Infrastruktur
          </option>

          <option value="Administrasi">
            Administrasi
          </option>

          <option value="Pelayanan Publik">
            Pelayanan Publik
          </option>

          <option value="Lingkungan">
            Lingkungan
          </option>

          <option value="Lainnya">
            Lainnya
          </option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">
          Lokasi
        </Label>

        <Input
          id="location"
          name="location"
          placeholder="Contoh: Desa Sahu, Kecamatan Sahu"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Deskripsi
        </Label>

        <Textarea
          id="description"
          name="description"
          placeholder="Jelaskan laporan Anda secara rinci..."
          className="min-h-32"
          required
        />
      </div>

      {state.error && (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm"
          role="status"
        >
          Laporan berhasil dikirim.
        </div>
      )}

      <Button
        type="submit"
        disabled={pending}
      >
        {pending
          ? "Mengirim..."
          : "Kirim Laporan"}
      </Button>
    </form>
  );
}

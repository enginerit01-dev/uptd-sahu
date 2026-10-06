"use client";

import { useState, useTransition } from "react";

import { updateReportStatus } from "@/app/actions/reports";
import { Button } from "@/components/ui/button";

type ReportStatusFormProps = {
  reportId: string;
  status:
    | "PENDING"
    | "DIPROSES"
    | "SELESAI"
    | "DITOLAK";
  adminNote: string | null;
};

export function ReportStatusForm({
  reportId,
  status,
  adminNote,
}: ReportStatusFormProps) {
  const [pending, startTransition] =
    useTransition();
  const [message, setMessage] = useState("");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget,
    );

    startTransition(async () => {
      setMessage("");
      try {
        await updateReportStatus(formData);
        setMessage("Status laporan berhasil diperbarui.");
      } catch {
        setMessage("Status laporan gagal diperbarui. Coba kembali.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        type="hidden"
        name="reportId"
        value={reportId}
      />

      <div className="grid gap-3 md:grid-cols-[200px_1fr_auto]">
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="PENDING">
            PENDING
          </option>

          <option value="DIPROSES">
            DIPROSES
          </option>

          <option value="SELESAI">
            SELESAI
          </option>

          <option value="DITOLAK">
            DITOLAK
          </option>
        </select>

        <input
          name="adminNote"
          defaultValue={adminNote ?? ""}
          placeholder="Catatan penanganan..."
          maxLength={2000}
          className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />

        <Button
          type="submit"
          disabled={pending}
        >
          {pending
            ? "Menyimpan..."
            : "Simpan"}
        </Button>
      </div>
      {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
    </form>
  );
}

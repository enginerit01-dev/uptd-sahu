"use client";

import { useTransition } from "react";
import { deleteRecord } from "@/app/actions/records";
import { Button } from "@/components/ui/button";

export function RecordDeleteButton({ module, id, label }: { module: string; id: string; label: string }) {
  const [pending, startTransition] = useTransition();
  return <form action={deleteRecord} onSubmit={event => {
    if (!window.confirm(`Hapus ${label}? Tindakan ini tidak dapat dibatalkan.`)) event.preventDefault();
    else { event.preventDefault(); const data = new FormData(event.currentTarget); startTransition(() => deleteRecord(data)); }
  }}>
    <input type="hidden" name="module" value={module} /><input type="hidden" name="id" value={id} />
    <Button type="submit" variant="destructive" size="sm" disabled={pending}>{pending ? "Menghapus…" : "Hapus"}</Button>
  </form>;
}

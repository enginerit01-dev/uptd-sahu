"use client";

import { useState, useTransition } from "react";
import { createRecord, updateRecord } from "@/app/actions/records";
import type { RecordConfig } from "@/lib/records/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RecordForm({ config, record }: { config: RecordConfig; record?: Record<string, unknown> }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const editing = !!record;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = editing ? await updateRecord(data) : await createRecord(data);
      if (result?.error) setError(result.error);
    });
  }

  return <form onSubmit={submit} className="space-y-5">
    <input type="hidden" name="module" value={Object.entries({ kearsipan: "/dashboard/kearsipan", "surat-masuk": "/dashboard/surat-masuk", "surat-keluar": "/dashboard/surat-keluar" }).find(([, route]) => route === config.route)?.[0] ?? ""} />
    {editing && <input type="hidden" name="id" value={String(record.id ?? "")} />}
    <div className="grid gap-5 sm:grid-cols-2">
      {config.fields.map(field => <div key={field.name} className={`space-y-2 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
        <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-destructive"> *</span>}</Label>
        {field.type === "textarea" ? <Textarea id={field.name} name={field.name} defaultValue={String(record?.[field.name] ?? "")} rows={4} required={field.required} />
          : field.type === "select" ? <select id={field.name} name={field.name} defaultValue={String(record?.[field.name] ?? field.options?.[0] ?? "")} required={field.required} className="h-10 w-full rounded-lg border bg-background px-3 text-sm">{field.options?.map(option => <option key={option}>{option}</option>)}</select>
          : <Input id={field.name} name={field.name} type={field.type ?? "text"} defaultValue={String(record?.[field.name] ?? "")} required={field.required} />}
      </div>)}
    </div>
    <div className="space-y-2">
      <Label htmlFor="document">Dokumen pendukung {editing && <span className="font-normal text-muted-foreground">(kosongkan jika tidak diganti)</span>}</Label>
      <Input id="document" name="document" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" />
      <p className="text-xs text-muted-foreground">PDF, JPG, PNG, atau WebP; maksimal 10 MB.</p>
    </div>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : editing ? "Simpan perubahan" : `Simpan ${config.singular}`}</Button>
  </form>;
}

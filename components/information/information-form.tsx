"use client";

import { useState, useTransition } from "react";
import { saveInformation } from "@/app/actions/information";
import { informationConfigs } from "@/lib/information/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Section = keyof typeof informationConfigs;
export function InformationForm({ section, values }: { section: Section; values: Record<string, unknown> }) {
  const [error, setError] = useState(""); const [success, setSuccess] = useState(false); const [pending, startTransition] = useTransition();
  const config = informationConfigs[section];
  return <form className="space-y-5" onSubmit={event => { event.preventDefault(); setError(""); setSuccess(false); const data = new FormData(event.currentTarget); startTransition(async () => { const result = await saveInformation(data); if (result?.error) setError(result.error); else setSuccess(true); }); }}>
    <input type="hidden" name="section" value={section} />
    <div className="grid gap-5 sm:grid-cols-2">{config.fields.map(field => <div key={field.name} className={`space-y-2 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}><Label htmlFor={`${section}-${field.name}`}>{field.label}</Label>{field.type === "textarea" ? <Textarea id={`${section}-${field.name}`} name={field.name} rows={4} defaultValue={String(values[field.name] ?? "")} /> : <Input id={`${section}-${field.name}`} name={field.name} type={field.type ?? "text"} defaultValue={String(values[field.name] ?? "")} />}</div>)}</div>
    <div className="space-y-2"><Label htmlFor={`${section}-photo`}>Foto {section === "kecamatan" ? "kecamatan" : "kantor"}</Label><Input id={`${section}-photo`} name="photo" type="file" accept="image/jpeg,image/png,image/webp" /><p className="text-xs text-muted-foreground">JPG, PNG, atau WebP; maksimal 5 MB.</p></div>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}{success && <p role="status" className="rounded-lg bg-primary/10 p-3 text-sm">Informasi berhasil disimpan.</p>}
    <Button disabled={pending}>{pending ? "Menyimpan…" : "Simpan informasi"}</Button>
  </form>;
}

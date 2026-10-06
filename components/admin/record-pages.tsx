import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, Plus, Search } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { recordConfigs } from "@/lib/records/config";
import { RecordForm } from "@/components/admin/record-form";
import { RecordDeleteButton } from "@/components/admin/record-delete-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getConfig(module: string) {
  if (!Object.hasOwn(recordConfigs, module)) notFound();
  const config = recordConfigs[module];
  if (!config) notFound();
  return config;
}

export async function RecordListPage({ module, searchParams }: { module: string; searchParams: Promise<{ q?: string; status?: string; category?: string; from?: string; to?: string; page?: string }> }) {
  const config = getConfig(module);
  await requireRole(["ADMIN", "PETUGAS"]);
  const { q = "", status = "", category = "", from = "", to = "", page: pageValue = "1" } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.from(config.table).select("*").order("created_at", { ascending: false }).limit(500);
  if (error) { console.error(`Load ${module} error:`, error); throw new Error(`Gagal memuat data ${config.singular}.`); }
  const query = q.trim().toLowerCase();
  const statusField = config.fields.find(field => field.name === "status");
  const dateField = config.fields.find(field => field.type === "date");
  const categoryField = config.fields.find(field => field.name === "category");
  const rows = (data ?? []).filter(row => {
    const date = dateField ? String(row[dateField.name] ?? "") : "";
    return (!query || config.fields.some(field => String(row[field.name] ?? "").toLowerCase().includes(query)))
      && (!status || row.status === status)
      && (!category || row.category === category)
      && (!from || !date || date >= from)
      && (!to || !date || date <= to);
  });
  const page = Math.max(1, Number.parseInt(pageValue, 10) || 1);
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const listHref = (target: number) => `${config.route}?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(category ? { category } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}), page: String(target) })}`;
  const categories = [...new Set((data ?? []).map(row => String(row.category ?? "")).filter(Boolean))];
  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-medium text-primary">Administrasi dokumen</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{config.title}</h1><p className="mt-2 text-sm text-muted-foreground">Kelola, cari, dan unduh dokumen {config.singular}.</p></div>
      <Button render={<Link href={`${config.route}/baru`} />}><Plus /> Tambah {config.singular}</Button>
    </header>
    <form className="grid gap-2 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6" action={config.route}>
      <div className="relative sm:col-span-2 lg:col-span-2"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder={`Cari ${config.singular}…`} className="pl-9" /></div>
      {categoryField && <select name="category" defaultValue={category} className="h-10 rounded-lg border bg-background px-3 text-sm"><option value="">Semua kategori</option>{categories.map(value => <option key={value}>{value}</option>)}</select>}
      {statusField && <select name="status" defaultValue={status} className="h-10 rounded-lg border bg-background px-3 text-sm"><option value="">Semua status</option>{statusField.options?.map(value => <option key={value}>{value}</option>)}</select>}
      {dateField && <Input aria-label="Dari tanggal" name="from" type="date" defaultValue={from} />}
      {dateField && <Input aria-label="Sampai tanggal" name="to" type="date" defaultValue={to} />}
      <Button variant="outline" type="submit">Terapkan filter</Button>
    </form>
    {!rows.length ? <section className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center"><FileText className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-3 font-semibold">{q ? "Data tidak ditemukan" : "Belum ada data"}</h2><p className="mt-1 text-sm text-muted-foreground">{q ? "Coba kata kunci lain." : `Tambahkan ${config.singular} pertama untuk memulai.`}</p></section>
      : <div className="grid gap-4">{visibleRows.map(row => <article key={row.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Link href={`${config.route}/${row.id}`} className="min-w-0 flex-1 group">
          <p className="truncate text-lg font-semibold group-hover:text-primary">{String(row.title ?? row.subject ?? row.archive_number ?? row.letter_number ?? "Dokumen")}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">{config.fields.filter(f => !["title", "subject", "archive_number", "letter_number", "description"].includes(f.name)).slice(0, 3).map(field => <span key={field.name}>{String(row[field.name] ?? "—")}</span>)}</div>
          <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{String(row.description ?? "")}</p>
        </Link>
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" render={<Link href={`${config.route}/${row.id}`} />}>Detail</Button><RecordDeleteButton module={module} id={String(row.id)} label={config.singular} /></div>
      </article>)}</div>}
    <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground"><span>Halaman {page} dari {pageCount} · {rows.length} data ditemukan</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} render={page > 1 ? <Link href={listHref(page - 1)} /> : undefined}>Sebelumnya</Button><Button size="sm" variant="outline" disabled={page >= pageCount} render={page < pageCount ? <Link href={listHref(page + 1)} /> : undefined}>Berikutnya</Button></div></div>
  </div>;
}

export async function RecordNewPage({ module }: { module: string }) {
  const config = getConfig(module);
  await requireRole(["ADMIN", "PETUGAS"]);
  return <div className="mx-auto max-w-3xl space-y-6"><Button variant="outline" size="sm" render={<Link href={config.route} />}><ArrowLeft /> Kembali</Button><section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-bold">Tambah {config.singular}</h1><p className="mt-2 mb-7 text-sm text-muted-foreground">Lengkapi informasi dan unggah dokumen pendukung.</p><RecordForm config={config} /></section></div>;
}

export async function RecordDetailPage({ module, id }: { module: string; id: string }) {
  const config = getConfig(module);
  await requireRole(["ADMIN", "PETUGAS"]);
  const supabase = await createClient();
  const { data: row, error } = await supabase.from(config.table).select("*").eq("id", id).maybeSingle();
  if (error) console.error(`Load ${module} detail error:`, error);
  if (!row) notFound();
  const { data: signed } = row.file_path ? await supabase.storage.from(config.bucket).createSignedUrl(row.file_path, 600) : { data: null };
  return <div className="mx-auto max-w-4xl space-y-6">
    <Button variant="outline" size="sm" render={<Link href={config.route} />}><ArrowLeft /> Kembali ke daftar</Button>
    <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary">Detail {config.singular}</p><h1 className="mt-1 text-2xl font-bold">{String(row.title ?? row.subject ?? row.archive_number ?? row.letter_number ?? config.singular)}</h1></div><Button variant="outline" render={<Link href={`${config.route}/${id}/edit`} />}>Edit data</Button></div>
      <dl className="mt-7 grid gap-x-8 gap-y-5 border-t pt-6 sm:grid-cols-2">{config.fields.map(field => <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{String(row[field.name] ?? "—")}</dd></div>)}</dl>
      {row.file_path && <a href={signed?.signedUrl ?? "#"} target="_blank" rel="noreferrer" className="mt-7 flex items-center gap-3 rounded-xl border p-4 hover:bg-muted"><FileText className="size-5 text-primary" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{String(row.file_name ?? "Dokumen")}</span><Download className="size-4" /></a>}
      <p className="mt-7 border-t pt-4 text-xs text-muted-foreground">Dibuat {row.created_at ? new Date(String(row.created_at)).toLocaleString("id-ID") : "—"}</p>
    </section>
  </div>;
}

export async function RecordEditPage({ module, id }: { module: string; id: string }) {
  const config = getConfig(module);
  await requireRole(["ADMIN", "PETUGAS"]);
  const supabase = await createClient();
  const { data: row, error } = await supabase.from(config.table).select("*").eq("id", id).maybeSingle();
  if (error) console.error(`Load ${module} edit data error:`, error);
  if (!row) notFound();
  return <div className="mx-auto max-w-3xl space-y-6"><Button variant="outline" size="sm" render={<Link href={`${config.route}/${id}`} />}><ArrowLeft /> Kembali ke detail</Button><section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-bold">Edit {config.singular}</h1><p className="mt-2 mb-7 text-sm text-muted-foreground">Perbarui data dan dokumen bila diperlukan.</p><RecordForm config={config} record={row as Record<string, unknown>} /></section></div>;
}

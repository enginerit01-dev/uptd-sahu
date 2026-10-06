import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, MapPin, CalendarDays } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ReportStatusForm } from "@/components/reports/report-status-form";
import { Button } from "@/components/ui/button";

const statusText: Record<string, string> = {
  PENDING: "Menunggu",
  DIPROSES: "Diproses",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireAuth();
  const supabase = await createClient();
  const { data: report, error } = await supabase
    .from("reports")
    .select("id, reporter_id, title, description, category, location, status, admin_note, handled_by, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("Get report detail error:", error);
  if (!report || (profile.role === "MASYARAKAT" && report.reporter_id !== profile.id)) notFound();

  const [{ data: attachments, error: attachmentError }, handler] = await Promise.all([
    supabase.from("report_attachments").select("id, file_name, file_path, file_type, file_size").eq("report_id", id),
    report.handled_by
      ? supabase.from("profiles").select("full_name").eq("id", report.handled_by).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (attachmentError) console.error("Get report attachments error:", attachmentError);

  const files = await Promise.all((attachments ?? []).map(async (file) => {
    const { data, error: urlError } = await supabase.storage.from("laporan").createSignedUrl(file.file_path, 60 * 10);
    if (urlError) console.error("Create report attachment URL error:", urlError);
    return { ...file, url: data?.signedUrl ?? null };
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <Button variant="outline" size="sm" render={<Link href="/dashboard/pelaporan" />}><ArrowLeft /> Kembali ke daftar</Button>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{report.category}</span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{statusText[report.status] ?? report.status}</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{report.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{new Date(report.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</span>
            {report.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{report.location}</span>}
          </div>
          <div className="my-7 border-t" />
          <h2 className="font-semibold">Deskripsi laporan</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{report.description}</p>
          {report.admin_note && <div className="mt-7 rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Catatan petugas</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{report.admin_note}</p><p className="mt-2 text-xs text-muted-foreground">Ditangani oleh {handler.data?.full_name ?? "Petugas"}</p></div>}
          <div className="mt-8">
            <h2 className="font-semibold">Lampiran <span className="text-muted-foreground">({files.length})</span></h2>
            {files.length ? <ul className="mt-3 grid gap-3 sm:grid-cols-2">{files.map(file => <li key={file.id} className="flex min-w-0 items-center gap-3 rounded-xl border p-3"><FileText className="size-5 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.file_name}</p><p className="text-xs text-muted-foreground">{(file.file_size / 1024 / 1024).toFixed(2)} MB</p></div>{file.url && <a className="rounded-lg p-2 hover:bg-muted" href={file.url} target="_blank" rel="noreferrer" aria-label={`Unduh ${file.file_name}`}><Download className="size-4" /></a>}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Tidak ada lampiran.</p>}
          </div>
        </section>
        <aside className="h-fit rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold">Status penanganan</p>
          <p className="mt-2 text-sm text-muted-foreground">Laporan Anda dapat dipantau dari halaman ini.</p>
          {profile.role !== "MASYARAKAT" ? <div className="mt-5"><ReportStatusForm reportId={report.id} status={report.status} adminNote={report.admin_note} /></div> : <p className="mt-4 rounded-xl bg-muted/60 p-3 text-sm font-medium">{statusText[report.status] ?? report.status}</p>}
        </aside>
      </div>
    </div>
  );
}

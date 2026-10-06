import Link from "next/link";

import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ReportStatusForm } from "@/components/reports/report-status-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }> }) {
  const filters = await searchParams;
  const profile = await requireAuth();

  const supabase = await createClient();

  const isCitizen = profile.role === "MASYARAKAT";

  let query = supabase
    .from("reports")
    .select(
      `
        id,
        title,
        description,
        category,
        location,
        status,
        admin_note,
        handled_by,
        created_at,
        reporter_id
      `,
      { count: "exact" },
    )
    .order("created_at", {
      ascending: false,
    });

  const allowedStatuses = ["PENDING", "DIPROSES", "SELESAI", "DITOLAK"];
  const status = allowedStatuses.includes(filters.status ?? "") ? filters.status : "";
  const search = (filters.q ?? "").trim().slice(0, 100);
  const category = (filters.category ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(filters.page ?? "1", 10) || 1);
  if (status) query = query.eq("status", status as (typeof allowedStatuses)[number]);
  if (search) query = query.ilike("title", `%${search.replace(/[%_]/g, "\\$&")}%`);
  if (category) query = query.eq("category", category);

  if (isCitizen) {
    query = query.eq("reporter_id", profile.id);
  }

  query = query.range((page - 1) * 20, page * 20 - 1);

  const { data: reports, error, count } = await query;

  if (error) {
    console.error("Get reports error:", error);

    throw new Error("Gagal mengambil data laporan.");
  }

  const { data: categories } = await supabase.from("reports").select("category").order("category");
  const availableCategories = [...new Set((categories ?? []).map(item => item.category).filter(Boolean))];
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / 20));
  const pageHref = (target: number) => `/dashboard/pelaporan?${new URLSearchParams({ ...(search ? { q: search } : {}), ...(status ? { status } : {}), ...(category ? { category } : {}), page: String(target) })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pelaporan</h1>

          <p className="text-muted-foreground">
            {isCitizen
              ? "Daftar laporan yang Anda kirimkan."
              : "Daftar laporan masyarakat yang masuk."}
          </p>
        </div>

        {isCitizen && (
          <Button render={<Link href="/dashboard/pelaporan/buat" />}>
            Buat Laporan
          </Button>
        )}
      </div>

      <form action="/dashboard/pelaporan" className="grid gap-2 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_170px_190px_auto]">
        <Input name="q" defaultValue={search} placeholder="Cari judul laporan" />
        <select name="status" defaultValue={status} className="h-10 rounded-lg border bg-background px-3 text-sm"><option value="">Semua status</option>{allowedStatuses.map(value => <option key={value} value={value}>{value}</option>)}</select>
        <select name="category" defaultValue={category} className="h-10 rounded-lg border bg-background px-3 text-sm"><option value="">Semua kategori</option>{availableCategories.map(value => <option key={value} value={value}>{value}</option>)}</select>
        <Button type="submit" variant="outline">Terapkan</Button>
      </form>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
          <p className="font-medium">Belum ada laporan</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {isCitizen
              ? "Laporan yang Anda kirim akan muncul di sini."
              : "Belum ada laporan masyarakat yang masuk."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <Link href={`/dashboard/pelaporan/${report.id}`} className="font-semibold hover:text-primary">{report.title}</Link>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.category}
                    {report.location ? ` • ${report.location}` : ""}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{report.description}</p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <Badge variant={report.status === "SELESAI" ? "default" : report.status === "DITOLAK" ? "destructive" : "secondary"}>{report.status}</Badge>
              </div>

              {report.admin_note && (
                <div className="mt-4 rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Catatan Petugas
                  </p>

                  <p className="mt-1 text-sm">{report.admin_note}</p>
                </div>
              )}

              {!isCitizen && (
                <div className="mt-5 border-t pt-5">
                  <ReportStatusForm
                    reportId={report.id}
                    status={report.status}
                    adminNote={report.admin_note}
                  />
                </div>
              )}
              <div className="mt-4 border-t pt-3">
                <Link href={`/dashboard/pelaporan/${report.id}`} className="text-sm font-medium text-primary hover:underline">Lihat detail →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground"><span>{count ?? 0} laporan · Halaman {page} dari {pageCount}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} render={page > 1 ? <Link href={pageHref(page - 1)} /> : undefined}>Sebelumnya</Button><Button variant="outline" size="sm" disabled={page >= pageCount} render={page < pageCount ? <Link href={pageHref(page + 1)} /> : undefined}>Berikutnya</Button></div></div>
    </div>
  );
}

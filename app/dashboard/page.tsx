import Link from "next/link";
import { Activity, Archive, ArrowUpRight, CheckCircle2, Clock3, FileInput, FileOutput, FileText, UsersRound } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type Metric = { label: string; value: number; icon: typeof FileText; tone: string; href?: string };

export default async function DashboardPage() {
  const profile = await requireAuth();
  const supabase = await createClient();
  const reportCount = async (status?: string) => {
    let query = supabase.from("reports").select("id", { count: "exact", head: true });
    if (profile.role === "MASYARAKAT") query = query.eq("reporter_id", profile.id);
    if (status) query = query.eq("status", status as "PENDING" | "DIPROSES" | "SELESAI" | "DITOLAK");
    const result = await query;
    return { count: result.count, error: result.error };
  };
  const requests: Array<PromiseLike<{ count: number | null; error: unknown }>> = [
    reportCount(), reportCount("PENDING"), reportCount("DIPROSES"), reportCount("SELESAI"), reportCount("DITOLAK"),
  ];
  if (profile.role !== "MASYARAKAT") requests.push(
    supabase.from("archives").select("id", { count: "exact", head: true }).then(result => ({ count: result.count, error: result.error })),
    supabase.from("incoming_letters").select("id", { count: "exact", head: true }).then(result => ({ count: result.count, error: result.error })),
    supabase.from("outgoing_letters").select("id", { count: "exact", head: true }).then(result => ({ count: result.count, error: result.error })),
  );
  if (profile.role === "ADMIN") requests.push(
    supabase.from("profiles").select("id", { count: "exact", head: true }).then(result => ({ count: result.count, error: result.error })),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "MASYARAKAT").then(result => ({ count: result.count, error: result.error })),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "PETUGAS").then(result => ({ count: result.count, error: result.error })),
  );
  const results = await Promise.all(requests);
  results.forEach((result, index) => { if (result.error) console.error("Dashboard metric query failed:", index, result.error); });
  const count = (index: number) => results[index]?.count ?? 0;
  const metrics: Metric[] = profile.role === "MASYARAKAT" ? [
    { label: "Total laporan saya", value: count(0), icon: FileText, tone: "bg-primary/10 text-primary", href: "/dashboard/pelaporan" },
    { label: "Menunggu", value: count(1), icon: Clock3, tone: "bg-amber-500/10 text-amber-700" },
    { label: "Diproses", value: count(2), icon: Activity, tone: "bg-blue-500/10 text-blue-700" },
    { label: "Selesai", value: count(3), icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-700" },
  ] : profile.role === "PETUGAS" ? [
    { label: "Total laporan", value: count(0), icon: FileText, tone: "bg-primary/10 text-primary", href: "/dashboard/pelaporan" },
    { label: "Menunggu", value: count(1), icon: Clock3, tone: "bg-amber-500/10 text-amber-700" },
    { label: "Diproses", value: count(2), icon: Activity, tone: "bg-blue-500/10 text-blue-700" },
    { label: "Selesai", value: count(3), icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-700" },
    { label: "Ditolak", value: count(4), icon: FileText, tone: "bg-destructive/10 text-destructive" },
    { label: "Arsip", value: count(5), icon: Archive, tone: "bg-violet-500/10 text-violet-700", href: "/dashboard/kearsipan" },
    { label: "Surat masuk", value: count(6), icon: FileInput, tone: "bg-sky-500/10 text-sky-700", href: "/dashboard/surat-masuk" },
    { label: "Surat keluar", value: count(7), icon: FileOutput, tone: "bg-teal-500/10 text-teal-700", href: "/dashboard/surat-keluar" },
  ] : [
    { label: "Total pengguna", value: count(8), icon: UsersRound, tone: "bg-primary/10 text-primary", href: "/dashboard/pengguna" },
    { label: "Masyarakat", value: count(9), icon: UsersRound, tone: "bg-blue-500/10 text-blue-700" },
    { label: "Petugas", value: count(10), icon: UsersRound, tone: "bg-violet-500/10 text-violet-700" },
    { label: "Total laporan", value: count(0), icon: FileText, tone: "bg-primary/10 text-primary", href: "/dashboard/pelaporan" },
    { label: "Menunggu", value: count(1), icon: Clock3, tone: "bg-amber-500/10 text-amber-700" },
    { label: "Diproses", value: count(2), icon: Activity, tone: "bg-blue-500/10 text-blue-700" },
    { label: "Selesai", value: count(3), icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-700" },
    { label: "Arsip", value: count(5), icon: Archive, tone: "bg-violet-500/10 text-violet-700", href: "/dashboard/kearsipan" },
    { label: "Surat masuk", value: count(6), icon: FileInput, tone: "bg-sky-500/10 text-sky-700", href: "/dashboard/surat-masuk" },
    { label: "Surat keluar", value: count(7), icon: FileOutput, tone: "bg-teal-500/10 text-teal-700", href: "/dashboard/surat-keluar" },
  ];
  const { data: recentReports, error: recentError } = await (() => {
    let query = supabase.from("reports").select("id, title, status, created_at").order("created_at", { ascending: false }).limit(5);
    if (profile.role === "MASYARAKAT") query = query.eq("reporter_id", profile.id);
    return query;
  })();
  if (recentError) console.error("Recent report query failed:", recentError);

  return <div className="space-y-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Ringkasan layanan</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Selamat datang, {profile.full_name}</h1><p className="mt-2 text-sm text-muted-foreground">Pantau aktivitas layanan publik UPTD Kecamatan Sahu.</p></div>{profile.role === "MASYARAKAT" && <Button render={<Link href="/dashboard/pelaporan/buat" />}>Buat laporan <ArrowUpRight /></Button>}</header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(metric => { const Icon = metric.icon; const content = <><span className={`inline-flex size-10 items-center justify-center rounded-xl ${metric.tone}`}><Icon className="size-5" /></span><p className="mt-5 text-sm text-muted-foreground">{metric.label}</p><p className="mt-1 text-3xl font-bold tracking-tight">{metric.value.toLocaleString("id-ID")}</p></>; return <article key={metric.label} className="rounded-2xl border bg-card p-5 shadow-sm">{metric.href ? <Link href={metric.href} className="block transition hover:opacity-75">{content}</Link> : content}</article>; })}</section>
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Laporan terbaru</h2><p className="mt-1 text-xs text-muted-foreground">Aktivitas laporan terkini</p></div><Link href="/dashboard/pelaporan" className="text-sm font-medium text-primary hover:underline">Lihat semua</Link></div>{recentReports?.length ? <div className="divide-y">{recentReports.map(report => <Link key={report.id} href={`/dashboard/pelaporan/${report.id}`} className="flex flex-col gap-2 px-5 py-4 transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{report.title}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</p></div><span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">{report.status}</span></Link>)}</div> : <div className="px-5 py-10 text-center"><p className="font-medium">Belum ada laporan</p><p className="mt-1 text-sm text-muted-foreground">Laporan terbaru akan ditampilkan di sini.</p></div>}</section>
  </div>;
}

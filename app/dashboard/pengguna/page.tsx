import Link from "next/link";
import { Plus, Search, UsersRound } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const roleNames: Record<string, string> = { ADMIN: "Admin", PETUGAS: "Petugas", MASYARAKAT: "Masyarakat" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  await requireRole(["ADMIN"]);
  const { q = "", role = "" } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("profiles").select("id, full_name, phone, address, role, is_active, created_at").order("created_at", { ascending: false }).limit(500);
  if (["ADMIN", "PETUGAS", "MASYARAKAT"].includes(role)) query = query.eq("role", role as "ADMIN" | "PETUGAS" | "MASYARAKAT");
  const { data: users, error } = await query;
  if (error) { console.error("Load user list error:", error); throw new Error("Gagal memuat daftar pengguna."); }
  const search = q.trim().toLowerCase();
  const rows = (users ?? []).filter(user => !search || [user.full_name, user.phone, user.address].some(value => String(value ?? "").toLowerCase().includes(search)));
  return <div className="space-y-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Administrasi akun</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Manajemen Pengguna</h1><p className="mt-2 text-sm text-muted-foreground">Kelola akun masyarakat, petugas, dan admin.</p></div><Button render={<Link href="/dashboard/pengguna/baru" />}><Plus /> Buat akun petugas</Button></header>
    <form action="/dashboard/pengguna" className="grid gap-2 sm:grid-cols-[1fr_220px_auto]"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Cari nama, telepon, atau alamat" className="pl-9" /></div><select name="role" defaultValue={role} className="h-10 w-full rounded-lg border bg-background px-3 text-sm"><option value="">Semua role</option><option value="ADMIN">Admin</option><option value="PETUGAS">Petugas</option><option value="MASYARAKAT">Masyarakat</option></select><Button variant="outline">Terapkan filter</Button></form>
    {!rows.length ? <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center"><UsersRound className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-3 font-semibold">Pengguna tidak ditemukan</h2><p className="mt-1 text-sm text-muted-foreground">Ubah filter pencarian atau role.</p></div> : <div className="grid gap-3">{rows.map(user => <Link key={user.id} href={`/dashboard/pengguna/${user.id}`} className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{user.full_name}</p><p className="mt-1 text-sm text-muted-foreground">{user.phone || "Nomor telepon belum tersedia"}{user.address ? ` · ${user.address}` : ""}</p><p className="mt-1 text-xs text-muted-foreground">Bergabung {new Date(user.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</p></div><div className="flex items-center gap-2"><Badge variant="outline">{roleNames[user.role] ?? user.role}</Badge><Badge variant={user.is_active ? "default" : "destructive"}>{user.is_active ? "Aktif" : "Nonaktif"}</Badge></div></Link>)}</div>}
    <p className="text-xs text-muted-foreground">Menampilkan {rows.length} pengguna.</p>
  </div>;
}

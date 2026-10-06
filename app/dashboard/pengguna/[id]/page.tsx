import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UserEditForm } from "@/components/users/user-forms";
import { Badge } from "@/components/ui/badge";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data: user, error } = await supabase.from("profiles").select("id, full_name, phone, address, role, is_active, created_at").eq("id", id).maybeSingle();
  if (error) console.error("Load user detail error:", error);
  if (!user) notFound();
  const admin = createAdminClient();
  const { data: authData } = await admin.auth.admin.getUserById(id);
  const authEmail = authData.user?.email ?? "";
  return <div className="mx-auto max-w-4xl space-y-6"><Button variant="outline" size="sm" render={<Link href="/dashboard/pengguna" />}><ArrowLeft /> Kembali ke pengguna</Button><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary">Profil pengguna</p><h1 className="mt-1 text-2xl font-bold">{user.full_name}</h1></div><Badge variant={user.is_active ? "default" : "destructive"}>{user.is_active ? "Aktif" : "Nonaktif"}</Badge></div><dl className="mt-7 grid gap-5 border-t pt-6 sm:grid-cols-2"><div><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</dt><dd className="mt-1 text-sm">{user.role}</dd></div><div><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Telepon</dt><dd className="mt-1 text-sm">{user.phone || "Belum tersedia"}</dd></div><div className="sm:col-span-2"><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Alamat</dt><dd className="mt-1 text-sm">{user.address || "Belum tersedia"}</dd></div><div><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tanggal dibuat</dt><dd className="mt-1 text-sm">{new Date(user.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</dd></div></dl></section><aside className="h-fit rounded-2xl border bg-card p-5 shadow-sm"><h2 className="font-semibold">Kelola akses</h2><p className="mt-1 mb-5 text-sm text-muted-foreground">Perubahan role atau status akses akun.</p><UserEditForm user={user} email={authEmail.endsWith("@auth.uptdsahu.local") ? "" : authEmail} /></aside></div></div>;
}

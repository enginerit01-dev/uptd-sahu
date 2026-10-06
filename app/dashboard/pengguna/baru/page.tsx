import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { StaffCreateForm } from "@/components/users/user-forms";

export default async function NewUserPage() {
  await requireRole(["ADMIN"]);
  return <div className="mx-auto max-w-3xl space-y-6"><Button variant="outline" size="sm" render={<Link href="/dashboard/pengguna" />}><ArrowLeft /> Kembali</Button><section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-bold">Buat akun admin atau petugas</h1><p className="mt-2 mb-7 text-sm text-muted-foreground">Akun akan dibuat dengan email dan password awal yang Anda tentukan.</p><StaffCreateForm /></section></div>;
}

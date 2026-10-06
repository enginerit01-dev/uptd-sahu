"use client";

import { useState, useTransition } from "react";
import { createStaff, updateUser } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StaffCreateForm() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return <form className="space-y-5" onSubmit={event => { event.preventDefault(); setError(""); const data = new FormData(event.currentTarget); startTransition(async () => { const result = await createStaff(data); if (result?.error) setError(result.error); }); }}>
    <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="fullName">Nama lengkap</Label><Input id="fullName" name="fullName" required /></div><div className="space-y-2"><Label htmlFor="email">Email akun</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div><div className="space-y-2"><Label htmlFor="phone">Nomor telepon</Label><Input id="phone" name="phone" type="tel" /></div><div className="space-y-2"><Label htmlFor="role">Role</Label><select id="role" name="role" defaultValue="PETUGAS" className="h-10 w-full rounded-lg border bg-background px-3 text-sm"><option value="PETUGAS">Petugas</option><option value="ADMIN">Admin</option></select></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="address">Alamat</Label><Input id="address" name="address" /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="password">Password awal</Label><Input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required /><p className="text-xs text-muted-foreground">Minimal 8 karakter. Sampaikan password awal secara aman kepada pemilik akun.</p></div></div>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<Button disabled={pending}>{pending ? "Membuat akun…" : "Buat akun"}</Button>
  </form>;
}

export function UserEditForm({ user, email }: { user: { id: string; role: string; is_active: boolean }; email: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState(user.role);
  return <form className="space-y-5" onSubmit={event => { event.preventDefault(); setError(""); const data = new FormData(event.currentTarget); startTransition(async () => { const result = await updateUser(data); if (result?.error) setError(result.error); }); }}>
    <input type="hidden" name="id" value={user.id} />
    <div className="space-y-2"><Label htmlFor="role">Role akun</Label><select id="role" name="role" value={role} onChange={event => setRole(event.target.value)} className="h-10 w-full rounded-lg border bg-background px-3 text-sm"><option value="MASYARAKAT">Masyarakat</option><option value="PETUGAS">Petugas</option><option value="ADMIN">Admin</option></select></div>
    {role !== "MASYARAKAT" && <div className="space-y-2"><Label htmlFor="email">Email login</Label><Input id="email" name="email" type="email" defaultValue={email.endsWith("@auth.uptdsahu.local") ? "" : email} placeholder="nama@kantor.go.id" /><p className="text-xs text-muted-foreground">Email perlu diisi saat masyarakat diubah menjadi admin atau petugas.</p></div>}
    {role === "MASYARAKAT" && <div className="space-y-2"><Label htmlFor="nik">NIK {user.role !== "MASYARAKAT" && "(wajib untuk perubahan role)"}</Label><Input id="nik" name="nik" inputMode="numeric" maxLength={16} minLength={16} autoComplete="off" /><p className="text-xs text-muted-foreground">NIK akan disimpan sebagai HMAC, bukan teks biasa. Kosongkan untuk mempertahankan NIK yang sudah terdaftar.</p></div>}
    <div className="space-y-2"><Label htmlFor="is_active">Status akun</Label><select id="is_active" name="is_active" defaultValue={String(user.is_active)} className="h-10 w-full rounded-lg border bg-background px-3 text-sm"><option value="true">Aktif</option><option value="false">Nonaktif</option></select></div>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<Button disabled={pending}>{pending ? "Menyimpan…" : "Simpan perubahan"}</Button>
  </form>;
}

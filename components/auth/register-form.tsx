"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type RegisterState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);
  return <form action={formAction} className="space-y-4">
    <div className="space-y-2"><Label htmlFor="fullName">Nama lengkap</Label><Input id="fullName" name="fullName" autoComplete="name" required /></div>
    <div className="space-y-2"><Label htmlFor="nik">NIK</Label><Input id="nik" name="nik" inputMode="numeric" autoComplete="off" maxLength={16} minLength={16} required placeholder="16 digit NIK" /></div>
    <div className="space-y-2"><Label htmlFor="phone">Nomor telepon</Label><Input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
    <div className="space-y-2"><Label htmlFor="address">Alamat</Label><Textarea id="address" name="address" autoComplete="street-address" rows={2} /></div>
    <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required /><p className="text-xs text-muted-foreground">Minimal 8 karakter.</p></div>
    {state.error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>}
    {state.success && <p role="status" className="rounded-lg bg-primary/10 p-3 text-sm">Akun berhasil dibuat. <Link href="/login" className="font-semibold text-primary underline">Masuk sekarang</Link></p>}
    <Button className="w-full" disabled={pending}>{pending ? "Mendaftarkan…" : "Buat akun masyarakat"}</Button>
  </form>;
}

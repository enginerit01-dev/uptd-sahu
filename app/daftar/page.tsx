import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return <main className="grid min-h-screen bg-muted/30 lg:grid-cols-2">
    <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex"><Link href="/" className="text-lg font-bold">UPTD Kecamatan Sahu</Link><div><p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-75">Layanan Publik Digital</p><h1 className="mt-4 max-w-lg text-4xl font-bold leading-tight">Buat akun untuk menyampaikan aspirasi dan laporan Anda.</h1><p className="mt-4 max-w-md text-sm leading-6 opacity-80">Pantau perkembangan laporan dan akses informasi layanan Kecamatan Sahu.</p></div><p className="text-xs opacity-70">Halmahera Barat · Maluku Utara</p></section>
    <section className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8"><Link href="/" className="text-sm font-semibold text-primary">UPTD Sahu</Link><h2 className="mt-6 text-2xl font-bold">Daftar masyarakat</h2><p className="mt-2 mb-6 text-sm text-muted-foreground">Isi data diri untuk membuat akun layanan publik.</p><RegisterForm /><p className="mt-5 text-center text-sm text-muted-foreground">Sudah punya akun? <Link href="/login" className="font-medium text-primary hover:underline">Masuk</Link></p></div></section>
  </main>;
}

import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-5 sm:p-8">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">UPTD Kecamatan Sahu</p>
          <h1 className="text-2xl font-bold tracking-tight">
            Sistem Informasi Layanan Publik
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Kantor UPTD Kecamatan Sahu
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun? <Link href="/daftar" className="font-medium text-primary hover:underline">Daftar masyarakat</Link>
        </p>
      </div>
    </main>
  );
}

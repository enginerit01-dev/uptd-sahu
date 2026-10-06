"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm"><h2 className="text-xl font-bold">Halaman belum dapat dimuat</h2><p className="mt-2 text-sm text-muted-foreground">Terjadi kendala saat mengambil data. Coba muat ulang halaman.</p><Button className="mt-5" onClick={() => reset()}>Coba lagi</Button></div>;
}

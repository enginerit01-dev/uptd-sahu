import Link from "next/link";

import { ReportForm } from "@/components/reports/report-form";
import { Button } from "@/components/ui/button";

export default function CreateReportPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Buat Laporan
          </h1>

          <p className="text-muted-foreground">
            Sampaikan laporan atau pengaduan kepada
            UPTD Kecamatan Sahu.
          </p>
        </div>

        <Button variant="outline" render={<Link href="/dashboard/pelaporan" />}>
          Kembali
        </Button>
      </div>

      <div className="rounded-xl border bg-background p-6">
        <ReportForm />
      </div>
    </div>
  );
}

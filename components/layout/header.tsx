import { logout } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

type HeaderProps = {
  fullName: string;
  role: string;
};

export function Header({
  fullName,
  role,
}: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur sm:px-6">
      <div className="hidden sm:block">
        <h2 className="text-sm font-semibold">Sistem Informasi Layanan Publik</h2>
        <p className="text-xs text-muted-foreground">UPTD Kecamatan Sahu · Halmahera Barat</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">
            {fullName}
          </p>

          <p className="text-xs text-muted-foreground">
            {role === "ADMIN" ? "Administrator" : role === "PETUGAS" ? "Petugas" : "Masyarakat"}
          </p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <LogOut className="size-4" /><span className="hidden sm:inline">Keluar</span>
          </button>
        </form>
      </div>
    </header>
  );
}

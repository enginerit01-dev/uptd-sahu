"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  navigationItems,
  type UserRole,
} from "@/lib/navigation";

type SidebarProps = {
  role: UserRole;
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const items = navigationItems.filter((item) =>
    item.roles.includes(role),
  );

  return (
    <>
    <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="border-b px-6 py-5">
        <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">US</span><div><h1 className="font-semibold">UPTD Kecamatan Sahu</h1><p className="mt-0.5 text-xs text-muted-foreground">Layanan Publik</p></div></div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
    <nav aria-label="Navigasi utama" className="sticky top-0 z-20 flex gap-1 overflow-x-auto border-b bg-background/95 px-3 py-2 backdrop-blur md:hidden">
      {items.map(item => { const Icon = item.icon; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}><Icon className="size-4" /><span>{item.title}</span></Link>; })}
    </nav>
    </>
  );
}

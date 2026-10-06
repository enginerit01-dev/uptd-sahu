import { requireAuth } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAuth();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 md:flex-row">
      <Sidebar role={profile.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          fullName={profile.full_name}
          role={profile.role}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UPTD Sahu | Layanan Publik",
  description: "Sistem Informasi Layanan Publik UPTD Kecamatan Sahu, Halmahera Barat.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

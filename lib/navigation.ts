import type { LucideIcon } from "lucide-react";
import {
  Archive,
  FileInput,
  FileOutput,
  FileText,
  Home,
  Info,
  Users,
} from "lucide-react";

export type UserRole =
  | "ADMIN"
  | "PETUGAS"
  | "MASYARAKAT";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["ADMIN", "PETUGAS", "MASYARAKAT"],
  },
  {
    title: "Pelaporan",
    href: "/dashboard/pelaporan",
    icon: FileText,
    roles: ["ADMIN", "PETUGAS", "MASYARAKAT"],
  },
  {
    title: "Kearsipan",
    href: "/dashboard/kearsipan",
    icon: Archive,
    roles: ["ADMIN", "PETUGAS"],
  },
  {
    title: "Surat Masuk",
    href: "/dashboard/surat-masuk",
    icon: FileInput,
    roles: ["ADMIN", "PETUGAS"],
  },
  {
    title: "Surat Keluar",
    href: "/dashboard/surat-keluar",
    icon: FileOutput,
    roles: ["ADMIN", "PETUGAS"],
  },
  {
    title: "Informasi",
    href: "/dashboard/informasi",
    icon: Info,
    roles: ["ADMIN", "PETUGAS", "MASYARAKAT"],
  },
  {
    title: "Manajemen Pengguna",
    href: "/dashboard/pengguna",
    icon: Users,
    roles: ["ADMIN"],
  },
];
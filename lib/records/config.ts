export type RecordField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date" | "select";
  options?: string[];
  required?: boolean;
};

export type RecordConfig = {
  title: string;
  singular: string;
  route: string;
  table: "archives" | "incoming_letters" | "outgoing_letters";
  bucket: "arsip" | "surat-masuk" | "surat-keluar";
  prefix: string;
  fields: RecordField[];
};

export const recordConfigs: Record<string, RecordConfig> = {
  kearsipan: {
    title: "Kearsipan", singular: "arsip", route: "/dashboard/kearsipan", table: "archives", bucket: "arsip", prefix: "arsip",
    fields: [
      { name: "archive_number", label: "Nomor arsip", required: true },
      { name: "title", label: "Judul arsip", required: true },
      { name: "category", label: "Kategori", required: true },
      { name: "document_type", label: "Jenis dokumen", required: true },
      { name: "document_date", label: "Tanggal dokumen", type: "date", required: true },
      { name: "description", label: "Deskripsi", type: "textarea" },
    ],
  },
  "surat-masuk": {
    title: "Surat Masuk", singular: "surat masuk", route: "/dashboard/surat-masuk", table: "incoming_letters", bucket: "surat-masuk", prefix: "surat-masuk",
    fields: [
      { name: "letter_number", label: "Nomor surat", required: true },
      { name: "letter_date", label: "Tanggal surat", type: "date", required: true },
      { name: "received_date", label: "Tanggal diterima", type: "date", required: true },
      { name: "sender", label: "Pengirim", required: true },
      { name: "subject", label: "Perihal", required: true },
      { name: "description", label: "Keterangan", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["DITERIMA", "DIPROSES", "SELESAI", "DIARSIPKAN"], required: true },
    ],
  },
  "surat-keluar": {
    title: "Surat Keluar", singular: "surat keluar", route: "/dashboard/surat-keluar", table: "outgoing_letters", bucket: "surat-keluar", prefix: "surat-keluar",
    fields: [
      { name: "letter_number", label: "Nomor surat", required: true },
      { name: "letter_date", label: "Tanggal surat", type: "date", required: true },
      { name: "recipient", label: "Tujuan", required: true },
      { name: "subject", label: "Perihal", required: true },
      { name: "description", label: "Keterangan", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["DRAFT", "DIPROSES", "DITERBITKAN", "DIARSIPKAN"], required: true },
    ],
  },
};

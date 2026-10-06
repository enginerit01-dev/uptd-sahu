export type InformationField = { name: string; label: string; type?: "text" | "textarea" | "number" };

export const informationConfigs: Record<string, { title: string; table: "office_information" | "district_information"; fields: InformationField[] }> = {
  kantor: {
    title: "Informasi Kantor", table: "office_information", fields: [
      { name: "office_name", label: "Nama kantor" }, { name: "address", label: "Alamat", type: "textarea" },
      { name: "phone", label: "Nomor telepon" }, { name: "email", label: "Email" },
      { name: "description", label: "Deskripsi", type: "textarea" }, { name: "vision", label: "Visi", type: "textarea" },
      { name: "mission", label: "Misi", type: "textarea" }, { name: "service_hours", label: "Jam pelayanan", type: "textarea" },
    ],
  },
  kecamatan: {
    title: "Informasi Kecamatan", table: "district_information", fields: [
      { name: "district_name", label: "Nama kecamatan" }, { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "history", label: "Sejarah", type: "textarea" }, { name: "geography", label: "Geografi", type: "textarea" },
      { name: "population", label: "Jumlah penduduk", type: "number" }, { name: "area", label: "Luas wilayah" },
      { name: "village_count", label: "Jumlah desa", type: "number" },
    ],
  },
};

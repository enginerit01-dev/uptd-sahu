import Image from "next/image";
import { Building2, MapPinned } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { informationConfigs } from "@/lib/information/config";
import { getPublicInformation } from "@/lib/information/data";
import { InformationForm } from "@/components/information/information-form";

export default async function InformationPage() {
  const profile = await requireAuth();
  const supabase = await createClient();
  const [officeResult, districtResult] = await Promise.all([
    getPublicInformation("office_information"),
    getPublicInformation("district_information"),
  ]);
  const office = officeResult ?? {};
  const district = districtResult ?? {};
  const photoPath = String(district.photo_path ?? "");
  const { data: photo } = photoPath ? await supabase.storage.from("informasi").createSignedUrl(photoPath, 600) : { data: null };
  const officePhotoPath = String(office.photo_path ?? "");
  const { data: officePhoto } = officePhotoPath ? await supabase.storage.from("informasi").createSignedUrl(officePhotoPath, 600) : { data: null };

  function display(value: unknown) { return value === null || value === undefined || value === "" ? "Belum tersedia" : String(value); }

  return <div className="space-y-8">
    <header><p className="text-sm font-medium text-primary">Informasi publik</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Informasi Kecamatan Sahu</h1><p className="mt-2 text-sm text-muted-foreground">Profil kantor dan wilayah untuk masyarakat.</p></header>
    <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Building2 className="size-5" /></span><div><p className="text-sm font-medium text-muted-foreground">UPTD</p><h2 className="text-xl font-bold">{display(office.office_name)}</h2></div></div>
      {officePhoto?.signedUrl && <div className="relative mt-6 aspect-[16/7] overflow-hidden rounded-xl bg-muted"><Image src={officePhoto.signedUrl} alt="Foto kantor UPTD Kecamatan Sahu" fill unoptimized className="object-cover" /></div>}
      {profile.role === "ADMIN" ? <div className="mt-7 border-t pt-6"><h3 className="mb-5 font-semibold">Edit informasi kantor</h3><InformationForm section="kantor" values={office} /></div> : <dl className="mt-7 grid gap-5 border-t pt-6 sm:grid-cols-2">{informationConfigs.kantor.fields.map(field => <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6">{display(office[field.name])}</dd></div>)}</dl>}
    </section>
    <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><MapPinned className="size-5" /></span><div><p className="text-sm font-medium text-muted-foreground">Profil wilayah</p><h2 className="text-xl font-bold">{display(district.district_name)}</h2></div></div>
      {photo?.signedUrl && <div className="relative mt-6 aspect-[16/7] overflow-hidden rounded-xl bg-muted"><Image src={photo.signedUrl} alt="Foto Kecamatan Sahu" fill unoptimized className="object-cover" /></div>}
      {profile.role === "ADMIN" ? <div className="mt-7 border-t pt-6"><h3 className="mb-5 font-semibold">Edit informasi kecamatan</h3><InformationForm section="kecamatan" values={district} /></div> : <dl className="mt-7 grid gap-5 border-t pt-6 sm:grid-cols-2">{informationConfigs.kecamatan.fields.map(field => <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6">{display(district[field.name])}</dd></div>)}</dl>}
    </section>
  </div>;
}

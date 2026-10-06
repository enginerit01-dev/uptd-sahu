import { RecordEditPage } from "@/components/admin/record-pages";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <RecordEditPage module="surat-keluar" id={id} />; }

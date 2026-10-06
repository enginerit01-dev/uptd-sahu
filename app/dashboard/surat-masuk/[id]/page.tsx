import { RecordDetailPage } from "@/components/admin/record-pages";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <RecordDetailPage module="surat-masuk" id={id} />; }

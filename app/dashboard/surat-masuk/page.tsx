import { RecordListPage } from "@/components/admin/record-pages";
export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) { return <RecordListPage module="surat-masuk" searchParams={searchParams} />; }

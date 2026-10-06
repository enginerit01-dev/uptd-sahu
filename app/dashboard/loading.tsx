export default function DashboardLoading() {
  return <div className="space-y-6" aria-label="Memuat halaman">
    <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
    <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border bg-card" />)}</div>
    <div className="h-72 animate-pulse rounded-2xl border bg-card" />
  </div>;
}

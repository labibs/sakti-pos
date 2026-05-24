export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-md border border-line bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-ink">Offline</h1>
        <p className="mt-2 text-sm text-slate-500">
          Koneksi tidak tersedia. Data transaksi baru bisa disinkronkan lagi setelah online.
        </p>
      </div>
    </main>
  );
}

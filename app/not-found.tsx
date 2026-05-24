import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sage-50 px-4 text-center text-sage-900">
      <section className="max-w-md rounded-lg border border-line bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wider text-sage-500">404</p>
        <h1 className="mt-2 text-3xl font-black">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sage-600">Route yang dibuka tidak tersedia di aplikasi ini.</p>
        <Link href="/" className="mt-6 inline-flex rounded-lg bg-sage-800 px-5 py-3 font-semibold text-white">
          Kembali
        </Link>
      </section>
    </main>
  );
}

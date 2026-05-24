import Link from "next/link";
import { AlertTriangle, Store } from "lucide-react";

export default function RejectedOnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sage-50 px-4 py-8 text-sage-900">
      <section className="w-full max-w-xl rounded-lg border border-line bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-red-600">Perlu Revisi</p>
        <h1 className="mt-2 text-3xl font-black">Pendaftaran belum bisa diaktifkan</h1>
        <p className="mt-3 text-sage-600">
          Admin perlu meminta revisi data merchant sebelum akses dashboard kasir dibuka.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-sage-800 px-5 py-3 font-semibold text-white"
        >
          <Store className="h-4 w-4" />
          Perbaiki Data
        </Link>
      </section>
    </main>
  );
}

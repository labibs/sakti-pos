import Link from "next/link";
import { SignedIn, SignedOut, SignUp } from "@clerk/nextjs";
import { ArrowRight, Store } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-sage-50 px-4 py-8 text-sage-900">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
        <section>
          <Link href="/" className="inline-flex items-center gap-2 font-bold">
            <Store className="h-5 w-5 text-sage-700" />
            SAKTI POS
          </Link>
          <h1 className="mt-10 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">Register calon customer aplikasi cashier</h1>
          <p className="mt-4 max-w-xl text-lg text-sage-600">
            Buat akun owner, lalu lanjutkan wizard untuk menyimpan nama toko, kategori bisnis, modul awal, dan
            Clerk user id sebagai pemilik merchant.
          </p>
          <SignedIn>
            <Link
              href="/onboarding"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-sage-800 px-5 py-3 font-semibold text-white"
            >
              Lanjut Onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
          </SignedIn>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
          <SignedOut>
            <SignUp routing="path" path="/register" signInUrl="/sign-in" fallbackRedirectUrl="/onboarding" />
          </SignedOut>
          <SignedIn>
            <div className="p-6">
              <p className="text-sm font-semibold text-sage-500">Akun sudah aktif</p>
              <h2 className="mt-2 text-2xl font-bold">Lanjutkan pendaftaran toko</h2>
              <p className="mt-2 text-sage-600">
                Wizard onboarding akan mengambil user id dari Clerk dan mengirimkannya saat membuat merchant.
              </p>
            </div>
          </SignedIn>
        </section>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import {
  useUser,
  useAuth,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Store,
  TabletSmartphone,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const highlights = [
  "Daftar toko lewat akun Clerk",
  "Verifikasi merchant sebelum akses kasir",
  "Setup modul, kategori, dan produk setelah aktif",
];

export default function HomePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ambil role dari publicMetadata Clerk
  const role = user?.publicMetadata?.role;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      // REDIRECT OTOMATIS JIKA ADMIN
      if (role === "admin") {
        router.push("/admin/merchants");
        return;
      }

      // Jika role adalah customer, arahkan ke area belanja customer
      if (role === "customer") {
        router.push("/customer");
        return;
      }

      const getStatus = async () => {
        setLoading(true);
        try {
          const token = await getToken();
          if (token) {
            const data = await apiFetch<any>("/me", { token });
            if (data?.merchant) {
              setStatus(data.merchant.status);
              window.localStorage.setItem(
                "sakti:onboarding",
                JSON.stringify({
                  name: data.merchant.name,
                  status: data.merchant.status,
                  owner_email: data.merchant.profile?.email,
                }),
              );
            } else {
              setStatus(null);
              window.localStorage.removeItem("sakti:onboarding");
            }
          }
        } catch (e) {
          console.warn("Home: Status check failed", e);
        } finally {
          setLoading(false);
        }
      };
      getStatus();
    }
  }, [isSignedIn, isLoaded, getToken, role, router]);

  if (isLoaded && isSignedIn && role === "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sage-50">
        <Loader2 className="h-8 w-8 animate-spin text-sage-700" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sage-50 text-sage-900">
      <header className="border-b border-line bg-white/85 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Store className="h-5 w-5 text-sage-700" />
            SAKTI POS
          </Link>
          <div className="flex items-center gap-2">
            {!mounted ? null : (
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-sage-700"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-sage-800 px-4 py-2 text-sm font-semibold text-white"
                >
                  Daftar
                </Link>
              </SignedOut>
            )}
            {!mounted ? null : (
              <SignedIn>
                <Link
                  href={role === "admin" ? "/admin/merchants" : "/dashboard"}
                  className="mr-2 text-sm font-semibold text-sage-700"
                >
                  {role === "admin" ? "Admin Panel" : "Dashboard"}
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1fr_420px] lg:items-center lg:py-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-sage-600">
            Cashier SaaS Onboarding
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            {!isSignedIn || !status
              ? "Daftarkan toko, verifikasi merchant, lalu mulai setup kasir."
              : status === "active"
                ? "Selamat datang kembali!"
                : "Pendaftaran Anda sedang diproses"}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-sage-600">
            {isSignedIn && status
              ? "Anda dapat memantau status verifikasi merchant di sini atau langsung menuju dashboard jika sudah aktif."
              : "Alur pendaftaran SAKTI POS dibuat self-service untuk calon customer: akun, data toko, kategori bisnis, modul awal, dan status verifikasi dalam satu flow."}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {!isSignedIn || !status ? (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage-800 px-5 py-3 font-semibold text-white"
                >
                  Daftarkan Toko
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 py-3 font-semibold text-sage-700"
                >
                  Buka Dashboard
                </Link>
              </>
            ) : (
              <>
                {status === "active" ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage-800 px-5 py-3 font-semibold text-white"
                  >
                    Buka Dashboard Utama
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href="/onboarding/pending"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage-800 px-5 py-3 font-semibold text-white"
                  >
                    Cek Status Pendaftaran
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="mt-8 grid gap-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sage-700">
                <CheckCircle2 className="h-5 w-5 text-sage-700" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            <div className="rounded-lg bg-sage-900 p-5 text-white">
              <TabletSmartphone className="h-7 w-7" />
              <p className="mt-8 text-sm text-sage-200">Status Anda</p>
              <h2 className="mt-1 text-2xl font-bold">
                {!isSignedIn || !status
                  ? "Belum Daftar"
                  : loading
                    ? "Memuat..."
                    : status === "active"
                      ? "Merchant Aktif"
                      : status === "rejected"
                        ? "Pendaftaran Ditolak"
                        : "Merchant Pending"}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-line p-4">
                <p className="text-sm text-sage-500">Langkah</p>
                <p className="mt-1 font-bold">
                  {isSignedIn && status ? "Verifikasi" : "Registrasi"}
                </p>
              </div>
              <div className="rounded-lg border border-line p-4">
                <p className="text-sm text-sage-500">Akses</p>
                <p className="mt-1 font-bold">
                  {status === "active" ? "Penuh" : "Terbatas"}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-line p-4">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5 text-sage-700" />
                <p className="font-semibold">
                  {status === "active"
                    ? "Dashboard siap digunakan."
                    : "Dashboard aktif setelah admin approve"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

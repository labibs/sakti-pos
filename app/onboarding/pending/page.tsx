
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, LogOut, Store, Loader2 } from "lucide-react";
import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import { apiFetch } from "@/lib/api";

type PendingMerchant = {
  name?: string;
  owner_email?: string;
  business_type?: string;
  modules?: string[];
  status?: "pending" | "active" | "rejected";
};

export default function PendingOnboardingPage() {
  const [merchant, setMerchant] = useState<PendingMerchant | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const fetchStatus = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await apiFetch<any>("/me", { token });
          
          if (data && data.merchant) {
            const apiMerchant: PendingMerchant = {
              name: data.merchant.name,
              owner_email: data.merchant.profile?.email,
              status: data.merchant.status,
            };
            setMerchant(apiMerchant);
            window.localStorage.setItem("sakti:onboarding", JSON.stringify(apiMerchant));
            
            if (data.merchant.status === "active") router.push("/dashboard/setup");
            if (data.merchant.status === "rejected") router.push("/onboarding/rejected");
          } else {
            // JIKA DATA MERCHANT TIDAK ADA DI API:
            // Berarti user ini memang belum pernah daftar sama sekali.
            window.localStorage.removeItem("sakti:onboarding");
            router.push("/onboarding");
          }
        }
      } catch (error) {
        console.warn("PendingPage: Status check failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const timer = window.setInterval(fetchStatus, 5000);
    return () => window.clearInterval(timer);
  }, [router, getToken, userLoaded, isSignedIn]);

  if (loading || !merchant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sage-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-sage-700" />
          <p className="mt-4 text-sage-600 font-medium">Memeriksa status pendaftaran...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sage-50 px-4 py-8 text-sage-900">
      <section className="w-full max-w-xl rounded-lg border border-line bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-sage-800">
          <Clock3 className="h-7 w-7" />
        </div>
        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-sage-500">Menunggu Verifikasi</p>
        <h1 className="mt-2 text-3xl font-black">Pendaftaran toko sedang diperiksa</h1>
        <p className="mt-3 text-sage-600">
          Setelah admin mengaktifkan merchant, owner akan diarahkan ke dashboard untuk memilih modul, membuat kategori, dan menambahkan produk.
        </p>

        <div className="mt-6 grid gap-3 text-left">
          <Info label="Nama toko" value={merchant?.name ?? "-"} />
          <Info label="Email owner" value={merchant?.owner_email ?? "-"} />
          <Info label="Status" value={merchant?.status ?? "pending"} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-5 py-3 font-semibold text-sage-700">
            <Store className="h-4 w-4" />
            Edit Pendaftaran
          </Link>
          <SignOutButton>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage-800 px-5 py-3 font-semibold text-white">
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </SignOutButton>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="text-sm text-sage-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

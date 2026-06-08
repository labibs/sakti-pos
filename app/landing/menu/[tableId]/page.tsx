"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  UtensilsCrossed,
  ArrowRight,
  LogIn,
  User,
  History,
  TicketPercent,
  Coins,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCustomerStore } from "@/lib/customer-store";
import { useAuth, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function LandingMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const tableId = params.tableId as string;
  const merchantId = searchParams.get("m");

  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("Sakti POS");
  const [logoUrl, setLogoUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  const store = useCustomerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isLoaded) return;

    if (isSignedIn) {
      router.push(`/landing/menu/${tableId}?m=${merchantId}`);
      return;
    }

    if (store.guestId) {
      router.push(`/guest/menu/${tableId}?m=${merchantId}`);
      return;
    }
  }, [
    mounted,
    isLoaded,
    isSignedIn,
    store.guestId,
    tableId,
    merchantId,
    router,
  ]);

  useEffect(() => {
    if (!mounted) return;
    async function load() {
      try {
        setLoading(true);
        const merchantQuery = merchantId ? `?m=${merchantId}` : "";
        const resMe = await (merchantId
          ? apiFetch<any>(`/public/merchants/${merchantId}`, { useCache: true })
          : Promise.resolve(null));

        const merchantData = resMe?.merchant || resMe;
        if (merchantData) {
          setStoreName(merchantData.name);
          setLogoUrl(merchantData.profile?.logo_url || "");
        }
      } catch (error) {
        console.error("Failed to load landing menu:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mounted, merchantId]);

  if (!mounted || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-sage-600 h-10 w-10" />
          <p className="text-sage-400 font-black text-[10px] uppercase tracking-widest">
            Menyiapkan Meja Anda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-sage-900 font-sans selection:bg-sage-100">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-sage-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[30%] bg-sage-100 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <main className="relative z-10 max-w-xl mx-auto px-6 pt-12 pb-24">
        {/* Restaurant Identity */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-sage-900 rounded-[32px] blur-2xl opacity-10 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center p-3 border border-sage-50">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <UtensilsCrossed className="w-10 h-10 text-sage-900" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-sage-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <p className="text-sage-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
            Selamat Datang di
          </p>
          <h1 className="text-4xl font-black text-sage-900 tracking-tight leading-none mb-4 uppercase italic">
            {storeName}
          </h1>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-50 rounded-full border border-sage-100">
            <MapPin className="w-3.5 h-3.5 text-sage-600" />
            <span className="text-xs font-black text-sage-700 uppercase tracking-wider">
              Meja Nomor {tableId}
            </span>
          </div>
        </div>

        {/* Hero Message */}
        <div className="bg-sage-900 rounded-[40px] p-8 text-white shadow-2xl shadow-sage-900/20 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h2 className="text-2xl font-black leading-tight mb-4">
            Nikmati kemudahan memesan dari meja Anda.
          </h2>
          <p className="text-sage-300 text-sm font-medium leading-relaxed mb-8 opacity-80">
            Scan, pilih menu, dan pesanan akan segera diantarkan tanpa perlu
            antre di kasir.
          </p>

          <div className="flex flex-col gap-3">
            <SignInButton mode="modal">
              <button className="group w-full h-16 bg-white text-sage-900 rounded-2xl flex items-center justify-between px-6 font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all shadow-xl shadow-white/5">
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5" />
                  Login / Daftar
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignInButton>

            <button
              onClick={() =>
                router.push(`/guest/menu/${tableId}?m=${merchantId}`)
              }
              className="w-full h-16 bg-sage-800 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest border border-white/10 active:scale-[0.98] transition-all"
            >
              <User className="w-5 h-5" />
              Lanjut Sebagai Tamu
            </button>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="h-px flex-1 bg-sage-100"></div>
            <p className="text-[10px] font-black text-sage-300 uppercase tracking-[0.2em]">
              Kenapa harus Login?
            </p>
            <div className="h-px flex-1 bg-sage-100"></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-sage-50/50 border border-sage-100 p-5 rounded-[28px] flex items-start gap-4 hover:bg-sage-50 transition-colors">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
                <History className="w-6 h-6 text-sage-600" />
              </div>
              <div>
                <h3 className="font-black text-sm text-sage-900 uppercase tracking-tight mb-1">
                  Riwayat Tersimpan
                </h3>
                <p className="text-xs text-sage-500 font-medium leading-relaxed">
                  Lihat pesanan favorit Anda sebelumnya dan pesan kembali hanya
                  dengan satu klik.
                </p>
              </div>
            </div>

            <div className="bg-sage-50/50 border border-sage-100 p-5 rounded-[28px] flex items-start gap-4 hover:bg-sage-50 transition-colors">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
                <TicketPercent className="w-6 h-6 text-sage-600" />
              </div>
              <div>
                <h3 className="font-black text-sm text-sage-900 uppercase tracking-tight mb-1">
                  Promo Eksklusif
                </h3>
                <p className="text-xs text-sage-500 font-medium leading-relaxed">
                  Dapatkan update promo terbaru dan diskon khusus hanya untuk
                  member terdaftar.
                </p>
              </div>
            </div>

            <div className="bg-sage-50/50 border border-sage-100 p-5 rounded-[28px] flex items-start gap-4 hover:bg-sage-50 transition-colors">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
                <Coins className="w-6 h-6 text-sage-600" />
              </div>
              <div>
                <h3 className="font-black text-sm text-sage-900 uppercase tracking-tight mb-1">
                  Kumpulkan Poin
                </h3>
                <p className="text-xs text-sage-500 font-medium leading-relaxed">
                  Kumpulkan poin SAKTI dari setiap transaksi dan tukarkan dengan
                  menu gratis!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="flex justify-center gap-8 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-sage-50 text-sage-400 mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-sage-400 uppercase tracking-widest">
                Fast Service
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-sage-50 text-sage-400 mb-2">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-sage-400 uppercase tracking-widest">
                Fresh Food
              </span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-sage-300 uppercase tracking-[0.2em]">
            Powered by SAKTI POS
          </p>
        </div>
      </main>
    </div>
  );
}

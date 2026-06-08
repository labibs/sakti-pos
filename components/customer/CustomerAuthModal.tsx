"use client";

import { useEffect, useState } from "react";
import { useUser, SignUpButton } from "@clerk/nextjs";
import {
  Loader2,
  UserPlus,
  LogIn,
  CheckCircle2,
  Utensils,
  ArrowRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";

interface CustomerAuthModalProps {
  merchantId: string | null;
  tableId: string;
  onRegisterSuccess: (customerId: number, name: string) => void;
  onGuestLogin: () => void;
}

export function CustomerAuthModal({
  merchantId,
  tableId,
  onRegisterSuccess,
  onGuestLogin,
}: CustomerAuthModalProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);

  useEffect(() => {
    if (merchantId) {
      apiFetch<any>(`/public/merchants/${merchantId}`).then((res) => {
        setMerchant(res?.merchant || res);
      });
    }
  }, [merchantId]);

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !success) {
      handleAutoSync();
    }
  }, [isLoaded, isSignedIn, user]);

  const handleAutoSync = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api-proxy/public/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId ? parseInt(merchantId) : null,
          clerk_user_id: user.id,
          name: user.fullName || user.username || "Customer",
          email: user.primaryEmailAddress?.emailAddress || null,
          phone: user.primaryPhoneNumber?.phoneNumber || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal sinkronisasi data");
      }

      const customer = await res.json();
      setSuccess(true);
      setTimeout(() => {
        onRegisterSuccess(customer.id, customer.name);
      }, 1500);
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan saat pendaftaran");
      setLoading(false);
    }
  };

  if (loading || success) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          {success ? (
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto animate-in zoom-in duration-300">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          ) : (
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-sage-600 mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Utensils className="w-4 h-4 text-sage-400" />
              </div>
            </div>
          )}
          <div>
            <h2 className="text-lg font-black text-sage-900 uppercase tracking-tight">
              {success ? "Berhasil!" : "Menghubungkan Akun"}
            </h2>
            <p className="text-[10px] text-sage-400 font-bold uppercase tracking-[0.2em] mt-1">
              {success ? "Siap Memesan" : "Mohon tunggu sebentar"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F9FAFB] flex flex-col overflow-y-auto">
      {/* Hero Section with Branding */}
      <div className="relative h-[45vh] w-full flex flex-col items-center justify-center p-8 bg-white overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-sage-900 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-sage-900 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center shadow-xl shadow-sage-900/10 border border-line/50 overflow-hidden relative">
            {merchant?.profile?.logo_url ? (
              <img
                src={merchant.profile.logo_url}
                alt={merchant?.name}
                className="w-full h-full object-cover p-2"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-sage-200">
                <Utensils className="w-6 h-6 mb-1" />
                <span className="text-[7px] font-black uppercase tracking-tighter">
                  SAKTI
                </span>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-[10px] font-black text-sage-400 uppercase tracking-[0.3em] mb-1">
              Selamat Datang di
            </p>
            <h1 className="text-xl font-black text-sage-900 uppercase tracking-tighter leading-none mb-2">
              {merchant?.name || "SAKTI POS"}
            </h1>
            <div className="inline-flex items-center gap-1.5 bg-sage-800 text-white px-3 py-1 rounded-full shadow-lg shadow-sage-800/20">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Meja {tableId || params.tableId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="flex-1 bg-[#F9FAFB] px-6 py-10 rounded-t-[40px] -mt-10 relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-sm mx-auto space-y-8 pt-4">
          <div className="space-y-4">
            <SignUpButton mode="modal">
              <button className="group w-full h-16 bg-sage-900 text-white rounded-[24px] font-black text-sm flex items-center justify-between px-6 active:scale-95 transition-all shadow-2xl shadow-sage-900/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="leading-none mb-1">DAFTAR / LOGIN</p>
                    <p className="text-[9px] text-sage-300 font-bold uppercase tracking-widest">
                      Dapatkan Poin & Promo
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            </SignUpButton>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line/50"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-sage-300">
                <span className="bg-[#F9FAFB] px-4">ATAU</span>
              </div>
            </div>

            <button
              onClick={onGuestLogin}
              className="w-full h-16 bg-white border-2 border-line/50 text-sage-700 rounded-[24px] font-black text-sm flex items-center justify-between px-6 active:scale-95 transition-all hover:border-sage-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center">
                  <LogIn className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="leading-none mb-1 text-sage-900">
                    MASUK SEBAGAI TAMU
                  </p>
                  <p className="text-[9px] text-sage-400 font-bold uppercase tracking-widest">
                    Hanya untuk Dine-In
                  </p>
                </div>
              </div>
            </button>
          </div>

          {error && (
            <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl text-center">
              {error}
            </p>
          )}

          <p className="text-[9px] text-sage-300 font-bold text-center leading-relaxed px-6">
            Dengan melanjutkan, Anda menyetujui Ketentuan Layanan & Kebijakan
            Privasi SAKTI POS.
          </p>
        </div>
      </div>
    </div>
  );
}

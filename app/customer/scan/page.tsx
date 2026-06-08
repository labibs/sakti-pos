"use client";

import { ScanLine, ChevronLeft, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCustomerStore } from "@/lib/customer-store";

export default function CustomerScanPage() {
  const router = useRouter();
  const { merchantId } = useCustomerStore();

  function simulateScan() {
    // Simulasi scan meja 05 di merchant aktif
    const tableId = "05";
    const mQuery = merchantId ? `?m=${merchantId}` : "";
    router.push(`/landing/menu/${tableId}${mQuery}`);
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <Link
          href="/customer"
          className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center text-sage-600"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-black text-sage-900 uppercase tracking-tight">
          Scan Meja
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-72 h-72 bg-white rounded-[40px] shadow-2xl shadow-sage-200 border-8 border-white overflow-hidden flex items-center justify-center mb-10">
          <div className="absolute inset-4 border-2 border-dashed border-sage-200 rounded-[32px]"></div>

          <ScanLine className="w-32 h-32 text-sage-100 animate-pulse" />

          {/* Scanning Line Animation */}
          <div className="absolute inset-x-8 top-0 h-1 bg-sage-500 shadow-[0_0_15px_rgba(107,114,128,0.5)] animate-scan"></div>
        </div>

        <div className="space-y-2 mb-10">
          <h2 className="text-2xl font-black text-sage-900 uppercase tracking-tight">
            Arahkan Kamera
          </h2>
          <p className="text-xs font-bold text-sage-400 uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">
            Scan QR Code yang ada di meja Anda untuk mulai memesan Dine-In
          </p>
        </div>

        <div className="grid w-full gap-3">
          <button
            onClick={simulateScan}
            className="w-full h-16 bg-sage-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sage-800/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Camera className="w-5 h-5" />
            Simulasi Scan Meja
          </button>

          <Link href="/customer" className="w-full">
            <button className="w-full h-14 bg-white text-sage-400 rounded-2xl font-black uppercase tracking-widest text-[10px]">
              Batal
            </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan-anim {
          0% {
            top: 10%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 90%;
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan-anim 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

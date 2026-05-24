"use client";

import { AppShell } from "@/components/app-shell";
import { Scan } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();

  function simulateScan() {
    const tableId = "04";
    router.push("/menu/" + tableId);
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-64 h-64 bg-sage-100 rounded-sage flex items-center justify-center mb-8 relative overflow-hidden">
          <Scan className="w-32 h-32 text-sage-300 animate-pulse" />
          <div className="absolute inset-x-0 top-0 h-1 bg-sage-500/50 animate-scan"></div>
        </div>
        <h2 className="text-xl font-bold text-sage-800 mb-2">Scan Table QR</h2>
        <p className="text-sm text-sage-500 mb-8 max-w-[200px]">Point your camera to the QR code on your table</p>
        
        <button 
          onClick={simulateScan}
          className="bg-sage-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-sage-700/30 active:scale-95 transition-transform"
        >
          Simulate Scan (Table 04)
        </button>
      </div>

      <style jsx>{`
        @keyframes scan-anim {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        .animate-scan {
          animation: scan-anim 2s ease-in-out infinite;
        }
      `}</style>
    </AppShell>
  );
}

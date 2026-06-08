"use client";

import { AppShell } from "@/components/app-shell";
import { useEffect, useState } from "react";
import { Printer, QrCode, X, Loader2 } from "lucide-react";

export default function TableManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [tablesCount, setTablesCount] = useState(12);
  const [baseUrl, setBaseUrl] = useState("");

  const [merchantId, setMerchantId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setBaseUrl(window.location.origin);
    const cached = localStorage.getItem("setting:merchant");
    if (cached) {
      const m = JSON.parse(cached);
      setMerchantId(m.id?.toString() || null);
    }
  }, []);

  if (!mounted) return null;

  const tables = Array.from({ length: tablesCount }, (_, i) =>
    (i + 1).toString(),
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell noPadding>
      <div className="min-h-screen bg-[#F9FAFB] pb-40">
        <div className="bg-white px-4 pt-14 pb-4 shadow-sm sticky top-0 z-20 print:hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="mt-3 text-xs font-black text-sage-900 uppercase tracking-widest">
                Pengaturan Meja
              </h1>
              <p className="text-[10px] font-bold text-sage-400 uppercase">
                QR Code & Cetak Barcode Meja
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="mt-3 flex items-center gap-2 bg-sage-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-sage-800/20"
            >
              <Printer className="w-4 h-4" />
              Cetak Semua
            </button>
          </div>
        </div>

        <div className="px-4 pt-6">
          {!merchantId && (
            <div className="bg-amber-50 p-4 rounded-2xl mb-6 text-[10px] font-bold text-amber-600 uppercase tracking-widest">
              Gagal memuat ID Merchant. Silakan refresh halaman atau buka
              kembali menu Setting.
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-2 print:gap-10">
            {tables.map((table) => {
              const orderUrl = `${baseUrl}/landing/menu/${table}${merchantId ? `?m=${merchantId}` : ""}`;
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(orderUrl)}`;

              return (
                <div
                  key={table}
                  className="bg-white rounded-[32px] border border-line/50 p-6 flex flex-col items-center text-center shadow-sm break-inside-avoid"
                >
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-sage-400 uppercase tracking-widest mb-1">
                      Meja Nomor
                    </p>
                    <h3 className="text-3xl font-black text-sage-900">
                      {table}
                    </h3>
                  </div>

                  <div className="relative w-full aspect-square bg-sage-50 rounded-2xl flex items-center justify-center overflow-hidden border border-line/30 mb-4 p-4">
                    <img
                      src={qrUrl}
                      alt={`QR Code Meja ${table}`}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <p className="text-[9px] font-bold text-sage-400 uppercase tracking-tight mb-4 break-all">
                    {orderUrl.replace(/^https?:\/\//, "")}
                  </p>

                  <button
                    onClick={() => window.open(orderUrl, "_blank")}
                    className="print:hidden w-full h-10 bg-sage-50 text-sage-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sage-100 transition-colors"
                  >
                    Buka Menu
                  </button>

                  <div className="hidden print:block mt-2 text-[10px] font-black text-sage-900 uppercase tracking-[0.2em]">
                    SCAN UNTUK PESAN
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .screen-only {
            display: none !important;
          }
          nav {
            display: none !important;
          }
        }
      `}</style>
    </AppShell>
  );
}

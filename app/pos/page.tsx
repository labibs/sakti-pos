
import { AppShell } from "@/components/app-shell";
import { PosRegister } from "@/components/pos-register";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PosPage() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Kasir POS</h1>
          <p className="text-sm text-sage-500">Halaman transaksi penjualan</p>
        </div>
        <Link 
          href="/dashboard/setup" 
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-sage-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Setup
        </Link>
      </div>
      <PosRegister />
    </AppShell>
  );
}

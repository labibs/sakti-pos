import { AppShell } from "@/components/app-shell";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const metrics = [
  { label: "Penjualan Hari Ini", value: "Rp 3.840.000" },
  { label: "Transaksi", value: "126" },
  { label: "Produk Hampir Habis", value: "8" }
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sage-800">Dashboard</h1>
        <p className="text-sm text-sage-500">Ringkasan operasional toko</p>
      </div>
      <Link
        href="/dashboard/setup"
        className="mb-5 flex items-center justify-between rounded-lg border border-line bg-white p-4 shadow-sm sage-shadow"
      >
        <div>
          <p className="font-bold text-sage-900">Setup awal toko</p>
          <p className="text-sm text-sage-500">Pilih modul, tambah kategori, lalu input barang.</p>
        </div>
        <ArrowRight className="h-5 w-5 text-sage-700" />
      </Link>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-sage border border-line bg-white p-5 shadow-sm sage-shadow">
            <p className="text-xs font-medium text-sage-500 uppercase tracking-wider">{metric.label}</p>
            <p className="mt-2 text-2xl font-bold text-sage-900">{metric.value}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

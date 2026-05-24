
import { AppShell } from "@/components/app-shell";
import Link from "next/link";
import { ArrowLeft, BarChart3, Boxes, CheckCircle2, LayoutGrid, Receipt, Users } from "lucide-react";

const modules = [
  { name: "Kasir POS", enabled: true, icon: Receipt },
  { name: "Produk & Kategori", enabled: true, icon: LayoutGrid },
  { name: "Stok", enabled: false, icon: Boxes },
  { name: "Laporan", enabled: false, icon: BarChart3 },
  { name: "Karyawan", enabled: false, icon: Users },
];

export default function ModulesPage() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Modul</h1>
          <p className="text-sm text-sage-500">Modul awal yang dipilih saat onboarding merchant.</p>
        </div>
        <Link 
          href="/dashboard/setup" 
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-sage-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Setup
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <div key={module.name} className="rounded-lg border border-line bg-white p-5 shadow-sm sage-shadow">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100 text-sage-800">
                  <module.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sage-900">{module.name}</h2>
                  <p className="text-sm text-sage-500">{module.enabled ? "Aktif" : "Belum aktif"}</p>
                </div>
              </div>
              {module.enabled && <CheckCircle2 className="h-5 w-5 text-sage-700" />}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

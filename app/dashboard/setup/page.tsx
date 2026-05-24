import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Boxes, CheckCircle2, LayoutGrid, PackagePlus, Tags } from "lucide-react";

const setupItems = [
  { title: "Pilih Modul", description: "Aktifkan POS, stok, laporan, dan karyawan.", href: "/dashboard/modules", icon: LayoutGrid },
  { title: "Tambah Kategori", description: "Buat kategori barang agar katalog rapi.", href: "/dashboard/categories", icon: Tags },
  { title: "Tambah Barang", description: "Input nama barang, harga, SKU, dan stok.", href: "/products", icon: PackagePlus },
  { title: "Mulai Kasir", description: "Buka POS setelah data dasar siap.", href: "/pos", icon: Boxes },
];

export default function SetupPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-sage-500">Merchant Active</p>
        <h1 className="text-2xl font-bold text-sage-800">Setup awal toko</h1>
        <p className="text-sm text-sage-500">Lengkapi data operasional sebelum mulai transaksi.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {setupItems.map((item, index) => (
          <Link key={item.title} href={item.href} className="rounded-lg border border-line bg-white p-5 shadow-sm sage-shadow">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-sage-800">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-sage-400">0{index + 1}</span>
                  <h2 className="font-bold text-sage-900">{item.title}</h2>
                </div>
                <p className="mt-1 text-sm text-sage-500">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-5 rounded-lg border border-line bg-white p-4 text-sm text-sage-600">
        <CheckCircle2 className="mr-2 inline h-4 w-4 text-sage-700" />
        Halaman ini menjadi tujuan pertama setelah merchant diverifikasi.
      </div>
    </AppShell>
  );
}

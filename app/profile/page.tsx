"use client";

import { useState, useRef } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Camera,
  Store,
  Save,
  ChevronRight,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export default function ProfilePage() {
  const { signOut } = useClerk();
  const [storeName, setStoreName] = useState("Sakti");
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-8 pb-10">
        <header>
          <h1 className="text-2xl font-bold text-sage-900">Pengaturan Toko</h1>
          <p className="text-sage-500 text-sm">
            Kelola informasi publik toko Anda
          </p>
        </header>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-line flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-sage-100 flex items-center justify-center border-2 border-sage-200 overflow-hidden">
              {logo ? (
                <img
                  src={logo}
                  alt="Logo Toko"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-10 h-10 text-sage-400" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-sage-700 text-white p-2 rounded-full shadow-lg hover:bg-sage-800 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold text-sage-900">{storeName}</h2>
            <p className="text-xs text-sage-500 uppercase tracking-wider font-medium">
              Store Owner
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-line divide-y divide-line overflow-hidden">
            <div className="p-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-sage-700">
                  Nama Toko
                </span>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-sage-50 border border-line rounded-xl text-sage-900 focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none transition-all"
                  placeholder="Masukkan nama toko"
                />
              </label>

              <button className="w-full bg-sage-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-sage-800 active:scale-95 transition-all shadow-lg shadow-sage-700/20">
                <Save className="w-5 h-5" />
                Simpan Perubahan
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-line divide-y divide-line overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-sage-50 transition-colors">
              <div className="flex items-center gap-3 text-sage-700">
                <HelpCircle className="w-5 h-5 text-sage-400" />
                <span className="font-medium text-sm">Bantuan & Dukungan</span>
              </div>
              <ChevronRight className="w-4 h-4 text-sage-300" />
            </button>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group"
            >
              <div className="flex items-center gap-3 text-red-600">
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
                <span className="font-medium text-sm">Keluar Akun</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-300 group-hover:text-red-500" />
            </button>
          </div>
        </div>

        <footer className="mt-10 mb-6 text-center">
          <p className="text-xs text-sage-400">
            v1.0.4 • Powered by{" "}
            <span className="font-semibold text-sage-600 underline decoration-sage-300 decoration-2 underline-offset-4">
              sakte.id
            </span>
          </p>
        </footer>
      </div>
    </AppShell>
  );
}

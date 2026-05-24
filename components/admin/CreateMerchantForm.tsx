
"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { X, Loader2 } from "lucide-react";

const AVAILABLE_MODULES = [
  { id: "pos", name: "Core POS", description: "Transaksi Dasar" },
  { id: "inventory", name: "Inventory", description: "Stok & Gudang" },
  { id: "restaurant", name: "Restoran", description: "Meja & Dapur" },
  { id: "retail", name: "Retail", description: "Barcode & Kasir Cepat" },
  { id: "workshop", name: "Bengkel", description: "Servis & Mekanik" },
];

export function CreateMerchantForm({ onSuccess, onCancel }: { onSuccess?: () => void, onCancel?: () => void }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    owner_email: "",
    clerk_user_id: "",
    business_type: "warung_retail",
    modules: ["pos"] as string[],
  });

  const toggleModule = (id: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.includes(id) 
        ? prev.modules.filter(m => m !== id)
        : [...prev.modules, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      await apiFetch("/merchants", {
        method: "POST",
        token,
        body: JSON.stringify(formData)
      });
      setSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      alert("Gagal: " + message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="p-10 text-center space-y-3">
      <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
        <X className="rotate-45" />
      </div>
      <h3 className="text-xl font-bold text-sage-900">Berhasil Dibuat!</h3>
      <p className="text-sm text-sage-500">Merchant baru telah berhasil didaftarkan ke sistem.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-sage-900">Tambah Merchant Manual</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="p-1 hover:bg-sage-100 rounded-full">
            <X className="h-5 w-5 text-sage-400" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-bold uppercase text-sage-500">Nama Toko</span>
          <input 
            placeholder="Contoh: Toko Maju Jaya" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            className="mt-1 w-full p-3 border border-line rounded-xl outline-none focus:border-sage-700" 
            required 
          />
        </label>
        
        <label className="block">
          <span className="text-xs font-bold uppercase text-sage-500">Email Pemilik</span>
          <input 
            placeholder="email@contoh.com" 
            type="email" 
            value={formData.owner_email} 
            onChange={e => setFormData({...formData, owner_email: e.target.value})} 
            className="mt-1 w-full p-3 border border-line rounded-xl outline-none focus:border-sage-700" 
            required 
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase text-sage-500">Clerk User ID</span>
          <input 
            placeholder="user_xxxxxxx" 
            value={formData.clerk_user_id} 
            onChange={e => setFormData({...formData, clerk_user_id: e.target.value})} 
            className="mt-1 w-full p-3 border border-line rounded-xl outline-none focus:border-sage-700" 
            required 
          />
        </label>

        <div>
          <span className="text-xs font-bold uppercase text-sage-500">Pilih Modul</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {AVAILABLE_MODULES.map(m => (
              <div 
                key={m.id} 
                onClick={() => toggleModule(m.id)} 
                className={"p-3 border rounded-xl cursor-pointer text-sm font-medium transition-colors " + 
                  (formData.modules.includes(m.id) ? "bg-sage-800 text-white border-sage-800" : "bg-white text-sage-600 border-line hover:bg-sage-50")}
              >
                {m.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="flex-1 border border-line p-3 rounded-xl font-bold text-sage-600 hover:bg-sage-50"
          >
            Batal
          </button>
        )}
        <button 
          disabled={loading} 
          className="flex-[2] bg-sage-800 text-white p-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Menyimpan..." : "Simpan Merchant"}
        </button>
      </div>
    </form>
  );
}

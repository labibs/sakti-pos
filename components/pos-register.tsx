"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Search, Loader2, Store } from "lucide-react";
import { apiFetch, type CatalogItem } from "@/lib/api";
import { ProductCard } from "./product-card";

type CatalogItemsResponse = {
  data?: CatalogItem[];
};

function PosContent() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<(CatalogItem & { qty: number })[]>([]);
  const [query, setQuery] = useState("");
  const [noMerchant, setNoMerchant] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const token = await getToken();
        const res = await apiFetch<CatalogItemsResponse>("/catalog/items", { token });
        setItems(Array.isArray(res.data) ? res.data : []);
        setNoMerchant(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("403") || message.includes("Merchant")) setNoMerchant(true);
      } finally { setLoading(false); }
    }
    load();
  }, [getToken]);

  if (noMerchant) return (
    <div className="flex flex-col items-center py-20 text-center">
      <Store className="w-12 h-12 text-sage-300 mb-4" />
      <h2 className="text-xl font-bold">Toko Belum Siap</h2>
      <button onClick={() => window.location.href='/admin/merchants'} className="mt-4 bg-sage-800 text-white px-8 py-3 rounded-full font-bold">Setup Toko</button>
    </div>
  );

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const filtered = items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400 w-4 h-4" />
        <input placeholder="Cari produk..." value={query} onChange={e => setQuery(e.target.value)} className="w-full h-12 bg-white rounded-2xl pl-12 pr-4 shadow-sm outline-none" />
      </div>
      {filtered.length === 0 ? <div className="py-20 text-center text-sage-400 italic text-sm">Katalog Kosong</div> : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {filtered.map(item => (
            <ProductCard
              key={item.id}
              product={item}
              qty={cart.find(c => c.id === item.id)?.qty || 0}
              onAdd={p => setCart([...cart, {...(p as CatalogItem), qty: 1}])}
              onRemove={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PosRegister() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  return <PosContent />;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Loader2,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { apiFetch, type CatalogItem } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { useCustomerStore } from "@/lib/customer-store";
import Link from "next/link";

export default function GuestHomePage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [merchantInfo, setMerchantInfo] = useState<any>(null);

  const {
    cart,
    addToCart,
    updateQty,
    merchantId,
    setMerchantId,
    tableNumber,
    ensureGuestId,
  } = useCustomerStore();

  const currentMerchantId = searchParams.get("m") || merchantId;

  const itemCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + item.base_price * item.qty,
    0,
  );

  const money = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    ensureGuestId();
    const mId = searchParams.get("m");
    if (mId) {
      setMerchantId(Number(mId));
    }
  }, [searchParams, setMerchantId, ensureGuestId]);

  useEffect(() => {
    async function load() {
      if (!currentMerchantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const merchantQuery = `?m=${currentMerchantId}`;

        const [resItems, resCats, resMerchant] = await Promise.allSettled([
          apiFetch<any>(`/public/catalog/items${merchantQuery}`, {
            useCache: true,
          }),
          apiFetch<any>(`/public/catalog/categories${merchantQuery}`, {
            useCache: true,
          }),
          apiFetch<any>(`/public/merchants/${currentMerchantId}`, {
            useCache: true,
          }),
        ]);

        if (resItems.status === "fulfilled") {
          const data = resItems.value;
          const itemsArr = Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
          setItems(itemsArr);
        }

        if (resCats.status === "fulfilled") {
          const data = resCats.value;
          const catsArr = Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
          setCategories(catsArr);
        }

        if (resMerchant.status === "fulfilled") {
          const data = resMerchant.value;
          setMerchantInfo(data?.merchant || data);
        }
      } catch (error) {
        console.error("Failed to load guest data:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentMerchantId]);

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) &&
          (selectedCategory
            ? (i as any).category_id === selectedCategory
            : true),
      ),
    [items, query, selectedCategory],
  );

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-sage-600" />
      </div>
    );
  }

  if (!currentMerchantId) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-6 border border-amber-100">
          <Store className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-xl font-black text-sage-900 mb-2 uppercase tracking-tight">
          Toko Tidak Ditemukan
        </h2>
        <p className="text-sage-400 font-bold mb-8 uppercase tracking-widest text-[10px]">
          Silakan scan QR code di meja untuk memesan
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] pb-48">
      {/* Merchant Header */}
      {merchantInfo && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-line/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center border border-line/50 overflow-hidden">
              {merchantInfo.profile?.logo_url ? (
                <img
                  src={merchantInfo.profile.logo_url}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Store className="w-5 h-5 text-sage-400" />
              )}
            </div>
            <div>
              <h1 className="text-sm font-black text-sage-900 leading-none">
                {merchantInfo.name}
              </h1>
              <p className="text-[9px] font-bold text-sage-400 uppercase tracking-widest mt-1">
                Mode Tamu {tableNumber && `• Meja ${tableNumber}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-sage-50 px-3 py-1.5 rounded-xl border border-line text-[9px] font-black text-sage-500 uppercase tracking-widest">
            <UtensilsCrossed className="w-3 h-3" /> Dine In
          </div>
        </div>
      )}

      {/* Search and Categories Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm px-4 py-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400 group-focus-within:text-sage-600 transition-colors" />
          <input
            placeholder="Cari menu favorit..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 bg-sage-50 border-none rounded-2xl pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-sage-200 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-5 h-9 rounded-xl text-[11px] font-black transition-all uppercase tracking-wider ${
              selectedCategory === null
                ? "bg-sage-800 text-white shadow-lg shadow-sage-800/20"
                : "bg-sage-50 text-sage-400 hover:bg-sage-100"
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-5 h-9 rounded-xl text-[11px] font-black transition-all uppercase tracking-wider ${
                selectedCategory === cat.id
                  ? "bg-sage-800 text-white shadow-lg shadow-sage-800/20"
                  : "bg-sage-50 text-sage-400 hover:bg-sage-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              qty={cart.find((c) => c.id === item.id)?.qty || 0}
              onAdd={() => addToCart(item)}
              onRemove={() =>
                updateQty(
                  item.id,
                  (cart.find((c) => c.id === item.id)?.qty || 0) - 1,
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-40 sm:left-1/2 sm:right-auto sm:w-[480px] sm:-translate-x-1/2">
          <Link href={`/guest/cart?m=${currentMerchantId}`}>
            <button className="w-full h-16 bg-sage-900 text-white rounded-[24px] shadow-2xl flex items-center justify-between px-6 active:scale-95 transition-all border border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-sage-900 rounded-full flex items-center justify-center text-[10px] font-black">
                    {itemCount}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-sage-200 uppercase tracking-widest leading-none mb-1">
                    Lihat Keranjang
                  </p>
                  <p className="text-sm font-black leading-none">
                    {itemCount} Item terpilih
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black leading-none">
                  {money.format(subtotal)}
                </p>
              </div>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

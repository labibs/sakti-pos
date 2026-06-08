"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Loader2,
  ShoppingCart,
  Search,
  Plus,
  Minus,
  X,
  CheckCircle2,
  LogIn,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { apiFetch, type CatalogItem } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { CustomerAuthModal } from "@/components/customer/CustomerAuthModal";
import { useCustomerStore, type ServiceType } from "@/lib/customer-store";

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const serviceOptions: {
  value: ServiceType;
  label: string;
  icon: any;
  desc: string;
}[] = [
  {
    value: "dine_in",
    label: "Dine In",
    icon: UtensilsCrossed,
    desc: "Makan di tempat",
  },
  {
    value: "pickup",
    label: "Takeaway",
    icon: ShoppingBag,
    desc: "Bawa pulang",
  },
  {
    value: "delivery",
    label: "Delivery",
    icon: Truck,
    desc: "Antar ke lokasi",
  },
];

export default function CustomerMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const tableId = params.tableId as string;
  const merchantId = searchParams.get("m");

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [storeName, setStoreName] = useState("Sakti POS");
  const [logoUrl, setLogoUrl] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [authDone, setAuthDone] = useState(false);

  const store = useCustomerStore();

  const cart = store.cart;
  const addToCart = store.addToCart;
  const removeFromCart = store.removeFromCart;
  const clearCart = store.clearCart;
  const serviceType = store.serviceType;
  const setServiceType = store.setServiceType;

  useEffect(() => {
    if (tableId) store.setTableNumber(tableId);
    if (merchantId) store.setMerchantId(parseInt(merchantId));
  }, [tableId, merchantId]);

  useEffect(() => {
    if (!isLoaded) return;
    const hasVisited = sessionStorage.getItem(
      `customer:auth:${merchantId}:${tableId}`,
    );
    if (!hasVisited && !authDone) {
      setShowAuth(true);
    }
  }, [isLoaded, merchantId, tableId, authDone]);

  const handleRegisterSuccess = (customerId: number, name: string) => {
    store.setCustomerId(customerId);
    store.setCustomerName(name);
    if (merchantId) store.markRegistered(parseInt(merchantId));
    sessionStorage.setItem(`customer:auth:${merchantId}:${tableId}`, "1");
    setShowAuth(false);
    setAuthDone(true);
  };

  const handleGuestLogin = () => {
    router.push(`/guest/menu/${tableId}?m=${merchantId || ""}`);
  };

  useEffect(() => {
    async function load() {
      if (!isLoaded) return;
      try {
        setLoading(true);
        const token = isSignedIn ? await getToken() : null;
        const merchantQuery = merchantId ? `?m=${merchantId}` : "";
        const [resItems, resCats, resMe] = await Promise.all([
          apiFetch<any>(`/public/catalog/items${merchantQuery}`, {
            token,
            useCache: true,
            ttl: 1000 * 60 * 30, // Cache for 30 mins
          }),
          apiFetch<any>(`/public/catalog/categories${merchantQuery}`, {
            token,
            useCache: true,
            ttl: 1000 * 60 * 60, // Cache categories for 1 hour
          }),
          merchantId
            ? apiFetch<any>(`/public/merchants/${merchantId}`, {
                token,
                useCache: true,
                ttl: 1000 * 60 * 60 * 24, // Cache merchant info for 1 day
              })
            : Promise.resolve(null),
        ]);

        const merchantData = resMe?.merchant || resMe;
        if (merchantData) {
          setStoreName(merchantData.name);
          setLogoUrl(merchantData.profile?.logo_url || "");
        }

        const newItems = Array.isArray(resItems.data)
          ? resItems.data
          : Array.isArray(resItems)
            ? resItems
            : [];
        const newCats = Array.isArray(resCats.data)
          ? resCats.data
          : Array.isArray(resCats)
            ? resCats
            : [];

        setItems(newItems);
        setCategories(newCats);
      } catch (error) {
        console.error("Failed to load menu:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isLoaded, isSignedIn, getToken, merchantId]);

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.base_price) * Number(item.qty),
    0,
  );
  const itemCount = cart.reduce((acc, item) => acc + Number(item.qty), 0);

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

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const token = isSignedIn ? await getToken() : null;
      const res = await apiFetch<any>("/public/orders", {
        method: "POST",
        token,
        body: JSON.stringify({
          source: "customer_qr",
          service_type: serviceType,
          table_id: tableId,
          merchant_id: merchantId,
          customer_id: store.customerId,
          items: cart.map((i) => ({
            catalog_item_id: i.id,
            qty: i.qty,
            unit_price: i.base_price,
          })),
        }),
      });
      setOrderSuccess(res);
      clearCart();
      setShowCart(false);
    } catch (e) {
      console.error("Failed to place order:", e);
      alert("Gagal mengirim pesanan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (showAuth) {
    return (
      <CustomerAuthModal
        merchantId={merchantId}
        tableId={tableId}
        onRegisterSuccess={handleRegisterSuccess}
        onGuestLogin={handleGuestLogin}
      />
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-sage-600" />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-sage-900 mb-2 uppercase tracking-tight">
          Pesanan Terkirim!
        </h2>
        <p className="text-sage-500 font-bold mb-2">
          Nomor Pesanan:{" "}
          <span className="text-sage-900">
            #{orderSuccess.order_number || orderSuccess.id}
          </span>
        </p>
        <p className="text-sage-400 text-sm mb-8">
          Layanan:{" "}
          {serviceType === "dine_in"
            ? "Dine In"
            : serviceType === "pickup"
              ? "Takeaway"
              : "Delivery"}
          {serviceType === "dine_in" && ` - Meja ${tableId}`}
        </p>
        <button
          onClick={() => setOrderSuccess(null)}
          className="w-full max-w-sm h-14 bg-sage-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sage-800/20"
        >
          Pesan Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <header className="px-4 py-3 flex items-center justify-between border-b border-line/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sage-50 rounded-xl flex items-center justify-center text-base border border-line/50 overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                "🌿"
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-black text-sage-900 truncate max-w-[140px]">
                {storeName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-[8px] font-black text-sage-400 uppercase tracking-widest leading-none">
                  Aktif di Meja {tableId}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            {isLoaded &&
              (isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1.5 bg-sage-50 px-3 py-1.5 rounded-xl border border-line text-[9px] font-black text-sage-800 uppercase tracking-widest active:scale-95 transition-all">
                    <LogIn className="w-3 h-3" /> Login
                  </button>
                </SignInButton>
              ))}
          </div>
        </header>

        {/* Service Type Selector */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {serviceOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setServiceType(opt.value)}
              className={
                "flex items-center gap-2 whitespace-nowrap px-4 h-9 rounded-xl text-[10px] font-black transition-all border " +
                (serviceType === opt.value
                  ? "bg-sage-800 text-white border-sage-800 shadow-md"
                  : "bg-white text-sage-500 border-line hover:bg-sage-50")
              }
            >
              <opt.icon className="w-3.5 h-3.5" />
              {opt.label}
            </button>
          ))}
        </div>

        <div className="px-4 pb-3 flex flex-col gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400 group-focus-within:text-sage-600 transition-colors" />
            <input
              placeholder="Cari menu favorit..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 bg-sage-50 border-none rounded-xl pl-9 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-sage-200 transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={
                "whitespace-nowrap px-4 h-8 rounded-lg text-[10px] font-black transition-all " +
                (selectedCategory === null
                  ? "bg-sage-800 text-white shadow-md"
                  : "bg-sage-50 text-sage-400 hover:bg-sage-100 uppercase")
              }
            >
              SEMUA
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={
                  "whitespace-nowrap px-4 h-8 rounded-lg text-[10px] font-black transition-all " +
                  (selectedCategory === cat.id
                    ? "bg-sage-800 text-white shadow-md"
                    : "bg-sage-50 text-sage-400 hover:bg-sage-100 uppercase")
                }
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pt-6">
        {!merchantId && !isSignedIn && (
          <div className="bg-amber-50 p-4 rounded-2xl mb-6 text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">
            Menu tidak dapat dimuat tanpa ID Merchant. Pastikan scan QR yang
            valid.
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              qty={cart.find((c) => c.id === item.id)?.qty || 0}
              onAdd={() => addToCart(item)}
              onRemove={() => removeFromCart(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-28 left-4 right-4 z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full h-16 bg-sage-900 text-white rounded-2xl shadow-2xl flex items-center justify-between px-6 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-sage-200 uppercase tracking-widest leading-none mb-1">
                  Lihat Pesanan
                </p>
                <p className="text-sm font-black leading-none">
                  {itemCount} Menu Dipilih
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black leading-none">
                {money.format(subtotal)}
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setShowCart(false)}
          />
          <div className="relative bg-[#F9FAFB] w-full max-w-xl rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
            <div className="px-6 pt-4 pb-3 bg-white rounded-t-[32px] border-b border-line/50">
              <div className="w-12 h-1.5 bg-sage-100 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xl text-sage-900 uppercase tracking-tight">
                    Pesanan
                  </h3>
                  <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mt-0.5">
                    {serviceType === "dine_in"
                      ? `Dine In - Meja ${tableId}`
                      : serviceType === "pickup"
                        ? "Takeaway"
                        : "Delivery"}
                  </p>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-10 h-10 flex items-center justify-center bg-sage-50 rounded-xl"
                >
                  <X className="w-5 h-5 text-sage-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[24px] border border-line/50 p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center text-lg font-black text-sage-300">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm text-sage-900 truncate leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-sage-400 font-bold mt-0.5">
                      {money.format(item.base_price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-sage-50 p-1 rounded-lg border border-line/30">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 bg-white rounded flex items-center justify-center text-sage-400 shadow-sm"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black text-sage-900 w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-7 h-7 bg-sage-800 text-white rounded flex items-center justify-center shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border-t border-line/50 p-6 pb-28">
              <div className="flex justify-between items-center mb-6 px-1">
                <span className="text-xs font-black text-sage-400 uppercase tracking-[0.2em]">
                  Total Pesanan
                </span>
                <span className="text-2xl font-black text-sage-900">
                  {money.format(subtotal)}
                </span>
              </div>

              <button
                disabled={submitting}
                onClick={handlePlaceOrder}
                className="w-full bg-sage-800 text-white h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-sage-800/20"
              >
                {submitting ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "PESAN SEKARANG"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

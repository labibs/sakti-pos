"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useState } from "react";
import {
  Trash2,
  Minus,
  Plus,
  ChevronLeft,
  Bike,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Phone,
  Bell,
} from "lucide-react";
import { useCustomerStore } from "@/lib/customer-store";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function CartPage() {
  const {
    cart,
    updateQty,
    removeFromCart,
    serviceType,
    setServiceType,
    clearCart,
    merchantId,
    guestId,
    guestPhone,
    setGuestPhone,
  } = useCustomerStore();
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [phoneInput, setPhoneInput] = useState(guestPhone || "");

  const isGuest = !isSignedIn;

  const subtotal = cart.reduce(
    (acc, item) => acc + item.base_price * item.qty,
    0,
  );
  const money = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Guest wajib isi nomor HP
    if (isGuest && !phoneInput.trim()) {
      alert("Mohon isi nomor HP untuk notifikasi pesanan.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const body: Record<string, any> = {
        source: "customer_app",
        service_type: serviceType,
        merchant_id: merchantId,
        items: cart.map((i) => ({
          catalog_item_id: i.id,
          qty: i.qty,
          unit_price: i.base_price,
        })),
      };

      // Kirim guest data jika tamu
      if (isGuest) {
        body.guest_id = guestId;
        body.guest_phone = phoneInput.trim();
        setGuestPhone(phoneInput.trim());
      }

      const res = await apiFetch<any>("/public/orders", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      });
      setOrderSuccess(res);
      clearCart();
    } catch (e) {
      console.error("Checkout failed:", e);
      alert("Gagal melakukan pemesanan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const mQuery = merchantId ? `?m=${merchantId}` : "";

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-black text-sage-900 mb-2 tracking-tight uppercase">
          Berhasil!
        </h2>
        <p className="text-sage-500 font-bold mb-8">
          Pesanan Anda{" "}
          <span className="text-sage-900">
            #{orderSuccess.order_number || orderSuccess.id}
          </span>{" "}
          telah diterima.
          <br />
          {serviceType === "delivery"
            ? "Kami akan segera mengantarkannya."
            : "Silakan ambil pesanan Anda di outlet."}
        </p>
        {isGuest && (
          <p className="text-xs text-sage-400 font-bold mb-6">
            Kami akan menghubungi{" "}
            <span className="text-sage-700">{phoneInput}</span> ketika pesanan
            sudah siap.
          </p>
        )}
        <div className="flex flex-col w-full gap-3">
          {!isGuest && (
            <Link href={`/customer/orders${mQuery}`} className="w-full">
              <button className="w-full h-14 bg-sage-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sage-800/20">
                Lihat Riwayat Pesanan
              </button>
            </Link>
          )}
          <Link href={`/landing/menu/1${mQuery}`} className="w-full">
            <button className="w-full h-14 bg-white text-sage-800 border-2 border-sage-100 rounded-2xl font-black uppercase tracking-widest">
              Kembali ke Menu
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-sage-50 rounded-3xl flex items-center justify-center mb-6 border border-line">
          <ShoppingBag className="w-10 h-10 text-sage-300" />
        </div>
        <h2 className="text-xl font-black text-sage-900 mb-2 uppercase tracking-tight">
          Keranjang Kosong
        </h2>
        <p className="text-sage-400 font-bold mb-8 uppercase tracking-widest text-[10px]">
          Anda belum menambahkan menu apapun
        </p>
        <Link href={`/landing/menu/1${mQuery}`}>
          <button className="px-10 h-14 bg-sage-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sage-800/20">
            Mulai Pesan
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <Link
          href={`/landing/menu/1${mQuery}`}
          className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center text-sage-600"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-black text-sage-900 uppercase tracking-tight">
          Keranjang
        </h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Service Type Selection */}
        <div className="bg-white rounded-[32px] p-2 border border-line/50 flex gap-2">
          <button
            onClick={() => setServiceType("pickup")}
            className={`flex-1 h-14 rounded-[24px] flex items-center justify-center gap-3 font-black text-xs transition-all ${
              serviceType === "pickup"
                ? "bg-sage-800 text-white shadow-lg"
                : "text-sage-400"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            TAKEAWAY
          </button>
          <button
            onClick={() => setServiceType("delivery")}
            className={`flex-1 h-14 rounded-[24px] flex items-center justify-center gap-3 font-black text-xs transition-all ${
              serviceType === "delivery"
                ? "bg-sage-800 text-white shadow-lg"
                : "text-sage-400"
            }`}
          >
            <Bike className="w-5 h-5" />
            DELIVERY
          </button>
        </div>

        {/* Guest Phone Input */}
        {isGuest && (
          <div className="bg-white rounded-[32px] p-5 border border-line/50 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs font-black text-sage-900 uppercase tracking-wider">
                Nomor HP
              </p>
            </div>
            <input
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full h-12 bg-sage-50 border border-line/50 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-sage-200"
            />
            <div className="flex items-start gap-2">
              <Bell className="w-3.5 h-3.5 text-sage-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-sage-400 font-bold leading-relaxed">
                Nomor HP digunakan untuk memberitahu Anda ketika pesanan sudah
                siap.
              </p>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-sage-400 uppercase tracking-[0.2em] px-2">
            Daftar Pesanan
          </p>
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[28px] p-4 border border-line/50 flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-sage-50 rounded-2xl flex items-center justify-center text-xl font-black text-sage-200 border border-line/30">
                {item.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm text-sage-900 truncate leading-tight">
                  {item.name}
                </h4>
                <p className="text-xs text-sage-500 font-bold mt-1">
                  {money.format(item.base_price)}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-sage-50 p-1 rounded-xl border border-line/30">
                <button
                  onClick={() => updateQty(item.id, item.qty - 1)}
                  className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sage-400 shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-sage-900 w-6 text-center">
                  {item.qty}
                </span>
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  className="w-8 h-8 bg-sage-800 text-white rounded-lg flex items-center justify-center shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-[32px] p-6 border border-line/50 space-y-4">
          <p className="text-[10px] font-black text-sage-400 uppercase tracking-[0.2em]">
            Ringkasan Pembayaran
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-sage-500">
              <span>Subtotal</span>
              <span>{money.format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-sage-500">
              <span>
                Layanan ({serviceType === "pickup" ? "Takeaway" : "Delivery"})
              </span>
              <span>{money.format(0)}</span>
            </div>
            <div className="pt-4 border-t border-dashed border-line flex justify-between items-center">
              <span className="text-xs font-black text-sage-900 uppercase tracking-widest">
                Total Bayar
              </span>
              <span className="text-2xl font-black text-sage-900">
                {money.format(subtotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="p-4 bg-white border-t border-line/50 pb-10">
        <button
          disabled={submitting}
          onClick={handleCheckout}
          className="w-full h-16 bg-sage-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-sage-800/20"
        >
          {submitting ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            `PESAN SEKARANG • ${money.format(subtotal)}`
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Trash2,
  Minus,
  Plus,
  ChevronLeft,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Phone,
  Bell,
  UtensilsCrossed,
} from "lucide-react";
import { useCustomerStore } from "@/lib/customer-store";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function GuestCartPage() {
  const {
    cart,
    updateQty,
    removeFromCart,
    clearCart,
    merchantId,
    guestId,
    guestPhone,
    setGuestPhone,
    tableNumber,
  } = useCustomerStore();

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [phoneInput, setPhoneInput] = useState(guestPhone || "");

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

    // Guest wajib isi nomor HP untuk notifikasi
    if (!phoneInput.trim()) {
      alert("Mohon isi nomor HP untuk notifikasi pesanan.");
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, any> = {
        source: "customer_qr",
        service_type: "dine_in",
        merchant_id: merchantId,
        table_id: tableNumber,
        guest_id: guestId,
        notes: `Guest Phone: ${phoneInput.trim()}`,
        items: cart.map((i) => ({
          catalog_item_id: i.id,
          qty: i.qty,
          unit_price: i.base_price,
        })),
      };

      const res = await apiFetch<any>("/public/orders", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setOrderSuccess(res);
      setGuestPhone(phoneInput.trim());
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
          Terkirim!
        </h2>
        <p className="text-sage-500 font-bold mb-8">
          Pesanan Dine In Meja {tableNumber} <br />
          <span className="text-sage-900">
            #{orderSuccess.order_number || orderSuccess.id}
          </span>{" "}
          berhasil dikirim ke dapur.
        </p>
        <div className="flex flex-col w-full gap-3">
          <Link href={`/guest/orders${mQuery}`} className="w-full">
            <button className="w-full h-14 bg-sage-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sage-800/20">
              Cek Status Pesanan
            </button>
          </Link>
          <Link href={`/guest${mQuery}`} className="w-full">
            <button className="w-full h-14 bg-white text-sage-800 border-2 border-sage-100 rounded-2xl font-black uppercase tracking-widest">
              Pesan Lagi
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
          <UtensilsCrossed className="w-10 h-10 text-sage-300" />
        </div>
        <h2 className="text-xl font-black text-sage-900 mb-2 uppercase tracking-tight">
          Keranjang Tamu Kosong
        </h2>
        <p className="text-sage-400 font-bold mb-8 uppercase tracking-widest text-[10px]">
          Anda belum memilih menu
        </p>
        <Link href={`/guest${mQuery}`}>
          <button className="px-10 h-14 bg-sage-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sage-800/20">
            Lihat Menu
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
          href={`/guest${mQuery}`}
          className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center text-sage-600"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-black text-sage-900 uppercase tracking-tight">
          Pesanan Tamu
        </h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Dine In Banner */}
        <div className="bg-sage-800 rounded-[32px] p-4 text-white flex items-center gap-4 shadow-lg shadow-sage-800/20">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-sage-200 uppercase tracking-widest leading-none mb-1">
              Metode Pesan
            </p>
            <p className="text-sm font-black uppercase">Dine In - Meja {tableNumber}</p>
          </div>
        </div>

        {/* Guest Phone Input */}
        <div className="bg-white rounded-[32px] p-5 border border-line/50 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xs font-black text-sage-900 uppercase tracking-wider">
              Nomor HP (WhatsApp)
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
              Petugas akan memanggil Anda jika ada kendala dengan pesanan.
            </p>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-sage-400 uppercase tracking-[0.2em] px-2">
            Menu Dipilih
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
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-sage-900 uppercase tracking-widest">
              Total Bayar
            </span>
            <span className="text-2xl font-black text-sage-900">
              {money.format(subtotal)}
            </span>
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
            `PESAN SEKARANG`
          )}
        </button>
      </div>
    </div>
  );
}

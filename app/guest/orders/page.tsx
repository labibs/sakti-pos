"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useCustomerStore } from "@/lib/customer-store";

export default function GuestOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { merchantId, guestId, tableNumber } = useCustomerStore();
  const mQuery = merchantId ? `?m=${merchantId}` : "";

  const money = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Baca dari localStorage untuk Guest
        const localData = localStorage.getItem(
          `sakti:guest_orders:${merchantId}`,
        );
        if (localData) {
          const parsed = JSON.parse(localData);
          setOrders(Array.isArray(parsed) ? parsed : []);
        } else {
          setOrders([]);
        }
      } catch (e) {
        console.error("Failed to load local guest orders:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [merchantId]);

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return {
          label: "Selesai",
          icon: CheckCircle2,
          color: "text-green-500",
          bg: "bg-green-50",
        };
      case "cancelled":
        return {
          label: "Dibatalkan",
          icon: XCircle,
          color: "text-red-500",
          bg: "bg-red-50",
        };
      default:
        return {
          label: "Diproses",
          icon: Clock,
          color: "text-amber-500",
          bg: "bg-amber-50",
        };
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-sage-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <Link
          href={`/guest${mQuery}`}
          className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center text-sage-600"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-black text-sage-900 uppercase tracking-tight">
          Pesanan Saya
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-16 h-16 bg-sage-50 rounded-2xl flex items-center justify-center mb-4 border border-line">
              <UtensilsCrossed className="w-8 h-8 text-sage-200" />
            </div>
            <p className="text-sage-400 font-bold uppercase tracking-widest text-[10px]">
              Belum ada pesanan aktif
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const status = getStatusConfig(order.status || order.order_status);
            const total = order.total_amount || 0;

            return (
              <div
                key={order.id}
                className="bg-white rounded-[32px] p-5 border border-line/50 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-sage-400 uppercase tracking-widest leading-none mb-1">
                      #{order.order_number || order.id}
                    </p>
                    <p className="text-xs font-bold text-sage-600 uppercase">
                      Meja {order.table_id || tableNumber}
                    </p>
                  </div>
                  <div
                    className={`${status.bg} ${status.color} px-4 py-1.5 rounded-full flex items-center gap-1.5`}
                  >
                    <status.icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-3 border-y border-dashed border-line">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-sage-400 uppercase tracking-widest leading-none mb-1">
                      Waktu Pesan
                    </p>
                    <p className="text-xs font-black text-sage-900">
                      {new Date(order.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-sage-400 uppercase tracking-widest leading-none mb-1">
                      Total
                    </p>
                    <p className="text-sm font-black text-sage-900">
                      {money.format(total)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-xs font-bold text-sage-500"
                    >
                      <span>
                        {item.qty}x {item.name || "Menu"}
                      </span>
                      <span>{money.format(item.unit_price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

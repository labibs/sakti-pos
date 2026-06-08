"use client";

import { AppShell } from "@/components/app-shell";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Search,
  Filter,
  ChevronRight,
  Loader2,
  X,
  ReceiptText,
  ShoppingBag,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const statuses = [
  { id: "all", label: "Semua" },
  { id: "completed", label: "Selesai" },
  { id: "draft", label: "Draft" },
  { id: "cancelled", label: "Dibatalkan" },
];

export default function TransactionsPage() {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    async function loadOrders() {
      if (!isLoaded || !isSignedIn) return;

      try {
        setLoading(true);
        const token = await getToken();
        const res = await apiFetch<any>("/orders", { token });

        const list = Array.isArray(res)
          ? res
          : Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : [];

        setOrders(list);
        localStorage.setItem("transactions:orders", JSON.stringify(list));
      } catch (e) {
        console.error("Failed to load transactions", e);
        const cached = localStorage.getItem("transactions:orders");
        if (cached) setOrders(JSON.parse(cached));
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [isLoaded, isSignedIn, getToken]);

  const handleResumeOrder = (order: any) => {
    localStorage.setItem("pos:resuming_order", JSON.stringify(order));
    router.push("/pos");
  };

  const filteredOrders = orders.filter((o) => {
    const status = o.order_status || o.status;
    const matchesStatus = activeStatus === "all" || status === activeStatus;

    const invoice = o.order_number || o.invoice_no || "";
    const customer = o.customer_name || o.customer?.name || "";

    const matchesSearch =
      invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <AppShell noPadding>
      {/* Header with Search */}
      <div className="bg-white px-4 pt-14 pb-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h1 className="mt-3 text-xs font-black text-sage-900 uppercase tracking-widest">
              Riwayat Transaksi
            </h1>
            <p className="text-[10px] font-bold text-sage-400 uppercase">
              {orders.length} Transaksi
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
            <input
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-sage-50 rounded-xl pl-10 pr-4 text-xs font-bold outline-none border-none focus:ring-2 focus:ring-sage-100 transition-all"
            />
          </div>
          <button className="w-11 h-11 bg-sage-50 rounded-xl flex items-center justify-center text-sage-600 border border-line/50 active:scale-95 transition-transform">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStatus(s.id)}
              className={`whitespace-nowrap px-5 h-9 rounded-xl text-[10px] font-black transition-all ${
                activeStatus === s.id
                  ? "bg-sage-800 text-white shadow-md shadow-sage-800/20"
                  : "bg-sage-50 text-sage-400 hover:text-sage-600 uppercase"
              }`}
            >
              {s.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-32">
        {loading && orders.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-sage-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-sage-100">
            <p className="font-bold text-sage-400 text-sm">
              Tidak ada transaksi
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left bg-white p-4 rounded-[24px] border border-line/50 shadow-sm active:bg-sage-50/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-sage-900 mb-0.5 leading-tight uppercase tracking-tight">
                      {order.order_number ||
                        order.invoice_no ||
                        `ORD-${order.id}`}
                    </h3>
                    <p className="text-[10px] font-bold text-sage-400 uppercase tracking-tighter">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      •{" "}
                      {new Date(order.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {order.table_id && ` • MEJA ${order.table_id}`}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      (order.order_status || order.status) === "completed"
                        ? "bg-green-50 text-green-500"
                        : (order.order_status || order.status) === "draft" ||
                            (order.order_status || order.status) === "pending"
                          ? "bg-amber-50 text-amber-500"
                          : "bg-red-50 text-red-500"
                    }`}
                  >
                    {(
                      order.order_status ||
                      order.status ||
                      "PENDING"
                    ).toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-line/40">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[8px] font-black text-sage-300 uppercase tracking-widest mb-0.5">
                        Total
                      </p>
                      <p className="text-xs font-black text-sage-900">
                        {money.format(order.total || order.grand_total || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-sage-300 uppercase tracking-widest mb-0.5">
                        Metode
                      </p>
                      <p className="text-[11px] font-black text-sage-800 uppercase tracking-tighter">
                        {order.payment_method || "TUNAI"}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-sage-50 rounded-lg flex items-center justify-center text-sage-400 group-hover:bg-sage-800 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-6">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-[#F9FAFB] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-white px-6 pt-6 pb-4 border-b border-line/50">
              <div className="w-12 h-1.5 bg-sage-100 rounded-full mx-auto mb-6 sm:hidden" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-sage-400 uppercase tracking-[0.2em] mb-1">
                    Detail Transaksi
                  </p>
                  <h3 className="text-xl font-black text-sage-900 uppercase">
                    {selectedOrder.order_number || `ORD-${selectedOrder.id}`}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 bg-sage-50 rounded-xl text-sage-400 hover:text-sage-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {/* Order Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-line/50">
                  <p className="text-[8px] font-black text-sage-300 uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        (selectedOrder.order_status || selectedOrder.status) ===
                        "completed"
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <p className="text-xs font-black text-sage-900 uppercase">
                      {selectedOrder.order_status || selectedOrder.status}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-line/50">
                  <p className="text-[8px] font-black text-sage-300 uppercase tracking-widest mb-1">
                    Waktu
                  </p>
                  <p className="text-xs font-black text-sage-900">
                    {new Date(selectedOrder.created_at).toLocaleTimeString(
                      "id-ID",
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </p>
                </div>
                {selectedOrder.table_id && (
                  <div className="bg-white p-3 rounded-2xl border border-line/50 col-span-2 sm:col-span-1">
                    <p className="text-[8px] font-black text-sage-300 uppercase tracking-widest mb-1">
                      Meja
                    </p>
                    <p className="text-xs font-black text-sage-900">
                      NOMOR {selectedOrder.table_id}
                    </p>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-sage-400 uppercase tracking-widest">
                  Item Pesanan
                </p>
                <div className="bg-white rounded-[24px] border border-line/50 overflow-hidden">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 flex items-center gap-3 ${idx !== 0 ? "border-t border-line/30" : ""}`}
                    >
                      <div className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center text-xs font-black text-sage-400 border border-line/30">
                        {item.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-sage-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-bold text-sage-400 uppercase">
                          {Number(item.qty)} x{" "}
                          {money.format(Number(item.unit_price))}
                        </p>
                      </div>
                      <p className="text-sm font-black text-sage-900">
                        {money.format(
                          Number(item.qty) * Number(item.unit_price),
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-sage-900 text-white rounded-[24px] p-6 space-y-4">
                <div className="flex justify-between items-center text-sage-400">
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Subtotal
                  </span>
                  <span className="text-sm font-black">
                    {money.format(selectedOrder.total || 0)}
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    Total Akhir
                  </span>
                  <span className="text-2xl font-black">
                    {money.format(selectedOrder.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-line/50">
              {selectedOrder.order_status === "draft" ||
              selectedOrder.status === "draft" ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleResumeOrder(selectedOrder)}
                    className="h-14 rounded-2xl bg-sage-50 text-sage-800 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border border-line/50"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    TAMBAH ITEM
                  </button>
                  <button
                    onClick={() => handleResumeOrder(selectedOrder)}
                    className="h-14 rounded-2xl bg-sage-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-sage-800/20 active:scale-95 transition-all"
                  >
                    <CreditCard className="w-5 h-5" />
                    BAYAR SEKARANG
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full h-14 rounded-2xl bg-sage-50 text-sage-500 font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                >
                  TUTUP
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

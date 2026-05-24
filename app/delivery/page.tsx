"use client";

import { AppShell } from "@/components/app-shell";
import { useState } from "react";

const readyOrders = [
  { id: "#101", table: "Table 04", status: "Ready to Serve", time: "Just now" },
];

export default function DeliveryPage() {
  const [orders, setOrders] = useState(readyOrders);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sage-800">Delivery Management</h1>
        <p className="text-sm text-sage-500">Ready to serve orders</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-sage-400">No orders ready to serve</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-sage sage-shadow border-l-4 border-sage-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-sage-500">{order.id}</p>
                  <h3 className="text-lg font-bold text-sage-900">{order.table}</h3>
                </div>
                <span className="px-3 py-1 bg-sage-500 text-white rounded-full text-[10px] font-bold uppercase">
                  {order.status}
                </span>
              </div>
              <button className="w-full bg-sage-700 text-white py-3 rounded-full text-sm font-semibold active:scale-95 transition-transform">
                Order Delivered
              </button>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}

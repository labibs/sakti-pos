"use client";

import { AppShell } from "@/components/app-shell";
import { useState } from "react";

const dummyOrders = [
  { id: "#101", table: "Table 04", items: ["Kopi Susu x2", "Roti Cokelat x1"], status: "Cooking", time: "5m ago" },
  { id: "#102", table: "Table 02", items: ["Air Mineral x1"], status: "Pending", time: "2m ago" },
];

export default function KitchenPage() {
  const [orders, setOrders] = useState(dummyOrders);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sage-800">Kitchen Queue</h1>
        <p className="text-sm text-sage-500">Manage incoming orders for cooking</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-4 rounded-sage sage-shadow border-l-4 border-sage-500">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-sage-500">{order.id}</p>
                <h3 className="text-lg font-bold text-sage-900">{order.table}</h3>
              </div>
              <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-[10px] font-bold uppercase">
                {order.status}
              </span>
            </div>
            <ul className="text-sm text-sage-600 mb-4">
              {order.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <div className="flex justify-between items-center">
              <span className="text-xs text-sage-400">{order.time}</span>
              <button className="bg-sage-700 text-white px-4 py-2 rounded-full text-xs font-semibold">
                Mark as Ready
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

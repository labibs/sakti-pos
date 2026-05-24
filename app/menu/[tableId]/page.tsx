"use client";

import { useMemo, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { demoProducts, type Product } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { useParams } from "next/navigation";

type CartLine = Product & { qty: number };

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

export default function GuestMenuPage() {
  const params = useParams();
  const tableId = params.tableId;
  const [products] = useState<Product[]>(demoProducts);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState("");

  const filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  function addProduct(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...current, { ...product, qty: 1 }];
    });
  }

  function removeProduct(product: Product) {
    setCart((current) =>
      current
        .map((item) => (item.id === product.id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 pb-32">
      <header className="bg-white border-b border-line px-4 py-6 rounded-b-sage sage-shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-sage-800">Welcome</h1>
            <p className="text-sm text-sage-500">Table {tableId}</p>
          </div>
          <div className="bg-sage-100 text-sage-700 p-3 rounded-full relative">
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-sage-700 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {itemCount}
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menu..."
            className="w-full h-12 bg-sage-50 rounded-full pl-12 pr-4 text-sm outline-none"
          />
        </div>
      </header>

      <main className="px-4">
        <h2 className="text-lg font-bold text-sage-800 mb-4">Popular Dishes</h2>
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={(item) => addProduct(item as Product)}
              onRemove={(item) => removeProduct(item as Product)}
              qty={cart.find((item) => item.id === product.id)?.qty || 0}
            />
          ))}
        </div>
      </main>

      {itemCount > 0 && (
        <div className="fixed bottom-8 left-4 right-4 bg-sage-700 text-white p-4 rounded-full flex items-center justify-between shadow-xl active:scale-95 transition-transform">
          <span className="ml-4 font-bold">Order Now</span>
          <div className="bg-white/20 px-4 py-2 rounded-full font-bold">
            {money.format(subtotal)}
          </div>
        </div>
      )}
    </div>
  );
}

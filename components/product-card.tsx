"use client";

import { Plus, Minus } from "lucide-react";
import { type CatalogItem, type Product } from "@/lib/api";

interface ProductCardProps {
  product: CatalogItem | Product;
  onAdd: (product: CatalogItem | Product) => void;
  onRemove: (product: CatalogItem | Product) => void;
  qty: number;
}

export function ProductCard({ product, onAdd, onRemove, qty }: ProductCardProps) {
  const money = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  });
  const price = "base_price" in product && product.base_price ? product.base_price : "price" in product ? product.price : 0;

  return (
    <div className="bg-white rounded-sage sage-shadow overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-sage-100">
        <div className="absolute inset-0 flex items-center justify-center text-sage-300">
          <span className="text-xs font-medium">{product.item_type || "product"}</span>
        </div>
        {qty > 0 && (
          <div className="absolute top-2 right-2 bg-sage-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">
            {qty}
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-semibold text-sage-900 line-clamp-1 text-sm">{product.name}</h3>
        <p className="text-xs font-medium text-sage-600">
          {money.format(price)}
        </p>
        
        <div className="mt-2 flex items-center justify-end gap-2">
          {qty > 0 && (
            <>
              <button 
                onClick={() => onRemove(product)}
                className="w-8 h-8 rounded-full border border-sage-200 flex items-center justify-center text-sage-600 active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold w-4 text-center">{qty}</span>
            </>
          )}
          <button 
            onClick={() => onAdd(product)}
            className="w-8 h-8 rounded-full bg-sage-500 text-white flex items-center justify-center active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

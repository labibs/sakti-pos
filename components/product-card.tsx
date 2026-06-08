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
    <div className="bg-white rounded-3xl border border-line overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
      {/* Area Gambar - Ketinggian Dikurangi (aspect-[3/2]) */}
      <div className="relative aspect-[3/2] bg-sage-50 flex items-center justify-center overflow-hidden">
        <div className="text-[32px] grayscale opacity-10 font-black group-hover:scale-110 transition-transform duration-300">
          {product.name.charAt(0)}
        </div>
        
        {qty > 0 && (
          <div className="absolute top-2 right-2 bg-sage-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg animate-in zoom-in duration-200">
            {qty}
          </div>
        )}
      </div>
      
      {/* Area Konten - Lebih Rapat */}
      <div className="p-3 flex flex-col flex-1 gap-0.5">
        <h3 className="font-black text-sage-900 text-xs leading-tight line-clamp-1">{product.name}</h3>
        {"description" in product && product.description && (
          <p className="text-[9px] text-sage-400 line-clamp-1 leading-none mb-1 italic">
            {product.description}
          </p>
        )}
        
        {/* Footer Area - Stacked & Compact */}
        <div className="mt-auto pt-1.5 border-t border-line/40">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-black text-sage-800">
              {money.format(price)}
            </span>
            
            <div className="flex items-center">
              {qty > 0 ? (
                <div className="flex items-center bg-sage-50 rounded-xl border border-line p-1 gap-1 shadow-inner w-full justify-between">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(product); }}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sage-600 shadow-sm active:scale-75 transition-transform"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black text-sage-900">{qty}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                    className="w-7 h-7 rounded-lg bg-sage-800 text-white flex items-center justify-center shadow-sm active:scale-75 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                  className="w-full h-9 rounded-xl bg-sage-800 text-white flex items-center justify-center gap-2 shadow-lg shadow-sage-800/20 active:scale-95 transition-all hover:bg-sage-900"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Tambah</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

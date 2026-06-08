"use client";

import { AppShell } from "@/components/app-shell";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Plus,
  Trash2,
  Loader2,
  Package,
  X,
  Pencil,
  Search,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  sku: string;
  base_price: number;
  stock_qty: number;
  description?: string;
  category?: { name: string };
  category_id?: number;
};

type Category = {
  id: number;
  name: string;
};

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function ProductsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category_id: "",
    base_price: "",
    stock: "0",
    description: "",
  });

  const fetchData = async () => {
    if (!isSignedIn) return;

    // 1. Try loading from Cache first
    const cachedProducts = localStorage.getItem("pos:items");
    const cachedCategories = localStorage.getItem("pos:categories");

    if (cachedProducts) setProducts(JSON.parse(cachedProducts));
    if (cachedCategories) setCategories(JSON.parse(cachedCategories));

    if (cachedProducts && cachedCategories) {
      setLoading(false);
    }

    try {
      if (!cachedProducts) setLoading(true);

      const token = await getToken();

      const [resProducts, resCategories] = await Promise.all([
        apiFetch<any>("/catalog/items", { token }),
        apiFetch<any>("/catalog/categories", { token }),
      ]);

      const productsData = Array.isArray(resProducts)
        ? resProducts
        : Array.isArray(resProducts.data)
          ? resProducts.data
          : Array.isArray(resProducts.data?.data)
            ? resProducts.data.data
            : [];

      const categoriesData = Array.isArray(resCategories)
        ? resCategories
        : Array.isArray(resCategories.data)
          ? resCategories.data
          : Array.isArray(resCategories.data?.data)
            ? resCategories.data.data
            : [];

      setProducts(productsData);
      setCategories(categoriesData);

      // 2. Save to Cache
      localStorage.setItem("pos:items", JSON.stringify(productsData));
      localStorage.setItem("pos:categories", JSON.stringify(categoriesData));

      console.log("products:", productsData);
      console.log("categories:", categoriesData);
    } catch (e) {
      console.warn("Failed to fetch products/catalog/categories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn, getToken]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = await getToken();
      if (editingProduct) {
        await apiFetch("/catalog/items/" + editingProduct.id, {
          method: "PUT",
          token,
          body: JSON.stringify({
            ...form,
            item_type: "product",
            base_price: parseFloat(form.base_price),
            stock_qty: parseInt(form.stock),
            description: form.description,
            category_id: form.category_id ? parseInt(form.category_id) : null,
          }),
        });
      } else {
        await apiFetch("/catalog/items", {
          method: "POST",
          token,
          body: JSON.stringify({
            ...form,
            base_price: parseFloat(form.base_price),
            item_type: "product",
            stock_qty: parseInt(form.stock),
            description: form.description,
            category_id: form.category_id ? parseInt(form.category_id) : null,
          }),
        });
      }
      setShowModal(false);
      setEditingProduct(null);
      setForm({
        name: "",
        sku: "",
        category_id: "",
        base_price: "",
        stock: "0",
        description: "",
      });
      fetchData();
    } catch (e) {
      alert("Gagal menambah produk");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku || "",
      category_id: product.category_id?.toString() || "",
      base_price: product.base_price.toString(),
      stock: product.stock_qty.toString(),
      description: product.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      const token = await getToken();
      await apiFetch("/catalog/items/" + id, { method: "DELETE", token });
      fetchData();
    } catch (e) {
      alert("Gagal menghapus produk");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppShell noPadding>
      <div className="min-h-screen bg-[#F9FAFB] pb-24">
        <div className="bg-white px-4 pt-14 pb-4 shadow-sm sticky top-0 z-20">
          <div className="flex items-start justify-between gap-4 mb-4 ">
            <div className="min-w-0">
              <h1 className="mt-3 text-xs font-black text-sage-900 uppercase tracking-widest">
                Katalog Produk
              </h1>
              <p className="text-[10px] font-black text-sage-400 uppercase tracking-tighter">
                {products.length} BARANG
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setForm({
                    name: "",
                    sku: "",
                    category_id: "",
                    base_price: "",
                    stock: "0",
                    description: "",
                  });
                  setShowModal(true);
                }}
                className="w-10 h-10  bg-sage-800 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
            <input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-sage-50 rounded-xl pl-10 pr-4 text-xs font-bold outline-none border-none focus:ring-2 focus:ring-sage-100 transition-all"
            />
          </div>
        </div>
        <div className="px-4 py-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-sage-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-sage-200 rounded-[32px] py-20 text-center">
              <Package className="w-16 h-16 mx-auto text-sage-100 mb-4" />
              <p className="text-sage-400 font-bold">Belum ada produk</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-3 rounded-[24px] shadow-sm border border-line/40 flex items-center justify-between active:bg-sage-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center text-lg font-black text-sage-300">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-sage-900 leading-tight">
                        {p.name}
                      </h3>
                      <p className="text-[10px] font-black text-sage-400 uppercase tracking-tighter">
                        {p.sku || "NO-SKU"} • {p.category?.name || "UMUM"}
                      </p>
                      <p className="text-xs font-black text-sage-800 mt-0.5">
                        {money.format(p.base_price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(p)}
                      className="w-9 h-9 bg-sage-50 rounded-lg text-sage-600 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-9 h-9 bg-red-50 rounded-lg text-red-500 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] px-6 pt-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-sage-100 rounded-full mx-auto mb-6 sm:hidden" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-sage-900">
                {editingProduct ? "Ubah Produk" : "Tambah Produk"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-sage-50 rounded-full text-sage-400 hover:text-sage-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-3">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-12 bg-sage-50 rounded-xl px-4 font-bold text-sm outline-none border-none focus:ring-2 focus:ring-sage-100 transition-all"
                  placeholder="Nama Produk"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full h-12 bg-sage-50 rounded-xl px-4 font-bold text-sm outline-none border-none focus:ring-2 focus:ring-sage-100 transition-all"
                    placeholder="SKU"
                  />
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                    className="w-full h-12 bg-sage-50 rounded-xl px-4 font-bold text-sm outline-none border-none focus:ring-2 focus:ring-sage-100 transition-all appearance-none"
                  >
                    <option value="">Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-sage-400">
                      Rp
                    </span>
                    <input
                      required
                      type="number"
                      value={form.base_price}
                      onChange={(e) =>
                        setForm({ ...form, base_price: e.target.value })
                      }
                      className="w-full h-12 bg-sage-50 rounded-xl pl-9 pr-4 font-black text-sm outline-none border-none focus:ring-2 focus:ring-sage-100 transition-all"
                      placeholder="Harga"
                    />
                  </div>
                  <input
                    required
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    className="w-full h-12 bg-sage-50 rounded-xl px-4 font-bold text-sm outline-none border-none focus:ring-2 focus:ring-sage-100 transition-all"
                    placeholder="Stok"
                  />
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full p-4 bg-sage-50 rounded-xl font-bold text-sm outline-none border-none focus:ring-2 focus:ring-sage-100 transition-all"
                  placeholder="Deskripsi (Opsional)"
                  rows={2}
                />
              </div>
              <button
                disabled={submitting}
                className="w-full bg-sage-800 text-white h-14 rounded-2xl font-black shadow-xl shadow-sage-800/30 active:scale-95 transition-all text-sm uppercase tracking-widest mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Simpan Produk"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

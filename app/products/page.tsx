"use client";

import { AppShell } from "@/components/app-shell";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Package,
  X,
  Tags,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  sku: string;
  base_price: number;
  stock: number;
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
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category_id: "",
    base_price: "",
    stock: "0",
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const [resProducts, resCategories] = await Promise.all([
        apiFetch<any>("/products", { token }),
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

      console.log("products:", productsData);
      console.log("categories:", categoriesData);
    } catch (e) {
      console.warn("Failed to fetch products/catalog/categories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [getToken]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = await getToken();
      await apiFetch("/products", {
        method: "POST",
        token,
        body: JSON.stringify({
          ...form,
          base_price: parseFloat(form.base_price),
          stock: parseInt(form.stock),
          category_id: form.category_id ? parseInt(form.category_id) : null,
        }),
      });
      setShowModal(false);
      setForm({
        name: "",
        sku: "",
        category_id: "",
        base_price: "",
        stock: "0",
      });
      fetchData();
    } catch (e) {
      alert("Gagal menambah produk");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      const token = await getToken();
      await apiFetch("/products/" + id, { method: "DELETE", token });
      fetchData();
    } catch (e) {
      alert("Gagal menghapus produk");
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/setup"
            className="p-2 rounded-full hover:bg-sage-100 text-sage-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-sage-800">Daftar Produk</h1>
            <p className="text-sm text-sage-500">
              Manajemen katalog barang dagangan
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage-800 px-4 py-3 font-semibold text-white shadow-lg shadow-sage-800/20 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          Tambah Barang
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sage-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-line border-dashed">
          <Package className="mx-auto h-10 w-10 text-sage-200 mb-3" />
          <p className="text-sage-500 italic">
            Katalog masih kosong. Silakan tambah barang baru.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead className="bg-sage-50 text-sage-600 border-b border-line">
                <tr>
                  <th className="px-6 py-4 font-semibold">Produk</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold">Harga</th>
                  <th className="px-6 py-4 font-semibold">Stok</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-sage-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-sage-900">{product.name}</p>
                      <p className="text-[10px] text-sage-400 uppercase font-bold">
                        {product.sku || "- NO SKU -"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-sage-100 text-sage-700 rounded-md text-[10px] font-bold uppercase">
                        {product.category?.name || "Tanpa Kategori"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-sage-700">
                      {money.format(product.base_price)}
                    </td>
                    <td className="px-6 py-4 text-sage-600">{product.stock}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BARANG */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-sage-900/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-sage-900">Barang Baru</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-sage-50 rounded-full"
              >
                <X className="h-5 w-5 text-sage-400" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-sage-700">
                    Nama Barang
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5 w-full p-3 border border-line rounded-xl outline-none focus:border-sage-700"
                    placeholder="Contoh: Kopi Susu Aren"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-sage-700">
                    SKU (Opsional)
                  </span>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="mt-1.5 w-full p-3 border border-line rounded-xl outline-none focus:border-sage-700"
                    placeholder="KOPI-001"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-sage-700">
                    Kategori
                  </span>
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                    className="mt-1.5 w-full p-3 border border-line rounded-xl bg-white outline-none focus:border-sage-700"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-sage-700">
                    Harga Jual
                  </span>
                  <input
                    required
                    type="number"
                    value={form.base_price}
                    onChange={(e) =>
                      setForm({ ...form, base_price: e.target.value })
                    }
                    className="mt-1.5 w-full p-3 border border-line rounded-xl outline-none focus:border-sage-700"
                    placeholder="15000"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-sage-700">
                    Stok Awal
                  </span>
                  <input
                    required
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    className="mt-1.5 w-full p-3 border border-line rounded-xl outline-none focus:border-sage-700"
                  />
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 p-3 border border-line rounded-xl font-bold text-sage-600 hover:bg-sage-50"
                >
                  Batal
                </button>
                <button
                  disabled={submitting}
                  className="flex-[2] bg-sage-800 text-white p-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

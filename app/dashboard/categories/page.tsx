"use client";

import { AppShell } from "@/components/app-shell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Plus, Tags, Trash2, Loader2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Category = {
  id: number;
  name: string;
};

export default function CategoriesPage() {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await apiFetch<any>("/catalog/categories", { token });
      // Backend apiResource usually returns { data: [...] } or just [...]
      setCategories(res.data || res || []);
    } catch (e) {
      console.warn("Failed to fetch categories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [getToken]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSubmitting(true);
      const token = await getToken();
      await apiFetch("/catalog/categories", {
        method: "POST",
        token,
        body: JSON.stringify({ name: newName.trim() }),
      });
      setNewName("");
      setShowModal(false);
      fetchCategories();
    } catch (e) {
      alert("Gagal menambah kategori");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      const token = await getToken();
      await apiFetch("/catalog/categories/" + id, {
        method: "DELETE",
        token,
      });
      fetchCategories();
    } catch (e) {
      alert("Gagal menghapus kategori");
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/dashboard/setup"
              className="p-2 rounded-full hover:bg-sage-100 text-sage-600 transition-colors"
              title="Kembali ke Setup"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-sage-800">
              Kategori Barang
            </h1>
          </div>
          <p className="text-sm text-sage-500 ml-10">
            Kelompokkan produk sebelum menambahkan barang.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage-800 px-4 py-3 font-semibold text-white shadow-lg shadow-sage-800/20 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sage-400" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-line border-dashed">
          <Tags className="mx-auto h-10 w-10 text-sage-200 mb-3" />
          <p className="text-sage-500 italic">
            Belum ada kategori. Silakan tambah kategori baru.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white p-4 shadow-sm hover:border-sage-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100 text-sage-800">
                  <Tags className="h-5 w-5" />
                </div>
                <p className="font-semibold text-sage-900">{category.name}</p>
              </div>
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TAMBAH KATEGORI */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-sage-900/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-sage-900">Kategori Baru</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-sage-50 rounded-full"
              >
                <X className="h-5 w-5 text-sage-400" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-sage-700">
                  Nama Kategori
                </span>
                <input
                  autoFocus
                  placeholder="Contoh: Minuman, Makanan..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1.5 w-full p-3 border border-line rounded-xl outline-none focus:border-sage-700"
                  required
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 p-3 border border-line rounded-xl font-bold text-sage-600 hover:bg-sage-50"
                >
                  Batal
                </button>
                <button
                  disabled={submitting || !newName.trim()}
                  className="flex-[2] bg-sage-800 text-white p-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

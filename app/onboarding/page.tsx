
"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LayoutGrid,
  Loader2,
  Mail,
  Phone,
  Store,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const steps = ["Toko", "Kategori", "Modul", "Review"];

const businessTypes = [
  { id: "warung_retail", label: "Warung / Retail", description: "Kelontong, minimarket, toko harian" },
  { id: "restaurant", label: "Restoran / Cafe", description: "Meja, dapur, menu, pesanan" },
  { id: "fashion", label: "Fashion", description: "Varian ukuran, warna, dan stok" },
  { id: "workshop", label: "Bengkel", description: "Servis, sparepart, mekanik" },
  { id: "pharmacy", label: "Apotek", description: "Produk kesehatan dan stok obat" },
  { id: "service", label: "Jasa", description: "Layanan, paket, dan invoice" },
];

const modules = [
  { id: "pos", label: "Kasir POS", description: "Transaksi, pembayaran, struk" },
  { id: "products", label: "Produk & Kategori", description: "Barang, kategori, harga jual" },
  { id: "inventory", label: "Stok", description: "Stok masuk, stok keluar, minimum stok" },
  { id: "reports", label: "Laporan", description: "Penjualan harian dan performa toko" },
  { id: "staff", label: "Karyawan", description: "Kasir, admin toko, hak akses" },
  { id: "branches", label: "Multi Cabang", description: "Kelola lebih dari satu lokasi" },
];

type OnboardingForm = {
  storeName: string;
  businessEmail: string;
  phone: string;
  businessType: string;
  modules: string[];
};

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OnboardingForm>({
    storeName: "",
    businessEmail: "",
    phone: "",
    businessType: "warung_retail",
    modules: ["pos", "products"],
  });

  useEffect(() => {
    // Pre-fill from local storage if available
    const raw = window.localStorage.getItem("sakti:onboarding");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setForm((prev) => ({
          ...prev,
          storeName: data.name || data.storeName || "",
          businessEmail: data.owner_email || data.businessEmail || "",
          phone: data.phone || "",
          businessType: data.business_type || data.businessType || "warung_retail",
          modules: data.modules || ["pos", "products"],
        }));
      } catch (e) {
        console.warn("Failed to parse onboarding data", e);
      }
    }
  }, []);

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const selectedCategory = businessTypes.find((item) => item.id === form.businessType);
  const selectedModules = useMemo(
    () => modules.filter((module) => form.modules.includes(module.id)),
    [form.modules],
  );

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sage-50">
        <Loader2 className="h-7 w-7 animate-spin text-sage-700" />
      </main>
    );
  }

  const canContinue =
    step === 0
      ? form.storeName.trim().length >= 3 && (form.businessEmail || email)
      : step === 2
        ? form.modules.length > 0
        : true;

  const toggleModule = (id: string) => {
    setForm((current) => ({
      ...current,
      modules: current.modules.includes(id)
        ? current.modules.filter((module) => module !== id)
        : [...current.modules, id],
    }));
  };

  const submit = async () => {
    setLoading(true);
    const payload = {
      name: form.storeName.trim(),
      owner_email: form.businessEmail || email,
      phone: form.phone,
      clerk_user_id: user?.id,
      business_type: form.businessType,
      modules: form.modules,
      status: "pending",
    };

    try {
      const token = await getToken();
      await apiFetch("/merchants", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.warn("Merchant registration API failed, keeping local pending state.", error);
    } finally {
      window.localStorage.removeItem("sakti:onboarding");
      window.localStorage.setItem("sakti:onboarding", JSON.stringify(payload));
      setLoading(false);
      router.push("/onboarding/pending");
    }
  };

  return (
    <main className="min-h-screen bg-sage-50 px-4 py-6 text-sage-900 sm:py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sage-800 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-sage-500">SAKTI POS</p>
              <h1 className="text-xl font-bold">Onboarding Toko</h1>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {steps.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold " +
                    (index <= step ? "border-sage-800 bg-sage-800 text-white" : "border-line bg-white text-sage-400")
                  }
                >
                  {index < step ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className={index <= step ? "font-semibold text-sage-900" : "text-sage-500"}>{item}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-line bg-white p-5 shadow-sm sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-sage-500">Step 1</p>
                <h2 className="text-2xl font-bold">Data toko</h2>
              </div>
              <label className="block">
                <span className="text-sm font-semibold">Nama toko</span>
                <input
                  value={form.storeName}
                  onChange={(event) => setForm({ ...form, storeName: event.target.value })}
                  className="mt-2 w-full rounded-lg border border-line px-4 py-3 outline-none focus:border-sage-700"
                  placeholder="Contoh: Toko Maju Jaya"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">Email bisnis</span>
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-line px-3 focus-within:border-sage-700">
                    <Mail className="h-4 w-4 text-sage-400" />
                    <input
                      value={form.businessEmail || email}
                      onChange={(event) => setForm({ ...form, businessEmail: event.target.value })}
                      className="w-full py-3 outline-none"
                      type="email"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Nomor WhatsApp</span>
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-line px-3 focus-within:border-sage-700">
                    <Phone className="h-4 w-4 text-sage-400" />
                    <input
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      className="w-full py-3 outline-none"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </label>
              </div>
              <div className="rounded-lg bg-sage-50 p-4 text-sm text-sage-600">
                Clerk user id: <span className="font-mono font-semibold text-sage-800">{user?.id}</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-sage-500">Step 2</p>
                <h2 className="text-2xl font-bold">Kategori bisnis</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {businessTypes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setForm({ ...form, businessType: item.id })}
                    className={
                      "rounded-lg border p-4 text-left " +
                      (form.businessType === item.id ? "border-sage-800 bg-sage-50" : "border-line bg-white")
                    }
                  >
                    <span className="font-bold">{item.label}</span>
                    <span className="mt-1 block text-sm text-sage-500">{item.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-sage-500">Step 3</p>
                <h2 className="text-2xl font-bold">Modul awal</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className={
                      "flex gap-3 rounded-lg border p-4 text-left " +
                      (form.modules.includes(module.id) ? "border-sage-800 bg-sage-50" : "border-line bg-white")
                    }
                  >
                    <LayoutGrid className="mt-1 h-5 w-5 text-sage-700" />
                    <span>
                      <span className="font-bold">{module.label}</span>
                      <span className="mt-1 block text-sm text-sage-500">{module.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-sage-500">Step 4</p>
                <h2 className="text-2xl font-bold">Review pendaftaran</h2>
              </div>
              <div className="grid gap-3 text-sm">
                <ReviewRow label="Nama toko" value={form.storeName} />
                <ReviewRow label="Email" value={form.businessEmail || email} />
                <ReviewRow label="Kategori" value={selectedCategory?.label ?? "-"} />
                <ReviewRow label="Modul" value={selectedModules.map((item) => item.label).join(", ")} />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-5 py-3 font-semibold text-sage-700 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current + 1)}
                disabled={!canContinue}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage-800 px-5 py-3 font-semibold text-white disabled:opacity-40"
              >
                Lanjut
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage-800 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Kirim Pendaftaran
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="text-sage-500">{label}</p>
      <p className="mt-1 font-semibold text-sage-900">{value || "-"}</p>
    </div>
  );
}

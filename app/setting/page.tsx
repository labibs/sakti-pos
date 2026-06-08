"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import {
  readStoredIdentity,
  writeStoredIdentity,
} from "@/components/store/use-store-identity";
import {
  Store,
  Scan,
  Type,
  Camera,
  Layers,
  Printer,
  MessageSquare,
  Mail,
  CreditCard,
  UserCheck,
  Users,
  Database,
  ChevronRight,
  Layout,
  Loader2,
  X,
  Save,
} from "lucide-react";

export default function SettingPage() {
  const { signOut } = useClerk();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);
  const [form, setForm] = useState({ name: "", logo_url: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMerchant = async () => {
    try {
      // 1. Try loading from Cache first
      const cachedMerchant = localStorage.getItem("setting:merchant");
      if (cachedMerchant) {
        const m = JSON.parse(cachedMerchant);
        setMerchant(m);
        setForm({
          name: m.name || "",
          logo_url: m.profile?.logo_url || "",
        });
      }

      if (!cachedMerchant) setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Missing auth token");

      const result = await apiFetch<any>("/me", { token });
      const merchantData = result?.merchant;
      if (merchantData) {
        setMerchant(merchantData);
        setForm({
          name: merchantData.name || "",
          logo_url: merchantData.profile?.logo_url || "",
        });
        // 2. Save to Cache
        localStorage.setItem("setting:merchant", JSON.stringify(merchantData));
      }
    } catch (e) {
      console.error("Failed to fetch merchant", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchMerchant();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!showBrandingModal) return;

    const stored = readStoredIdentity();
    const sourceName = merchant?.name || stored.storeName;
    const sourceLogo = merchant?.profile?.logo_url || stored.logoUrl;

    setForm({
      name: sourceName || "",
      logo_url: sourceLogo || "",
    });
  }, [showBrandingModal, merchant]);

  const handleUpdateBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("[setting/page] submit branding", {
        name: form.name,
        logoLength: form.logo_url?.length || 0,
        logoPrefix: form.logo_url?.slice(0, 40) || "",
      });
      const token = await getToken();
      if (!token) throw new Error("Missing auth token");
      console.log("[setting/page] auth token", {
        present: !!token,
        length: token.length,
      });

      const result = await apiFetch<any>("/merchant/current/setting", {
        method: "PUT",
        token,
        body: JSON.stringify({
          name: form.name,
          logo_url: form.logo_url || "",
        }),
      });
      console.log("[setting/page] branding result", result);

      if (!result) {
        throw new Error("Gagal mengupdate profil toko");
      }

      const updatedMerchant = result;

      // Update local storage for immediate Navbar sync
      const saved = readStoredIdentity();
      writeStoredIdentity({
        storeName: updatedMerchant?.name || form.name,
        logoUrl:
          updatedMerchant?.profile?.logo_url || form.logo_url || saved.logoUrl,
        status: saved.status,
        ownerEmail: saved.ownerEmail,
      });

      await fetchMerchant();
      setShowBrandingModal(false);
    } catch (e) {
      console.error("[setting/page] branding submit failed", e);
      alert("Gagal mengupdate profil toko");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, logo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const settingsGroups = [
    {
      title: "Pengaturan Toko",
      items: [
        {
          icon: Store,
          title: "Nama & Logo Toko",
          desc: "Atur nama, alamat dan logo toko",
          onClick: () => setShowBrandingModal(true),
        },
      ],
    },
    {
      title: "Pengaturan Inputan",
      items: [
        {
          icon: Scan,
          title: "Scan Barcode",
          desc: "Scan barcode untuk input cepat",
        },
        {
          icon: Type,
          title: "Cari by Nama",
          desc: "Cari produk berdasarkan nama",
        },
        {
          icon: Camera,
          title: "Foto by AI",
          desc: "Foto produk & AI akan mengenali",
        },
        {
          icon: Layers,
          title: "Modul / Fitur",
          desc: "Kelola modul dan fitur aplikasi",
        },
      ],
    },
    {
      title: "Pengaturan Cetak & Kirim",
      items: [
        {
          icon: Printer,
          title: "Cetak Struk",
          desc: "Atur printer dan format struk",
        },
        {
          icon: MessageSquare,
          title: "Kirim WhatsApp",
          desc: "Kirim struk ke WhatsApp",
        },
        {
          icon: Mail,
          title: "Kirim Email",
          desc: "Kirim struk ke Email",
        },
      ],
    },
    {
      title: "Pengaturan Pembayaran",
      items: [
        {
          icon: CreditCard,
          title: "Metode Pembayaran",
          desc: "Atur metode pembayaran",
        },
      ],
    },
    {
      title: "Tipe Layanan",
      items: [
        {
          icon: UserCheck,
          title: "Tipe Layanan",
          desc: "Atur tipe layanan (Dine In, Takeaway, dll)",
        },
        {
          icon: Layout,
          title: "Pengaturan Meja",
          desc: "Kelola nomor dan denah meja",
          href: "/dashboard/tables",
        },
      ],
    },
    {
      title: "Pengaturan Lainnya",
      items: [
        {
          icon: Users,
          title: "Pengguna & Akses",
          desc: "Kelola pengguna dan hak akses",
        },
        {
          icon: Database,
          title: "Backup & Restore",
          desc: "Backup data dan restore",
        },
      ],
    },
  ];

  return (
    <AppShell noPadding>
      <div className="min-h-screen bg-[#F9FAFB] pb-40">
        <div className="bg-white px-4 pt-14 pb-4 shadow-sm sticky top-0 z-20">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="mt-3 text-xs font-black text-sage-900 uppercase tracking-widest">
                Setting
              </h1>
              <p className="text-[10px] font-bold text-sage-400 uppercase">
                Konfigurasi Aplikasi
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-6 space-y-8">
          {settingsGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h2 className="text-[10px] font-black text-sage-900 uppercase tracking-widest px-1">
                {group.title}
              </h2>
              <div className="bg-white rounded-[28px] shadow-sm border border-line/50 overflow-hidden divide-y divide-line/30">
                {group.items.map((item: any, iIdx) => {
                  const content = (
                    <div className="flex items-center justify-between p-4 hover:bg-sage-50 transition-colors active:bg-sage-100/50 text-left group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center text-sage-400 group-hover:bg-sage-100 transition-colors">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-xs text-sage-800 uppercase tracking-tight">
                            {item.title}
                          </h3>
                          <p className="text-[9px] font-bold text-sage-400 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-sage-300 group-hover:text-sage-500 transition-colors" />
                    </div>
                  );

                  if (item.href) {
                    return (
                      <Link
                        key={iIdx}
                        href={item.href}
                        className="w-full block"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={iIdx}
                      onClick={item.onClick}
                      className="w-full block"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-4">
            <button
              onClick={() => signOut()}
              className="w-full h-14 bg-red-50 text-red-600 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-sm active:scale-95 transition-all"
            >
              Keluar Akun
            </button>
          </div>

          <footer className="py-10 text-center">
            <p className="text-[9px] font-black text-sage-300 uppercase tracking-[0.2em]">
              v1.0.4 • Sakti POS
            </p>
          </footer>
        </div>
      </div>

      {showBrandingModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div
            className="absolute inset-0"
            onClick={() => setShowBrandingModal(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] px-6 pt-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-sage-100 rounded-full mx-auto mb-6 sm:hidden" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-sage-900 uppercase tracking-tight">
                Profil Toko
              </h3>
              <button
                onClick={() => setShowBrandingModal(false)}
                className="p-2 bg-sage-50 rounded-full text-sage-400 hover:text-sage-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBranding} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-24 h-24 rounded-[32px] bg-sage-50 flex items-center justify-center border-2 border-dashed border-sage-200 overflow-hidden group-hover:border-sage-400 transition-colors">
                    {form.logo_url ? (
                      <img
                        src={form.logo_url}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-sage-200" />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">
                      Ubah Logo
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <p className="text-[9px] font-black text-sage-300 uppercase tracking-widest mt-3">
                  Logo Toko
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-sage-400 uppercase tracking-widest mb-1.5 block px-1">
                    Nama Toko
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-12 bg-sage-50 rounded-xl px-4 font-bold text-sm outline-none border-none focus:ring-2 focus:ring-sage-100 transition-all"
                    placeholder="Contoh: GreenLeaf Coffee"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-sage-800 text-white h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-sage-800/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Simpan Perubahan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

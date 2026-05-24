
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, Loader2, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Merchant = {
  id: number;
  name: string;
  business_type: string;
  status: "pending" | "active" | "rejected";
  profile?: {
    email: string;
    phone: string;
  };
  modules?: { module_code: string }[];
};

export function MerchantVerificationPanel() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      // Kita panggil endpoint admin (jika sudah ada di backend)
      // Jika belum ada, ini mungkin akan return empty array atau error
      const res = await apiFetch<any>("/admin/merchants", { token });
      if (res && res.data) {
        setMerchants(res.data);
      } else if (Array.isArray(res)) {
        setMerchants(res);
      }
    } catch (e) {
      console.warn("Admin: Failed to fetch merchants", e);
      // Fallback: Coba cek local storage jika di dev
      const raw = window.localStorage.getItem("sakti:onboarding");
      if (raw) {
        const local = JSON.parse(raw);
        setMerchants([{
          id: 0,
          name: local.name || "Demo Local",
          status: local.status || "pending",
          business_type: local.business_type || "-",
          profile: { email: local.owner_email || "-", phone: local.phone || "-" },
          modules: (local.modules || []).map((m: string) => ({ module_code: m }))
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, [getToken]);

  const verifyMerchant = async (id: number, status: "active" | "rejected") => {
    try {
      const token = await getToken();
      if (id === 0) {
        // Handle local demo data
        const raw = window.localStorage.getItem("sakti:onboarding");
        if (raw) {
          const local = JSON.parse(raw);
          const updated = { ...local, status };
          window.localStorage.setItem("sakti:onboarding", JSON.stringify(updated));
          fetchMerchants();
        }
        return;
      }

      await apiFetch("/admin/merchants/" + id + "/verify", {
        method: "PATCH",
        token,
        body: JSON.stringify({ status })
      });
      fetchMerchants();
    } catch (e) {
      alert("Gagal verifikasi: " + (e instanceof Error ? e.message : "Error"));
    }
  };

  return (
    <section className="rounded-lg border border-line bg-white shadow-sm overflow-hidden">
      <div className="p-5 border-b border-line flex items-center justify-between">
        <h2 className="text-lg font-bold text-sage-900">Daftar Merchant</h2>
        <button onClick={fetchMerchants} className="p-2 hover:bg-sage-50 rounded-full transition-colors">
          <RefreshCw className={"h-4 w-4 text-sage-500 " + (loading ? "animate-spin" : "")} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-sage-50 text-sage-600 border-b border-line">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama Toko</th>
              <th className="px-6 py-4 font-semibold">Kontak</th>
              <th className="px-6 py-4 font-semibold">Bisnis</th>
              <th className="px-6 py-4 font-semibold">Modul</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && merchants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-sage-400" />
                </td>
              </tr>
            ) : merchants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sage-400 italic">
                  Belum ada data merchant.
                </td>
              </tr>
            ) : merchants.map((m) => (
              <tr key={m.id} className="hover:bg-sage-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-sage-900">{m.name}</td>
                <td className="px-6 py-4 text-sage-600">
                  <p>{m.profile?.email}</p>
                  <p className="text-xs text-sage-400">{m.profile?.phone}</p>
                </td>
                <td className="px-6 py-4 text-sage-600 capitalize">{m.business_type.replace(/_/g, " ")}</td>
                <td className="px-6 py-4 text-sage-600">
                  <div className="flex flex-wrap gap-1">
                    {(m.modules || []).map(mod => (
                      <span key={mod.module_code} className="px-2 py-0.5 bg-sage-100 text-sage-700 rounded text-[10px] font-bold uppercase">
                        {mod.module_code}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {m.status === "pending" && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => verifyMerchant(m.id, "active")}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => verifyMerchant(m.id, "rejected")}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: Merchant["status"] }) {
  const style = {
    pending: "bg-amber-50 text-amber-700",
    active: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
  }[status];

  return (
    <span className={"inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold " + style}>
      {status === "pending" && <Clock3 className="h-3 w-3" />}
      {status.toUpperCase()}
    </span>
  );
}

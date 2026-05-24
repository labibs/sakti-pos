
"use client";

import { useState } from "react";
import { CreateMerchantForm } from "@/components/admin/CreateMerchantForm";
import { MerchantVerificationPanel } from "@/components/admin/MerchantVerificationPanel";
import { Plus } from "lucide-react";

export default function AdminMerchantsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-sage-500">Super Admin</p>
          <h1 className="text-3xl font-bold text-sage-900">Manajemen Merchant</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sage-800 px-5 py-3 font-bold text-white shadow-lg shadow-sage-800/20 active:scale-95 transition-transform"
        >
          <Plus className="h-5 w-5" />
          Tambah Merchant Manual
        </button>
      </div>

      <MerchantVerificationPanel />

      {/* MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-sage-900/60 backdrop-blur-sm" 
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <CreateMerchantForm 
              onCancel={() => setShowModal(false)} 
              onSuccess={() => {
                setShowModal(false);
                // Trigger refresh if needed (handled by panel internally via polling/refresh)
                window.location.reload();
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

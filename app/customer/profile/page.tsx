"use client";

import { UserProfile } from "@clerk/nextjs";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useCustomerStore } from "@/lib/customer-store";

export default function CustomerProfilePage() {
  const { merchantId } = useCustomerStore();
  const mQuery = merchantId ? `?m=${merchantId}` : "";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm mb-6">
        <Link
          href={`/customer${mQuery}`}
          className="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center text-sage-600"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-black text-sage-900 uppercase tracking-tight">
          Profil Saya
        </h1>
      </div>

      <div className="px-4 pb-20">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none border border-line/50 rounded-[32px]",
              navbar: "hidden",
              pageScrollBox: "p-6",
            },
          }}
        />
      </div>
    </div>
  );
}

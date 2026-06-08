"use client";

import Link from "next/link";
import { UserButton, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { readStoredIdentity, writeStoredIdentity } from "@/components/store/use-store-identity";

export function Navbar() {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useClerk();
  const [storeName, setStoreName] = useState("Sakti POS");
  const [logoUrl, setLogoUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isLoaded || !isSignedIn) return;

    async function loadStoreInfo() {
      try {
        const saved = readStoredIdentity();
        setStoreName(saved.storeName);
        setLogoUrl(saved.logoUrl);

        const token = await getToken();
        if (token) {
          const res = await apiFetch<any>("/me", { token });
          const merchant = res?.merchant;

          if (merchant && merchant.name) {
            setStoreName(merchant.name);
            const logo = merchant.profile?.logo_url || saved.logoUrl || "";
            setLogoUrl(logo);
            writeStoredIdentity({
              storeName: merchant.name,
              logoUrl: logo,
              status: merchant.status,
              ownerEmail: merchant.profile?.email,
            });
          }
        }
      } catch (e) {
        console.error("Failed to load store info in navbar", e);
      }
    }
    loadStoreInfo();
  }, [mounted, isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    if (!mounted) return;
    const handleStorage = () => {
      const saved = readStoredIdentity();
      setStoreName(saved.storeName);
      setLogoUrl(saved.logoUrl);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [mounted]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-line px-4 py-2.5">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-sage-50 rounded-xl flex items-center justify-center text-base border border-line/50 group-active:scale-90 transition-transform">
            {logoUrl && mounted ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              "🌿"
            )}
          </div>
          <span className="text-[10px] font-black tracking-[0.15em] text-sage-900 truncate max-w-[150px] sm:max-w-none uppercase">
            {mounted ? storeName : "Sakti POS"}
          </span>
        </Link>
        <div className="scale-90 origin-right">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}

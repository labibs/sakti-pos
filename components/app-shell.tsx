
"use client";

import Link from "next/link";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { apiFetch } from "@/lib/api";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [storeName, setStoreName] = useState("KasirPro");
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Kecualikan admin dari proteksi status merchant
    const role = user?.publicMetadata?.role;
    if (role === 'admin') return;

    const syncMerchantStatus = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await apiFetch<any>("/me", { token });
          
          if (data?.merchant) {
            setStoreName(data.merchant.name);
            const status = data.merchant.status;

            // Simpan ke local storage agar konsisten
            window.localStorage.setItem("sakti:onboarding", JSON.stringify({
              name: data.merchant.name,
              status: status,
              owner_email: data.merchant.profile?.email
            }));

            // --- PROTEKSI STATUS ---
            // Hanya rute dashboard, pos, products, dll yang diproteksi
            const isProtectedPath = pathname.startsWith("/dashboard") || 
                                    pathname.startsWith("/pos") || 
                                    pathname.startsWith("/products") ||
                                    pathname.startsWith("/profile");

            if (isProtectedPath) {
              if (status === "pending") {
                router.push("/onboarding/pending");
              } else if (status === "rejected") {
                router.push("/onboarding/rejected");
              }
            }
          } else {
            handleNoMerchant();
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("403") || msg.includes("tidak ditemukan")) {
          handleNoMerchant();
        }
      }
    };

    const handleNoMerchant = () => {
      window.localStorage.removeItem("sakti:onboarding");
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/pos") || pathname.startsWith("/products")) {
        router.push("/onboarding");
      }
    };

    syncMerchantStatus();
  }, [isLoaded, isSignedIn, user, getToken, pathname, router]);

  return (
    <div className="min-h-screen bg-sage-50 pb-24 sm:pb-0 sm:pt-16">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-line px-4 py-3 sm:py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-sage-800 truncate max-w-[200px] sm:max-w-none">
            {storeName}
          </Link>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-20 sm:py-8">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}

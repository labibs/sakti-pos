"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { Navbar } from "./navbar";
import { apiFetch } from "@/lib/api";
import { writeStoredIdentity } from "@/components/store/use-store-identity";

export function AppShell({
  children,
  hideHeader = false,
  hideBottomNav = false,
  noPadding = false,
}: {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideBottomNav?: boolean;
  noPadding?: boolean;
}) {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Kecualikan admin dari proteksi status merchant
    const role = user?.publicMetadata?.role;
    if (role === "admin") return;

    const syncMerchantStatus = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await apiFetch<any>("/me", { token });

          if (data?.merchant) {
            const status = data.merchant.status;

            // Simpan ke local storage agar konsisten
            writeStoredIdentity({
              storeName: data.merchant.name,
              logoUrl: data.merchant.profile?.logo_url || "",
              status,
              ownerEmail: data.merchant.profile?.email,
            });

            // --- PROTEKSI STATUS ---
            // Hanya rute dashboard, pos, products, dll yang diproteksi
            const isProtectedPath =
              pathname.startsWith("/dashboard") ||
              pathname.startsWith("/pos") ||
              pathname.startsWith("/products") ||
              pathname.startsWith("/setting");

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
      window.dispatchEvent(new Event("storage"));
      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/pos") ||
        pathname.startsWith("/products")
      ) {
        router.push("/onboarding");
      }
    };

    syncMerchantStatus();
  }, [isLoaded, isSignedIn, user, getToken, pathname, router]);

  return (
    <div
      className={`min-h-screen bg-sage-50 ${noPadding ? "" : "pb-24 sm:pb-0 sm:pt-16"}`}
    >
      {!hideHeader && <Navbar />}

      <main
        className={`mx-auto max-w-7xl ${noPadding ? "" : "px-4 py-12 sm:py-8"}`}
      >
        {children}
      </main>

      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

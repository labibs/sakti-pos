"use client";

import { useUser } from "@clerk/nextjs";
import { Suspense, useEffect, useState } from "react";
import {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
} from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CustomerBottomNav } from "@/components/customer/bottom-nav";
import { CustomerAuthModal } from "@/components/customer/CustomerAuthModal";
import { useCustomerStore } from "@/lib/customer-store";

function CustomerAuthHandler({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const { registeredMerchants, guestMerchants, setTableNumber } =
    useCustomerStore();

  const isMenuPage = pathname.startsWith("/landing/menu/");
  const [merchantId, setMerchantId] = useState<number | null>(null);

  useEffect(() => {
    const m = searchParams.get("m");
    if (m) {
      setMerchantId(Number(m));
    }
    if (params.tableId) {
      setTableNumber(params.tableId as string);
    }
  }, [searchParams, params.tableId, setTableNumber]);

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    if (!isMenuPage) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, isMenuPage, router]);

  const isKnownUser =
    !!merchantId &&
    (registeredMerchants.includes(merchantId) ||
      guestMerchants.includes(merchantId));

  // Menu page: show auth popup when not signed in AND not guest
  if (isMenuPage && isLoaded && !isSignedIn && !isKnownUser) {
    if (!merchantId) return null;

    const tableId = (params.tableId as string) || "";

    const handleRegisterSuccess = (customerId: number, name: string) => {
      useCustomerStore.getState().setCustomerId(customerId);
      useCustomerStore.getState().setCustomerName(name);
      if (merchantId) useCustomerStore.getState().markRegistered(merchantId);
      sessionStorage.setItem(`customer:auth:${merchantId}:${tableId}`, "1");
    };

    const handleGuestLogin = () => {
      if (merchantId) useCustomerStore.getState().markGuest(merchantId);
      sessionStorage.setItem(`customer:auth:${merchantId}:${tableId}`, "1");
      router.push(`/guest/menu/${tableId}?m=${merchantId}`);
    };

    return (
      <CustomerAuthModal
        merchantId={merchantId.toString()}
        tableId={tableId}
        onRegisterSuccess={handleRegisterSuccess}
        onGuestLogin={handleGuestLogin}
      />
    );
  }

  // Wait for auth — allow guests on menu pages
  if (!isLoaded || (!isSignedIn && !isKnownUser)) {
    return null;
  }

  return (
    <AppShell noPadding hideHeader hideBottomNav>
      <div className="pb-24">{children}</div>
      {(isSignedIn || isKnownUser) && <CustomerBottomNav />}
    </AppShell>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <CustomerAuthHandler>{children}</CustomerAuthHandler>
    </Suspense>
  );
}

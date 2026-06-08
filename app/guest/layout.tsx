"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CustomerBottomNav } from "@/components/customer/bottom-nav";
import { useCustomerStore } from "@/lib/customer-store";

function GuestLayoutHandler({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const { setMerchantId, guestMerchants } = useCustomerStore();
  const [merchantId, setLocalMerchantId] = useState<number | null>(null);

  useEffect(() => {
    const m = searchParams.get("m");
    if (m) {
      const mid = Number(m);
      setMerchantId(mid);
      setLocalMerchantId(mid);
    }
  }, [searchParams, setMerchantId]);

  const isGuestUser = merchantId && guestMerchants.includes(merchantId);

  return (
    <AppShell noPadding hideHeader hideBottomNav>
      <div className="pb-24">{children}</div>
      {isGuestUser && <CustomerBottomNav isGuest />}
    </AppShell>
  );
}

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <GuestLayoutHandler>{children}</GuestLayoutHandler>
    </Suspense>
  );
}

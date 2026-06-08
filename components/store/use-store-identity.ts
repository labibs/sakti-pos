"use client";

import { useEffect, useState } from "react";

const ONBOARDING_KEY = "sakti:onboarding";
const DEFAULT_STORE_NAME = "Sakti POS";

export type StoredIdentity = {
  storeName: string;
  logoUrl: string;
  status?: string;
  ownerEmail?: string;
};

export function readStoredIdentity(): StoredIdentity {
  if (typeof window === "undefined") {
    return { storeName: DEFAULT_STORE_NAME, logoUrl: "" };
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return { storeName: DEFAULT_STORE_NAME, logoUrl: "" };

    const parsed = JSON.parse(raw);
    return {
      storeName: parsed.name || parsed.storeName || DEFAULT_STORE_NAME,
      logoUrl: parsed.logo_url || parsed.logoUrl || "",
      status: parsed.status,
      ownerEmail: parsed.owner_email || parsed.ownerEmail,
    };
  } catch {
    return { storeName: DEFAULT_STORE_NAME, logoUrl: "" };
  }
}

export function writeStoredIdentity(next: Partial<StoredIdentity>) {
  if (typeof window === "undefined") return;

  const current = readStoredIdentity();
  const merged: StoredIdentity = {
    ...current,
    ...next,
    storeName: next.storeName ?? current.storeName,
    logoUrl: next.logoUrl ?? current.logoUrl,
  };

  window.localStorage.setItem(
    ONBOARDING_KEY,
    JSON.stringify({
      name: merged.storeName,
      logo_url: merged.logoUrl,
      status: merged.status,
      owner_email: merged.ownerEmail,
    }),
  );
  window.dispatchEvent(new Event("storage"));
}

export function useStoreIdentity() {
  const [mounted, setMounted] = useState(false);
  const [storeName, setStoreName] = useState(DEFAULT_STORE_NAME);
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    setMounted(true);

    const syncIdentity = () => {
      const identity = readStoredIdentity();
      setStoreName(identity.storeName);
      setLogoUrl(identity.logoUrl);
    };

    syncIdentity();
    window.addEventListener("storage", syncIdentity);

    return () => window.removeEventListener("storage", syncIdentity);
  }, []);

  return {
    mounted,
    storeName,
    logoUrl,
  };
}

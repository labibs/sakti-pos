import { useState, useEffect } from "react";

interface StoreSettings {
  storeName: string;
  logoUrl: string | null;
}

const STORE_SETTINGS_KEY = "pos-pwa-store-settings";

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "Sakti",
    logoUrl: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORE_SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({
          storeName: parsed.storeName || "Sakti",
          logoUrl: parsed.logoUrl || null,
        });
      } catch (e) {
        // fallback to defaults on parse error
        setSettings({ storeName: "Sakti", logoUrl: null });
      }
    }
    setIsLoading(false);
  }, []);

  const updateSettings = (updates: Partial<StoreSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    const defaults = { storeName: "Sakti", logoUrl: null };
    setSettings(defaults);
    localStorage.removeItem(STORE_SETTINGS_KEY);
  };

  return {
    ...settings,
    isLoading,
    updateSettings,
    resetSettings,
  };
}

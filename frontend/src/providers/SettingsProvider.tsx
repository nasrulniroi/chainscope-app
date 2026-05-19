import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage";

type ThemeMode = "light" | "dark";
export type FiatCurrency = "USD" | "EUR" | "GBP" | "JPY" | "IDR";

export interface Settings {
  theme: ThemeMode;
  currency: FiatCurrency;
  refreshSec: number;
}

interface SettingsContextValue extends Settings {
  setTheme: (theme: ThemeMode) => void;
  setCurrency: (currency: FiatCurrency) => void;
  setRefreshSec: (sec: number) => void;
  toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);
const STORAGE_KEY = "cs_settings_v1";

const defaultSettings: Settings = {
  theme: "dark",
  currency: "USD",
  refreshSec: 60,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() =>
    safeLocalStorageGet<Settings>(STORAGE_KEY, defaultSettings),
  );

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY, settings);
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    root.style.colorScheme = settings.theme;
  }, [settings.theme]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      setTheme: (theme) => setSettings((prev) => ({ ...prev, theme })),
      setCurrency: (currency) => setSettings((prev) => ({ ...prev, currency })),
      setRefreshSec: (refreshSec) => setSettings((prev) => ({ ...prev, refreshSec })),
      toggleTheme: () =>
        setSettings((prev) => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" })),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export function useFiatSymbol(): string {
  const { currency } = useSettings();
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "JPY":
      return "¥";
    case "IDR":
      return "Rp";
    default:
      return "$";
  }
}

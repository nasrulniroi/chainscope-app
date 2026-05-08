import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";

import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/web3/wagmi";
import { SettingsProvider, useSettings } from "@/providers/SettingsProvider";
import { ToastProvider } from "@/providers/ToastProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RainbowKitWrapper({ children }: { children: ReactNode }) {
  const { theme } = useSettings();
  const rkTheme =
    theme === "dark"
      ? darkTheme({ accentColor: "#f59e0b", accentColorForeground: "#0b0f17", borderRadius: "medium" })
      : lightTheme({ accentColor: "#d97706", accentColorForeground: "#ffffff", borderRadius: "medium" });
  return (
    <RainbowKitProvider theme={rkTheme} modalSize="compact">
      {children}
    </RainbowKitProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitWrapper>
            <ToastProvider>{children}</ToastProvider>
          </RainbowKitWrapper>
        </WagmiProvider>
      </QueryClientProvider>
    </SettingsProvider>
  );
}

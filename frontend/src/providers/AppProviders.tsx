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
      ? darkTheme({ accentColor: "#22d3ee", accentColorForeground: "#0a1116", borderRadius: "medium" })
      : lightTheme({ accentColor: "#0e7490", accentColorForeground: "#fbf8f1", borderRadius: "medium" });
  return (
    <RainbowKitProvider theme={rkTheme} modalSize="compact" locale="en-US">
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

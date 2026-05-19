import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAccount } from "wagmi";

import { TopNav } from "@/components/layout/TopNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";

export function AppShell() {
  const { isConnected } = useAccount();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Atmospheric gradient layers */}
      <div className="ambient-glow" aria-hidden />
      <div className="ambient-grain" aria-hidden />
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        walletConnected={isConnected}
      />
      <TopNav
        onOpenMobile={() => setMobileOpen(true)}
        walletConnected={isConnected}
      />
      <main className="relative z-10 flex-1 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

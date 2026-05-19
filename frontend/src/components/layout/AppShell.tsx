import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAccount } from "wagmi";

import { RightSidebar } from "@/components/layout/RightSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage";

const COLLAPSED_KEY = "cs_sidebar_collapsed_v1";

export function AppShell() {
  const { isConnected } = useAccount();
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    safeLocalStorageGet<boolean>(COLLAPSED_KEY, false),
  );
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    safeLocalStorageSet(COLLAPSED_KEY, collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  return (
    <div className="relative flex min-h-screen items-start bg-background text-foreground">
      {/* Atmospheric gradient layers */}
      <div className="ambient-glow" aria-hidden />
      <div className="ambient-grain" aria-hidden />
      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        walletConnected={isConnected}
      />
      {/* Main content area — left side */}
      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      {/* Right sidebar — desktop only */}
      <RightSidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        walletConnected={isConnected}
      />
    </div>
  );
}

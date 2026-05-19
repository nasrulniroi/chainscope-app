import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAccount } from "wagmi";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage";

const COLLAPSED_KEY = "cs_sidebar_collapsed_v1";

export function AppShell() {
  const { isConnected } = useAccount();
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    safeLocalStorageGet<boolean>(COLLAPSED_KEY, false),
  );
  // Mobile drawer state. Always starts closed on each visit.
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    safeLocalStorageSet(COLLAPSED_KEY, collapsed);
  }, [collapsed]);

  // Lock body scroll while the mobile drawer is open so the backdrop sits flush.
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
      {/* Atmospheric layers: never block input, sit behind everything else. */}
      <div className="ambient-mesh" aria-hidden />
      <div className="ambient-grain" aria-hidden />
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        walletConnected={isConnected}
      />
      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-5 md:px-8 md:py-7">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAccount } from "wagmi";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage";

const COLLAPSED_KEY = "dcc_sidebar_collapsed_v1";

export function AppShell() {
  const { isConnected } = useAccount();
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    safeLocalStorageGet<boolean>(COLLAPSED_KEY, false),
  );

  useEffect(() => {
    safeLocalStorageSet(COLLAPSED_KEY, collapsed);
  }, [collapsed]);

  return (
    <div className="relative flex min-h-screen items-start bg-background text-foreground">
      {/* Atmospheric layers: never block input, sit behind everything else. */}
      <div className="ambient-mesh" aria-hidden />
      <div className="ambient-grain" aria-hidden />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        walletConnected={isConnected}
      />
      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden px-4 py-5 md:px-8 md:py-7">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

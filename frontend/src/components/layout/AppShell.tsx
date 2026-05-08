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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        walletConnected={isConnected}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

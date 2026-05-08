import { useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/ToastProvider";
import { safeLocalStorageGet } from "@/lib/storage";

export function SettingsDataPage() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  function clearAll() {
    setBusy(true);
    try {
      window.localStorage.clear();
      toast.toast({ type: "success", title: "Cleared local storage" });
    } finally {
      setBusy(false);
    }
  }

  function exportWatchlist() {
    const data = safeLocalStorageGet<unknown>("dcc_alerts_v1", []);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dcc-watchlist.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Local Data" description="Manage local storage: watchlist, alerts, settings." />
      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={exportWatchlist}>
            Export watchlist (JSON)
          </Button>
          <Button type="button" variant="destructive" onClick={clearAll} disabled={busy}>
            Clear all local data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

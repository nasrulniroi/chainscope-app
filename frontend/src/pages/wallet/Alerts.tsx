import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTopCoins } from "@/hooks/queries";
import { useToast } from "@/providers/ToastProvider";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";

interface Alert {
  id: string;
  coinId: string;
  symbol: string;
  direction: "above" | "below";
  threshold: number;
  createdAt: number;
}

const STORAGE_KEY = "dcc_alerts_v1";

export function WalletAlertsPage() {
  const top = useTopCoins({ perPage: 250 });
  const [alerts, setAlerts] = useState<Alert[]>(() => safeLocalStorageGet<Alert[]>(STORAGE_KEY, []));
  const [coinId, setCoinId] = useState("bitcoin");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [threshold, setThreshold] = useState("");
  const toast = useToast();

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY, alerts);
  }, [alerts]);

  const universe = top.data?.coins ?? [];
  const lookup = useMemo(() => new Map(universe.map((c) => [c.id, c])), [universe]);

  function add() {
    const coin = lookup.get(coinId);
    const value = Number(threshold);
    if (!coin || !value || Number.isNaN(value)) {
      toast.toast({ type: "error", title: "Invalid threshold" });
      return;
    }
    const alert: Alert = {
      id: `${coinId}-${direction}-${value}-${Date.now()}`,
      coinId,
      symbol: coin.symbol.toUpperCase(),
      direction,
      threshold: value,
      createdAt: Date.now(),
    };
    setAlerts([alert, ...alerts]);
    setThreshold("");
    toast.toast({ type: "success", title: "Alert created" });
  }

  function remove(id: string) {
    setAlerts(alerts.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Price Alerts"
        description="Stored locally on your device. Triggered alerts surface in the toast tray."
      />

      <Card>
        <CardHeader>
          <CardTitle>New alert</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <Label>Coin</Label>
              <Select value={coinId} onValueChange={setCoinId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {universe.slice(0, 100).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.symbol.toUpperCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Direction</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as "above" | "below")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Above</SelectItem>
                  <SelectItem value="below">Below</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Threshold (USD)</Label>
              <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="50000" />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={add} className="w-full">
                Add alert
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts yet.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => {
                const coin = lookup.get(a.coinId);
                const triggered =
                  coin && coin.current_price !== null
                    ? a.direction === "above"
                      ? coin.current_price >= a.threshold
                      : coin.current_price <= a.threshold
                    : false;
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{a.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {a.direction === "above" ? "≥" : "≤"} {formatCurrency(a.threshold)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Now {formatCurrency(coin?.current_price)}
                      </span>
                      {triggered ? <Badge variant="success">Triggered</Badge> : null}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

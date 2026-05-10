import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet } from "@/lib/api";
import type { BridgeRoute } from "@/types/api";
import { formatCompact } from "@/lib/utils";

const CHAINS = [
  { id: 1, label: "Ethereum" },
  { id: 10, label: "Optimism" },
  { id: 42161, label: "Arbitrum" },
  { id: 137, label: "Polygon" },
  { id: 8453, label: "Base" },
  { id: 56, label: "BNB Chain" },
];

export function ChainsBridgesPage() {
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("42161");
  const [amount, setAmount] = useState("0.1");
  const [routes, setRoutes] = useState<BridgeRoute[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const wei = BigInt(Math.round(Number(amount) * 1e18));
      const params = new URLSearchParams({
        fromChain: from,
        toChain: to,
        fromToken: "0x0000000000000000000000000000000000000000",
        toToken: "0x0000000000000000000000000000000000000000",
        amount: wei.toString(),
      });
      return apiGet<{ routes: BridgeRoute[]; error?: string }>(
        `/api/bridges/quote?${params.toString()}`,
      );
    },
    onSuccess: (data) => {
      setRoutes(data.routes ?? []);
      setError(data.error ?? null);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to fetch quote");
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bridge Routes"
        description="Estimate cross-chain transfer cost & duration via the LI.FI public quote API."
      />
      <Card>
        <CardHeader>
          <CardTitle>Get a route</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <Label>From chain</Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHAINS.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>To chain</Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHAINS.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (native)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
                {mutation.isPending ? "Quoting…" : "Get route"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <QueryState
        isLoading={mutation.isPending}
        error={mutation.error}
        isEmpty={!mutation.isPending && routes.length === 0}
        emptyMessage="Run a quote above to see route estimates."
      >
        {error ? (
          <Card>
            <CardContent className="pt-4 text-sm text-amber-300">{error}</CardContent>
          </Card>
        ) : null}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {routes.map((r) => (
            <Card key={r.bridge}>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide">{r.bridge}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receive</span>
                  <span className="num">{formatCompact(Number(r.estimate.toAmount) / 1e18)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="num">{r.estimate.durationSec ? `${Math.round(r.estimate.durationSec / 60)}m` : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bridge fee (USD)</span>
                  <span className="num">{r.estimate.feeUsd ? `$${r.estimate.feeUsd.toFixed(2)}` : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas (USD)</span>
                  <span className="num">{r.estimate.gasUsd ? `$${r.estimate.gasUsd.toFixed(2)}` : "-"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

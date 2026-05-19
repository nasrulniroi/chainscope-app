import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet } from "@/lib/api";
import type { SwapQuote } from "@/types/api";

const CHAINS = [
  { id: 1, label: "Ethereum" },
  { id: 137, label: "Polygon" },
  { id: 42161, label: "Arbitrum" },
  { id: 10, label: "Optimism" },
  { id: 8453, label: "Base" },
  { id: 56, label: "BNB" },
];

const TOKENS_BY_CHAIN: Record<number, { symbol: string; address: string; decimals: number }[]> = {
  1: [
    { symbol: "ETH", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals: 18 },
    { symbol: "USDC", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", decimals: 6 },
    { symbol: "USDT", address: "0xdac17f958d2ee523a2206206994597c13d831ec7", decimals: 6 },
    { symbol: "DAI", address: "0x6b175474e89094c44da98b954eedeac495271d0f", decimals: 18 },
    { symbol: "WBTC", address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", decimals: 8 },
  ],
  42161: [
    { symbol: "ETH", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals: 18 },
    { symbol: "USDC", address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", decimals: 6 },
  ],
  10: [
    { symbol: "ETH", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals: 18 },
    { symbol: "USDC", address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85", decimals: 6 },
  ],
  137: [
    { symbol: "MATIC", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals: 18 },
    { symbol: "USDC", address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", decimals: 6 },
  ],
  8453: [
    { symbol: "ETH", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals: 18 },
    { symbol: "USDC", address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", decimals: 6 },
  ],
  56: [
    { symbol: "BNB", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals: 18 },
    { symbol: "USDT", address: "0x55d398326f99059ff775485246999027b3197955", decimals: 18 },
  ],
};

export function ToolsSwapSimulatorPage() {
  const [chainId, setChainId] = useState(1);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [amount, setAmount] = useState("1");
  const [quote, setQuote] = useState<SwapQuote | null>(null);

  const tokens = TOKENS_BY_CHAIN[chainId] ?? [];
  const fromToken = tokens[fromIdx] ?? tokens[0];
  const toToken = tokens[toIdx] ?? tokens[1];

  const mutation = useMutation({
    mutationFn: async () => {
      const wei = BigInt(Math.round(Number(amount) * Math.pow(10, fromToken?.decimals ?? 18)));
      const params = new URLSearchParams({
        chainId: String(chainId),
        src: fromToken?.address ?? "",
        dst: toToken?.address ?? "",
        amount: wei.toString(),
      });
      return apiGet<SwapQuote>(`/api/tools/swap?${params.toString()}`);
    },
    onSuccess: (data) => setQuote(data),
  });

  const out = quote ? Number(quote.to_amount) / Math.pow(10, toToken?.decimals ?? 18) : null;
  const inp = Number(amount);
  const rate = out && inp ? out / inp : null;

  return (
    <div className="space-y-4">
      <PageHeader title="Swap Simulator" description="Get a 1inch quote for any chain/token pair without leaving ChainScope." />
      <Card>
        <CardHeader>
          <CardTitle>Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div>
              <Label>Chain</Label>
              <Select value={String(chainId)} onValueChange={(v) => { setChainId(Number(v)); setFromIdx(0); setToIdx(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHAINS.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From</Label>
              <Select value={String(fromIdx)} onValueChange={(v) => setFromIdx(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tokens.map((t, i) => (
                    <SelectItem key={t.address} value={String(i)}>{t.symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Select value={String(toIdx)} onValueChange={(v) => setToIdx(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tokens.map((t, i) => (
                    <SelectItem key={t.address} value={String(i)}>{t.symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()} className="w-full">
                {mutation.isPending ? "Quoting…" : "Get quote"}
              </Button>
            </div>
          </div>

          <QueryState isLoading={mutation.isPending} error={mutation.error}>
            {quote ? (
              <div className="mt-4 rounded-md border border-border/60 bg-muted/20 p-4">
                <div className="text-xs text-muted-foreground">
                  {amount} {fromToken?.symbol} → {toToken?.symbol}
                </div>
                <div className="num text-2xl font-semibold">
                  {out ? out.toFixed(6) : "-"} {toToken?.symbol}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">Rate {rate ? rate.toFixed(6) : "-"}</Badge>
                  <Badge variant="outline">Gas est. {quote.estimated_gas ?? "-"}</Badge>
                  {Array.isArray(quote.protocols) && quote.protocols.length > 0 ? (
                    <Badge variant="outline">{quote.protocols.length} routes</Badge>
                  ) : null}
                </div>
              </div>
            ) : null}
          </QueryState>
        </CardContent>
      </Card>
    </div>
  );
}

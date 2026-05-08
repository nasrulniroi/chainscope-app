import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTopCoins } from "@/hooks/queries";
import { formatCurrency } from "@/lib/utils";

const FIATS = ["USD", "EUR", "GBP", "JPY", "IDR"];

export function ToolsConverterPage() {
  const top = useTopCoins({ perPage: 100 });
  const universe = top.data?.coins ?? [];
  const [from, setFrom] = useState("bitcoin");
  const [to, setTo] = useState("ethereum");
  const [amount, setAmount] = useState("1");

  const fromCoin = universe.find((c) => c.id === from);
  const toCoin = universe.find((c) => c.id === to);
  const fromPrice = fromCoin?.current_price ?? null;
  const toPrice = toCoin?.current_price ?? null;
  const result = useMemo(() => {
    const a = Number(amount);
    if (!a || !fromPrice || !toPrice) return null;
    return (a * fromPrice) / toPrice;
  }, [amount, fromPrice, toPrice]);

  const fiatAmount = useMemo(() => {
    const a = Number(amount);
    if (!a || !fromPrice) return null;
    return a * fromPrice;
  }, [amount, fromPrice]);

  return (
    <div className="space-y-4">
      <PageHeader title="Crypto Converter" description="Convert between any two top-100 coins or fiat using live CoinGecko prices." />
      <QueryState isLoading={top.isLoading} error={top.error}>
        <Card>
          <CardHeader>
            <CardTitle>Convert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <Label>Amount</Label>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <Label>From</Label>
                <Select value={from} onValueChange={setFrom}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {universe.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.symbol.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>To</Label>
                <Select value={to} onValueChange={setTo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {universe.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.symbol.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-border/60 bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground">
                {amount} {fromCoin?.symbol.toUpperCase() ?? "?"}
              </div>
              <div className="num text-2xl font-semibold">
                ≈ {result !== null ? `${result.toFixed(6)} ${toCoin?.symbol.toUpperCase() ?? ""}` : "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Fiat estimate: {fiatAmount !== null ? formatCurrency(fiatAmount) : "—"}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">
              {FIATS.map((f) => (
                <div key={f} className="rounded-md border border-border/60 bg-muted/20 p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">{f}</div>
                  <div className="num">
                    {fiatAmount !== null
                      ? new Intl.NumberFormat("en-US", { style: "currency", currency: f }).format(fiatAmount)
                      : "—"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </QueryState>
    </div>
  );
}

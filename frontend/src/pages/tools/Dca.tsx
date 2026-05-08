import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoinChart, useTopCoins } from "@/hooks/queries";
import { formatCurrency } from "@/lib/utils";

export function ToolsDcaPage() {
  const top = useTopCoins({ perPage: 50 });
  const universe = top.data?.coins ?? [];
  const [coinId, setCoinId] = useState("bitcoin");
  const [amount, setAmount] = useState("100");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const chart = useCoinChart(coinId, "365");

  const sim = useMemo(() => {
    const cad = Number(amount);
    if (!cad || !chart.data) return null;
    const stepDays = frequency === "daily" ? 1 : frequency === "weekly" ? 7 : 30;
    const stepMs = stepDays * 24 * 60 * 60 * 1000;
    const points = chart.data.prices;
    if (points.length === 0) return null;
    const series: { ts: number; invested: number; value: number }[] = [];
    let invested = 0;
    let qty = 0;
    let nextDca = points[0]?.[0] ?? 0;
    for (const [ts, price] of points) {
      while (ts >= nextDca) {
        invested += cad;
        qty += cad / price;
        nextDca += stepMs;
      }
      series.push({ ts, invested, value: qty * price });
    }
    return { series, invested, qty, finalPrice: points[points.length - 1]?.[1] ?? 0 };
  }, [amount, chart.data, frequency]);

  const finalValue = sim ? sim.qty * sim.finalPrice : 0;
  const pnl = sim ? finalValue - sim.invested : 0;
  const pnlPct = sim && sim.invested ? (pnl / sim.invested) * 100 : 0;

  return (
    <div className="space-y-4">
      <PageHeader title="DCA Backtest" description="Simulate a dollar-cost-averaging strategy on any top-50 coin over the last year." />
      <Card>
        <CardHeader>
          <CardTitle>Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <Label>Coin</Label>
              <Select value={coinId} onValueChange={setCoinId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {universe.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount per period (USD)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as "daily" | "weekly" | "monthly")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <QueryState isLoading={chart.isLoading} error={chart.error}>
        {sim ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs uppercase text-muted-foreground">Total invested</div>
                <div className="num text-2xl font-semibold">{formatCurrency(sim.invested)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs uppercase text-muted-foreground">Final value</div>
                <div className="num text-2xl font-semibold">{formatCurrency(finalValue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs uppercase text-muted-foreground">Net PnL</div>
                <div className={`num text-2xl font-semibold ${pnl >= 0 ? "ticker-up" : "ticker-down"}`}>
                  {formatCurrency(pnl)} ({pnlPct.toFixed(1)}%)
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Invested vs Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sim.series}>
                      <defs>
                        <linearGradient id="invested" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="value" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="ts"
                        stroke="#94a3b8"
                        fontSize={10}
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={(v: number) => new Date(v).toLocaleDateString()}
                      />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #1f2937" }}
                        labelFormatter={(v: number) => new Date(v).toLocaleDateString()}
                        formatter={(v: number) => formatCurrency(v)}
                      />
                      <Area type="monotone" dataKey="invested" stroke="#94a3b8" fill="url(#invested)" />
                      <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#value)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </QueryState>
    </div>
  );
}

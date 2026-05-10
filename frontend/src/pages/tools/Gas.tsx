import { useMemo } from "react";
import { CartesianGrid, Line, LineChart as RLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGasHistory, useGasOracle, useTopCoins } from "@/hooks/queries";

const TX_TYPES: { name: string; gas: number }[] = [
  { name: "ETH transfer", gas: 21_000 },
  { name: "ERC-20 transfer", gas: 65_000 },
  { name: "Uniswap V3 swap", gas: 184_000 },
  { name: "Aave deposit", gas: 280_000 },
  { name: "NFT mint", gas: 200_000 },
];

export function ToolsGasPage() {
  const oracle = useGasOracle();
  const history = useGasHistory();
  const top = useTopCoins({ ids: "ethereum", perPage: 1 });
  const ethPrice = top.data?.coins?.[0]?.current_price ?? null;

  const series = useMemo(
    () =>
      (history.data?.history ?? []).map((p) => ({
        ts: p.ts * 1000,
        baseFee: p.base_fee,
        fast: p.fast,
      })),
    [history.data],
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Gas Tracker" description="Live Ethereum gas oracle plus cost estimates for common operations." />
      <QueryState isLoading={oracle.isLoading} error={oracle.error}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-xs uppercase text-muted-foreground">Safe</div>
              <div className="num text-2xl font-semibold">{oracle.data?.safe?.toFixed(0) ?? "-"} gwei</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-xs uppercase text-muted-foreground">Average</div>
              <div className="num text-2xl font-semibold">{oracle.data?.propose?.toFixed(0) ?? "-"} gwei</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-xs uppercase text-muted-foreground">Fast</div>
              <div className="num text-2xl font-semibold">{oracle.data?.fast?.toFixed(0) ?? "-"} gwei</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-xs uppercase text-muted-foreground">Base fee</div>
              <div className="num text-2xl font-semibold">{oracle.data?.base_fee?.toFixed(2) ?? "-"} gwei</div>
              <div className="mt-1 text-xs text-muted-foreground">
                ETH ${ethPrice ? ethPrice.toFixed(0) : "-"}
              </div>
            </CardContent>
          </Card>
        </div>
      </QueryState>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>30-min history</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState isLoading={history.isLoading} error={history.error} isEmpty={series.length === 0} emptyMessage="Collecting gas history…">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RLineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="ts"
                      stroke="#94a3b8"
                      fontSize={10}
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(v: number) => new Date(v).toLocaleTimeString()}
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v: number) => `${v.toFixed(0)}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #1f2937" }}
                      labelFormatter={(v: number) => new Date(v).toLocaleTimeString()}
                      formatter={(v: number) => `${v.toFixed(2)} gwei`}
                    />
                    <Line type="monotone" dataKey="baseFee" stroke="#22d3ee" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="fast" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  </RLineChart>
                </ResponsiveContainer>
              </div>
            </QueryState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost estimator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Action</th>
                    <th className="px-3 py-2 text-right">Gas</th>
                    <th className="px-3 py-2 text-right">USD (avg)</th>
                    <th className="px-3 py-2 text-right">USD (fast)</th>
                  </tr>
                </thead>
                <tbody>
                  {TX_TYPES.map((tx) => {
                    const avg =
                      oracle.data?.propose && ethPrice ? (tx.gas * oracle.data.propose * 1e-9) * ethPrice : null;
                    const fast =
                      oracle.data?.fast && ethPrice ? (tx.gas * oracle.data.fast * 1e-9) * ethPrice : null;
                    return (
                      <tr key={tx.name} className="border-t border-border/60">
                        <td className="px-3 py-2 font-medium">{tx.name}</td>
                        <td className="num px-3 py-2 text-right">{tx.gas.toLocaleString()}</td>
                        <td className="num px-3 py-2 text-right">{avg ? `$${avg.toFixed(2)}` : "-"}</td>
                        <td className="num px-3 py-2 text-right">{fast ? `$${fast.toFixed(2)}` : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-[10px]">Live ETH price via CoinGecko</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

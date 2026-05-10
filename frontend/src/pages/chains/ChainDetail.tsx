import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoinThumb } from "@/components/common/CoinThumb";
import { Badge } from "@/components/ui/badge";
import { useChainDetail } from "@/hooks/queries";
import { changeColor, formatCompact, formatPct } from "@/lib/utils";

export function ChainDetailPage() {
  const { name } = useParams<{ name: string }>();
  const detail = useChainDetail(name);

  const series = useMemo(
    () =>
      (detail.data?.history ?? []).map((p) => ({
        ts: (p.date ?? 0) * 1000,
        tvl: p.tvl ?? 0,
      })),
    [detail.data],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Chain: ${name}`}
        description="Historical TVL and the largest protocols on this chain."
        actions={
          <Link to="/chains" className="text-xs text-primary hover:underline">
            ← All chains
          </Link>
        }
      />
      <QueryState isLoading={detail.isLoading} error={detail.error}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>TVL history</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <defs>
                      <linearGradient id="ctvl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
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
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v: number) => formatCompact(v)} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #1f2937" }}
                      labelFormatter={(v: number) => new Date(v).toLocaleString()}
                      formatter={(v: number) => formatCompact(v, "USD")}
                    />
                    <Area type="monotone" dataKey="tvl" stroke="#a78bfa" fill="url(#ctvl)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current TVL</span>
                <span className="num font-semibold">{formatCompact(detail.data?.tvl, "USD")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protocols listed</span>
                <span className="num">{detail.data?.protocols.length ?? 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Top protocols on {name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Protocol</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-right">TVL</th>
                      <th className="px-3 py-2 text-right">1d</th>
                      <th className="px-3 py-2 text-right">7d</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.data?.protocols ?? []).map((p) => (
                      <tr key={p.slug ?? p.name} className="border-t border-border/60 hover:bg-accent/40">
                        <td className="px-3 py-2">
                          <Link to={`/defi/protocols/${p.slug}`} className="flex items-center gap-2 hover:text-primary">
                            <CoinThumb src={p.logo} alt={p.name} size={20} />
                            <span className="font-medium">{p.name}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          {p.category ? <Badge variant="outline">{p.category}</Badge> : "-"}
                        </td>
                        <td className="num px-3 py-2 text-right">{formatCompact(p.tvl, "USD")}</td>
                        <td className={`num px-3 py-2 text-right ${changeColor(p.change_1d)}`}>
                          {formatPct(p.change_1d)}
                        </td>
                        <td className={`num px-3 py-2 text-right ${changeColor(p.change_7d)}`}>
                          {formatPct(p.change_7d)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </QueryState>
    </div>
  );
}

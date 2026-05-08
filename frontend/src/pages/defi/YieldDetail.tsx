import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, Line, LineChart as RLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDefiYieldDetail } from "@/hooks/queries";
import { formatCompact } from "@/lib/utils";

export function DefiYieldDetailPage() {
  const { pool } = useParams<{ pool: string }>();
  const detail = useDefiYieldDetail(pool);
  const series = useMemo(
    () =>
      (detail.data?.history ?? []).map((p) => ({
        ts: (p.ts ?? 0) * 1 + 0,
        apy: p.apy ?? 0,
        tvl: p.tvlUsd ?? 0,
      })),
    [detail.data],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Pool ${pool}`}
        description="Historical APY and TVL for this pool."
        actions={
          <Link to="/defi/yields" className="text-xs text-primary hover:underline">
            ← All yields
          </Link>
        }
      />
      <QueryState isLoading={detail.isLoading} error={detail.error}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>APY history</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RLineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="ts"
                      stroke="#94a3b8"
                      fontSize={10}
                      type="category"
                      tickFormatter={(v: string | number) =>
                        new Date(typeof v === "number" ? v * 1000 : Date.parse(String(v))).toLocaleDateString()
                      }
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #1f2937" }}
                      formatter={(v: number) => `${v.toFixed(2)}%`}
                    />
                    <Line type="monotone" dataKey="apy" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </RLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>TVL history</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <defs>
                      <linearGradient id="ptvl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="ts" stroke="#94a3b8" fontSize={10} hide />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v: number) => formatCompact(v)} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #1f2937" }}
                      formatter={(v: number) => formatCompact(v, "USD")}
                    />
                    <Area type="monotone" dataKey="tvl" stroke="#22d3ee" fill="url(#ptvl)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </QueryState>
    </div>
  );
}

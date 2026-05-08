import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSentimentHistory } from "@/hooks/queries";

export function NewsSentimentPage() {
  const sentiment = useSentimentHistory();
  const series = useMemo(
    () =>
      (sentiment.data?.history ?? []).map((p) => ({
        ts: p.ts * 1000,
        value: p.value,
        classification: p.classification,
      })),
    [sentiment.data],
  );
  const latest = sentiment.data?.latest ?? null;

  return (
    <div className="space-y-4">
      <PageHeader title="Market Sentiment" description="Crypto Fear & Greed Index history (alternative.me)." />
      <QueryState isLoading={sentiment.isLoading} error={sentiment.error}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Current</CardTitle>
            </CardHeader>
            <CardContent>
              {latest ? (
                <div className="space-y-2">
                  <div className="num text-5xl font-semibold">{latest.value}</div>
                  <Badge variant="outline">{latest.classification}</Badge>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(latest.ts * 1000).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No reading available.</p>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>30 days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <defs>
                      <linearGradient id="fng" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
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
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #1f2937" }}
                      labelFormatter={(v: number) => new Date(v).toLocaleString()}
                      formatter={(v: number) => v.toString()}
                    />
                    <Area type="monotone" dataKey="value" stroke="#22d3ee" fill="url(#fng)" />
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

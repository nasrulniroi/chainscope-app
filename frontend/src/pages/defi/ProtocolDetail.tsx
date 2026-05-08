import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useDefiProtocolDetail } from "@/hooks/queries";
import { changeColor, formatCompact, formatPct } from "@/lib/utils";

export function DefiProtocolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const detail = useDefiProtocolDetail(slug);

  const series = useMemo(
    () =>
      (detail.data?.tvl_history ?? []).map((p) => ({
        ts: p.date * 1000,
        tvl: p.tvl ?? 0,
      })),
    [detail.data],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title={detail.data?.name ?? `Protocol: ${slug}`}
        description={detail.data?.description ?? "DefiLlama TVL detail."}
        actions={
          <Link to="/defi/protocols" className="text-xs text-primary hover:underline">
            ← All protocols
          </Link>
        }
      />
      <QueryState isLoading={detail.isLoading} error={detail.error}>
        {detail.data ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CoinThumb src={detail.data.logo} alt={detail.data.name} size={24} />
                  TVL history
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series}>
                      <defs>
                        <linearGradient id="tvl" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
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
                      <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v: number) => formatCompact(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #1f2937" }}
                        labelFormatter={(v: number) => new Date(v).toLocaleString()}
                        formatter={(v: number) => formatCompact(v, "USD")}
                      />
                      <Area type="monotone" dataKey="tvl" stroke="#22d3ee" fill="url(#tvl)" />
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
                <Row label="TVL" value={<span className="num font-medium">{formatCompact(detail.data.tvl, "USD")}</span>} />
                <Row
                  label="1d / 7d"
                  value={
                    <span className="num text-xs">
                      <span className={changeColor(detail.data.change_1d)}>{formatPct(detail.data.change_1d)}</span>
                      {" · "}
                      <span className={changeColor(detail.data.change_7d)}>{formatPct(detail.data.change_7d)}</span>
                    </span>
                  }
                />
                <Row label="Category" value={<Badge variant="outline">{detail.data.category ?? "—"}</Badge>} />
                <Row label="Mcap" value={formatCompact(detail.data.mcap, "USD")} />
                <Row
                  label="Audits"
                  value={
                    <span className="text-xs text-muted-foreground">
                      {detail.data.audits ? `Tier ${detail.data.audits}` : "—"}
                    </span>
                  }
                />
                <Row
                  label="Twitter"
                  value={
                    detail.data.twitter ? (
                      <a
                        href={`https://twitter.com/${detail.data.twitter}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        @{detail.data.twitter}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )
                  }
                />
                <Row
                  label="Site"
                  value={
                    detail.data.url ? (
                      <a href={detail.data.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                        {new URL(detail.data.url).hostname}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )
                  }
                />
                <div>
                  <div className="text-muted-foreground">Chains</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(detail.data.chains ?? []).slice(0, 12).map((c) => (
                      <Badge key={c} variant="secondary" className="text-[10px]">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>TVL by chain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Object.entries(detail.data.chain_tvls ?? {})
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .slice(0, 16)
                    .map(([name, tvl]) => (
                      <div key={name} className="rounded-md border border-border/60 bg-muted/20 p-3">
                        <div className="text-xs uppercase text-muted-foreground">{name}</div>
                        <div className="num text-sm font-semibold">{formatCompact(tvl as number, "USD")}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </QueryState>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

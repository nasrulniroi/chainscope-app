import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart as RLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoinThumb } from "@/components/common/CoinThumb";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCoinChart, useCoinDetail } from "@/hooks/queries";
import { changeColor, formatCompact, formatCurrency, formatPct } from "@/lib/utils";

const RANGES = [
  { id: "1", label: "1d" },
  { id: "7", label: "7d" },
  { id: "30", label: "30d" },
  { id: "90", label: "90d" },
  { id: "365", label: "1y" },
] as const;

export function TokenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("30");
  const detail = useCoinDetail(id);
  const chart = useCoinChart(id, range);

  const series = useMemo(() => {
    return (chart.data?.prices ?? []).map(([ts, price]) => ({
      ts,
      price,
      label: new Date(ts).toLocaleString(),
    }));
  }, [chart.data]);

  const positive = (detail.data?.price_change_percentage_24h ?? 0) >= 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title={detail.data ? `${detail.data.name} (${detail.data.symbol?.toUpperCase()})` : `Token: ${id}`}
        description="Live price, supply, ATH/ATL, and market history."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/tokens/${id}/markets`}>Markets</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/tokens/${id}/news`}>News</Link>
            </Button>
          </div>
        }
      />
      <QueryState isLoading={detail.isLoading} error={detail.error}>
        {detail.data ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <CoinThumb src={detail.data.image} alt={detail.data.symbol} size={28} />
                  <span>{detail.data.name}</span>
                  <span className="text-xs uppercase text-muted-foreground">
                    {detail.data.symbol}
                  </span>
                </CardTitle>
                <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
                  <TabsList>
                    {RANGES.map((r) => (
                      <TabsTrigger key={r.id} value={r.id} className="px-2 text-xs">
                        {r.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-3">
                  <div className="num text-3xl font-semibold">{formatCurrency(detail.data.current_price)}</div>
                  <div className={`num text-sm ${changeColor(detail.data.price_change_percentage_24h)}`}>
                    {formatPct(detail.data.price_change_percentage_24h)}
                  </div>
                </div>
                <div className="mt-4 h-72">
                  <QueryState isLoading={chart.isLoading} error={chart.error}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RLineChart data={series}>
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
                          formatter={(v: number) => formatCurrency(v)}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={positive ? "#22c55e" : "#f43f5e"}
                          strokeWidth={2}
                          dot={false}
                        />
                      </RLineChart>
                    </ResponsiveContainer>
                  </QueryState>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Rank" value={detail.data.market_cap_rank ? `#${detail.data.market_cap_rank}` : "—"} />
                <Row label="Market cap" value={formatCompact(detail.data.market_cap, "USD")} />
                <Row label="Fully diluted" value={formatCompact(detail.data.fully_diluted_valuation, "USD")} />
                <Row label="24h volume" value={formatCompact(detail.data.total_volume, "USD")} />
                <Row label="Circulating" value={formatCompact(detail.data.circulating_supply)} />
                <Row label="Total supply" value={formatCompact(detail.data.total_supply)} />
                <Row label="Max supply" value={formatCompact(detail.data.max_supply)} />
                <Row
                  label="ATH"
                  value={
                    <span>
                      <span className="num">{formatCurrency(detail.data.ath)}</span>
                      {detail.data.ath_date ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          {new Date(detail.data.ath_date).toLocaleDateString()}
                        </span>
                      ) : null}
                    </span>
                  }
                />
                <Row
                  label="ATL"
                  value={
                    <span>
                      <span className="num">{formatCurrency(detail.data.atl)}</span>
                      {detail.data.atl_date ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          {new Date(detail.data.atl_date).toLocaleDateString()}
                        </span>
                      ) : null}
                    </span>
                  }
                />
                <Row
                  label="7d / 30d / 1y"
                  value={
                    <span className="num text-xs">
                      <span className={changeColor(detail.data.price_change_percentage_7d)}>
                        {formatPct(detail.data.price_change_percentage_7d)}
                      </span>
                      {" · "}
                      <span className={changeColor(detail.data.price_change_percentage_30d)}>
                        {formatPct(detail.data.price_change_percentage_30d)}
                      </span>
                      {" · "}
                      <span className={changeColor(detail.data.price_change_percentage_1y)}>
                        {formatPct(detail.data.price_change_percentage_1y)}
                      </span>
                    </span>
                  }
                />
                {(detail.data.categories ?? []).length > 0 ? (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {detail.data.categories.slice(0, 8).map((cat) => (
                      <Badge key={cat} variant="outline" className="text-[10px]">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {detail.data.description ? (
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>About {detail.data.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-invert max-w-none text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: detail.data.description.split("\n\n")[0] ?? "" }}
                  />
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </QueryState>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-border/40 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

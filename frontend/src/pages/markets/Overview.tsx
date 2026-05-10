import { Link } from "react-router-dom";
import { CartesianGrid, Line, LineChart as RLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/common/Sparkline";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useMarketGlobal, useSentimentHistory, useTopCoins } from "@/hooks/queries";
import { changeColor, formatCompact, formatCurrency, formatPct } from "@/lib/utils";

export function MarketsOverviewPage() {
  const global = useMarketGlobal();
  const top = useTopCoins({ perPage: 10 });
  const sentiment = useSentimentHistory();

  const sentimentSeries = (sentiment.data?.history ?? []).map((p) => ({
    ts: p.ts,
    value: p.value,
    date: new Date(p.ts * 1000).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Market Overview"
        description="Total market capitalization, BTC/ETH dominance, sentiment, and the top 10 by market cap."
      />

      <QueryState isLoading={global.isLoading} error={global.error}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Total Market Cap"
            value={formatCompact(global.data?.total_market_cap, "USD")}
            change={global.data?.market_cap_change_24h ?? null}
          />
          <MetricCard label="24h Volume" value={formatCompact(global.data?.total_volume, "USD")} />
          <MetricCard
            label="Active Coins"
            value={global.data?.active_cryptocurrencies?.toLocaleString() ?? "-"}
            hint={`${global.data?.markets ?? "-"} markets tracked`}
          />
          <MetricCard
            label="Fear & Greed"
            value={
              global.data?.fear_greed
                ? `${global.data.fear_greed.value} · ${global.data.fear_greed.classification}`
                : "-"
            }
            hint="alternative.me"
          />
        </div>
      </QueryState>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 10 - 7d sparkline</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState isLoading={top.isLoading} error={top.error}>
              <div className="overflow-hidden rounded-md border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Coin</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">24h</th>
                      <th className="px-3 py-2 text-right">7d</th>
                      <th className="px-3 py-2 text-right">Mcap</th>
                      <th className="px-3 py-2 text-right">7d chart</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(top.data?.coins ?? []).map((c) => (
                      <tr key={c.id} className="border-t border-border/60 hover:bg-accent/40">
                        <td className="px-3 py-2 num text-muted-foreground">{c.market_cap_rank}</td>
                        <td className="px-3 py-2">
                          <Link to={`/tokens/${c.id}`} className="flex items-center gap-2 hover:text-primary">
                            <CoinThumb src={c.image} alt={c.symbol} size={20} />
                            <span className="font-medium">{c.name}</span>
                            <span className="text-xs uppercase text-muted-foreground">{c.symbol}</span>
                          </Link>
                        </td>
                        <td className="num px-3 py-2 text-right">{formatCurrency(c.current_price)}</td>
                        <td className={`num px-3 py-2 text-right ${changeColor(c.price_change_percentage_24h)}`}>
                          {formatPct(c.price_change_percentage_24h)}
                        </td>
                        <td className={`num px-3 py-2 text-right ${changeColor(c.price_change_percentage_7d)}`}>
                          {formatPct(c.price_change_percentage_7d)}
                        </td>
                        <td className="num px-3 py-2 text-right">{formatCompact(c.market_cap, "USD")}</td>
                        <td className="px-3 py-2 text-right">
                          <Sparkline
                            data={c.sparkline_7d}
                            positive={(c.price_change_percentage_24h ?? 0) >= 0}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </QueryState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment (4 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState isLoading={sentiment.isLoading} error={sentiment.error}>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RLineChart data={sentimentSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #1f2937" }}
                      labelStyle={{ color: "#cbd5e1" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </RLineChart>
                </ResponsiveContainer>
              </div>
              {sentiment.data?.latest ? (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Today</span>
                  <span className="num font-semibold">
                    {sentiment.data.latest.value} · {sentiment.data.latest.classification}
                  </span>
                </div>
              ) : null}
            </QueryState>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

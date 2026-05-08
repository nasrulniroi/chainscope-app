import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/common/Sparkline";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useGasOracle, useMarketGlobal, useTopCoins } from "@/hooks/queries";
import { changeColor, formatCompact, formatCurrency, formatPct } from "@/lib/utils";
import { NAV_SECTIONS } from "@/routes/config";

export function HomePage() {
  // Hide wallet hub from logged-out home; it's still in the sidebar after connect.
  const hubs = NAV_SECTIONS.filter((s) => !s.walletGated);
  const global = useMarketGlobal();
  const top = useTopCoins({ perPage: 8 });
  const gas = useGasOracle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="DeFi Command Center"
        description="A free, multi-chain Web3 terminal — markets, DeFi, on-chain tools and your wallet, in one place."
      />
      <QueryState isLoading={global.isLoading} error={global.error}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Market Cap"
            value={formatCompact(global.data?.total_market_cap, "USD")}
            change={global.data?.market_cap_change_24h ?? null}
          />
          <MetricCard label="24h Volume" value={formatCompact(global.data?.total_volume, "USD")} />
          <MetricCard
            label="BTC Dominance"
            value={`${(global.data?.btc_dominance ?? 0).toFixed(2)}%`}
            hint={`ETH ${global.data?.eth_dominance?.toFixed(2) ?? "—"}%`}
          />
          <MetricCard
            label="Fear & Greed"
            value={
              global.data?.fear_greed
                ? `${global.data.fear_greed.value} · ${global.data.fear_greed.classification}`
                : "—"
            }
            hint="Source: alternative.me"
          />
        </div>
      </QueryState>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Top by Market Cap</CardTitle>
            <Link to="/markets/overview" className="text-xs text-primary hover:underline">
              View all <ArrowRight className="inline h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <QueryState isLoading={top.isLoading} error={top.error}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(top.data?.coins ?? []).map((c) => (
                  <Link
                    key={c.id}
                    to={`/tokens/${c.id}`}
                    className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 p-2 transition hover:bg-accent"
                  >
                    <CoinThumb src={c.image} alt={c.symbol} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{c.name}</span>
                        <span className="num font-medium">{formatCurrency(c.current_price)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="uppercase">{c.symbol}</span>
                        <span className={`num ${changeColor(c.price_change_percentage_24h)}`}>
                          {formatPct(c.price_change_percentage_24h)}
                        </span>
                      </div>
                    </div>
                    <Sparkline
                      data={c.sparkline_7d}
                      positive={(c.price_change_percentage_24h ?? 0) >= 0}
                    />
                  </Link>
                ))}
              </div>
            </QueryState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Gas (Ethereum)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QueryState isLoading={gas.isLoading} error={gas.error}>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md border border-border/60 p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Slow</div>
                  <div className="num text-base font-semibold">{gas.data?.safe ?? "—"}</div>
                </div>
                <div className="rounded-md border border-primary/40 bg-primary/10 p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Std</div>
                  <div className="num text-base font-semibold">{gas.data?.propose ?? "—"}</div>
                </div>
                <div className="rounded-md border border-border/60 p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Fast</div>
                  <div className="num text-base font-semibold">{gas.data?.fast ?? "—"}</div>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Base fee</span>
                <span className="num">
                  {gas.data?.base_fee ? `${gas.data.base_fee.toFixed(2)} gwei` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Block</span>
                <span className="num">{gas.data?.block ?? "—"}</span>
              </div>
              <Link to="/tools/gas" className="block text-right text-xs text-primary hover:underline">
                Open gas tools →
              </Link>
            </QueryState>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Browse the terminal</h2>
            <p className="text-sm text-muted-foreground">
              Pick a hub to dive in. Each hub opens its own page with the related tools — nothing else clutters the screen.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hubs.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.id}
                to={s.landingPath}
                className="group flex h-full flex-col rounded-lg border border-border/60 bg-card p-4 transition hover:border-primary/40 hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-base font-semibold">{s.label}</div>
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{s.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.items.slice(0, 4).map((leaf) => (
                    <span
                      key={leaf.to}
                      className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {leaf.label}
                    </span>
                  ))}
                  {s.items.length > 4 ? (
                    <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                      +{s.items.length - 4}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

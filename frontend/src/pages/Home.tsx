import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Banknote, Coins, Flame, Newspaper, Network, Wallet } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/common/Sparkline";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useGasOracle, useMarketGlobal, useTopCoins } from "@/hooks/queries";
import { changeColor, formatCompact, formatCurrency, formatPct } from "@/lib/utils";

const QUICK_LINKS: { to: string; label: string; description: string; icon: typeof BarChart3 }[] = [
  { to: "/markets/overview", label: "Markets", description: "Market cap, dominance, top coins.", icon: BarChart3 },
  { to: "/tokens", label: "Tokens", description: "Sortable, filterable token universe.", icon: Coins },
  { to: "/defi/protocols", label: "DeFi Protocols", description: "TVL, categories, history.", icon: Banknote },
  { to: "/defi/yields", label: "Yields", description: "Live APYs across chains.", icon: BarChart3 },
  { to: "/chains", label: "Chains", description: "TVL ranking and details.", icon: Network },
  { to: "/tools/gas", label: "Gas", description: "Live gas tracker + cost estimator.", icon: Flame },
  { to: "/news", label: "News", description: "Latest crypto headlines.", icon: Newspaper },
  { to: "/wallet/overview", label: "My Wallet", description: "Connect to view holdings.", icon: Wallet },
];

export function HomePage() {
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

      <Card>
        <CardHeader>
          <CardTitle>Jump in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map(({ to, label, description, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-start gap-3 rounded-md border border-border/60 p-3 transition hover:border-primary/40 hover:bg-accent"
              >
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 font-medium">
                    {label}
                    <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

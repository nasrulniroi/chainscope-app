import { Link } from "react-router-dom";
import { useMemo } from "react";
import { Crown, TrendingDown, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useTopCoins, useTrending } from "@/hooks/queries";
import { changeColor, formatCurrency, formatPct } from "@/lib/utils";

export function MarketsTrendingPage() {
  const trending = useTrending();
  const top = useTopCoins({ perPage: 250 });

  const { gainers, losers } = useMemo(() => {
    const arr = (top.data?.coins ?? []).filter((c) => c.price_change_percentage_24h !== null);
    const sorted = [...arr].sort(
      (a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0),
    );
    return {
      gainers: sorted.slice(0, 12),
      losers: sorted.slice(-12).reverse(),
    };
  }, [top.data]);

  return (
    <div className="space-y-4">
      <PageHeader title="Trending" description="What everyone is searching for, plus the day's biggest movers." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-300" /> Trending searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState isLoading={trending.isLoading} error={trending.error}>
              <ul className="space-y-1.5">
                {(trending.data?.coins ?? []).map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/tokens/${c.id}`}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-accent"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <CoinThumb src={c.thumb} alt={c.symbol} size={20} />
                        <span className="truncate text-sm font-medium">{c.name}</span>
                        <span className="text-xs uppercase text-muted-foreground">{c.symbol}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">#{c.market_cap_rank ?? "-"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </QueryState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-300">
              <TrendingUp className="h-4 w-4" /> Top gainers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState isLoading={top.isLoading} error={top.error}>
              <ul className="space-y-1.5">
                {gainers.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <Link to={`/tokens/${c.id}`} className="flex items-center gap-2 hover:text-primary">
                      <CoinThumb src={c.image} alt={c.symbol} size={20} />
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs uppercase text-muted-foreground">{c.symbol}</span>
                    </Link>
                    <span className="num font-medium text-emerald-300">
                      {formatPct(c.price_change_percentage_24h)}
                    </span>
                  </li>
                ))}
              </ul>
            </QueryState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-300">
              <TrendingDown className="h-4 w-4" /> Top losers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState isLoading={top.isLoading} error={top.error}>
              <ul className="space-y-1.5">
                {losers.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <Link to={`/tokens/${c.id}`} className="flex items-center gap-2 hover:text-primary">
                      <CoinThumb src={c.image} alt={c.symbol} size={20} />
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs uppercase text-muted-foreground">{c.symbol}</span>
                    </Link>
                    <span className={`num font-medium ${changeColor(c.price_change_percentage_24h)}`}>
                      {formatPct(c.price_change_percentage_24h)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[11px] text-muted-foreground">
                Reference price: {formatCurrency(top.data?.coins[0]?.current_price)}
              </div>
            </QueryState>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

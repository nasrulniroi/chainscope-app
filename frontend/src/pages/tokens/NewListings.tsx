import { useMemo } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useTopCoins } from "@/hooks/queries";
import { changeColor, formatCompact, formatCurrency, formatPct } from "@/lib/utils";

export function TokensNewListingsPage() {
  const top = useTopCoins({ perPage: 250 });

  const newish = useMemo(() => {
    return [...(top.data?.coins ?? [])]
      .filter((c) => (c.market_cap_rank ?? 0) > 100)
      .sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0))
      .slice(0, 30);
  }, [top.data]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="New Listings"
        description="Mid-cap and emerging tokens ranked outside the top 100, sorted by market cap."
      />
      <QueryState isLoading={top.isLoading} error={top.error}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {newish.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <Link to={`/tokens/${c.id}`} className="flex items-center gap-2 hover:text-primary">
                  <CoinThumb src={c.image} alt={c.symbol} size={28} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="text-xs uppercase text-muted-foreground">{c.symbol}</div>
                  </div>
                </Link>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Price</div>
                    <div className="num font-medium">{formatCurrency(c.current_price)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">24h</div>
                    <div className={`num font-medium ${changeColor(c.price_change_percentage_24h)}`}>
                      {formatPct(c.price_change_percentage_24h)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Mcap</div>
                    <div className="num font-medium">{formatCompact(c.market_cap, "USD")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

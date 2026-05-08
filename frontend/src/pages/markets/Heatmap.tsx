import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { useTopCoins } from "@/hooks/queries";
import { changeColor, formatCompact, formatPct } from "@/lib/utils";

function tile(value: number | null) {
  if (value === null || value === undefined) return "bg-muted/30";
  if (value > 8) return "bg-emerald-500/60";
  if (value > 4) return "bg-emerald-500/40";
  if (value > 1) return "bg-emerald-500/20";
  if (value > -1) return "bg-muted/40";
  if (value > -4) return "bg-rose-500/20";
  if (value > -8) return "bg-rose-500/40";
  return "bg-rose-500/60";
}

export function MarketsHeatmapPage() {
  const top = useTopCoins({ perPage: 100 });
  const coins = top.data?.coins ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Top 100 Heatmap"
        description="24-hour percentage change across the top 100 by market cap. Click any cell for the token detail."
      />
      <QueryState isLoading={top.isLoading} error={top.error}>
        <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {coins.map((c) => (
            <Link
              key={c.id}
              to={`/tokens/${c.id}`}
              className={`flex flex-col items-stretch justify-between rounded-md border border-border/40 p-2 text-xs hover:border-primary/40 ${tile(c.price_change_percentage_24h)}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium uppercase">{c.symbol}</span>
                <span className="text-[10px] text-muted-foreground">#{c.market_cap_rank}</span>
              </div>
              <div className="num text-[11px]">{formatCompact(c.market_cap)}</div>
              <div className={`num text-[11px] font-medium ${changeColor(c.price_change_percentage_24h)}`}>
                {formatPct(c.price_change_percentage_24h)}
              </div>
            </Link>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

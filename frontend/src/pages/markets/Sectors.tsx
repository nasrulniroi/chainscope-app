import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCategories } from "@/hooks/queries";
import { changeColor, formatCompact, formatPct } from "@/lib/utils";

export function MarketsSectorsPage() {
  const cats = useCategories();
  const [filter, setFilter] = useState("");

  const list = useMemo(() => {
    const arr = cats.data?.categories ?? [];
    const q = filter.trim().toLowerCase();
    const filtered = q ? arr.filter((c) => c.name.toLowerCase().includes(q)) : arr;
    return [...filtered].sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0));
  }, [cats.data, filter]);

  return (
    <div className="space-y-4">
      <PageHeader title="Sectors / Categories" description="Crypto market sectors ranked by market cap." />
      <Input
        placeholder="Filter sectors…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-xs"
      />
      <QueryState isLoading={cats.isLoading} error={cats.error}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      24h Vol {formatCompact(c.volume_24h, "USD")}
                    </div>
                  </div>
                  <div className={`num text-xs font-medium ${changeColor(c.market_cap_change_24h)}`}>
                    {formatPct(c.market_cap_change_24h)}
                  </div>
                </div>
                <div className="num mt-2 text-lg font-semibold">{formatCompact(c.market_cap, "USD")}</div>
                <div className="mt-2 flex -space-x-2">
                  {(c.top_3_coins ?? []).slice(0, 3).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="h-5 w-5 rounded-full border border-border bg-card"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

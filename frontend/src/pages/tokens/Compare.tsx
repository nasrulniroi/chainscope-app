import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useTopCoins } from "@/hooks/queries";
import type { CoinSummary } from "@/types/api";
import { changeColor, formatCompact, formatCurrency, formatPct } from "@/lib/utils";

export function TokensComparePage() {
  const top = useTopCoins({ perPage: 250 });
  const [selected, setSelected] = useState<string[]>(["bitcoin", "ethereum"]);
  const [query, setQuery] = useState("");

  const universe = top.data?.coins ?? [];

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return universe
      .filter(
        (c) =>
          (c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)) &&
          !selected.includes(c.id),
      )
      .slice(0, 8);
  }, [universe, query, selected]);

  const rows: CoinSummary[] = selected
    .map((id) => universe.find((c) => c.id === id))
    .filter((c): c is CoinSummary => Boolean(c));

  function add(id: string) {
    if (selected.length >= 4) return;
    setSelected([...selected, id]);
    setQuery("");
  }

  function remove(id: string) {
    setSelected(selected.filter((x) => x !== id));
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Compare Tokens"
        description="Compare 2-4 tokens side by side. Pick by symbol or name."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => {
              const c = universe.find((x) => x.id === id);
              return (
                <Badge key={id} variant="secondary" className="gap-1 px-2 py-1 text-xs">
                  {c ? c.name : id}
                  <button onClick={() => remove(id)} aria-label={`Remove ${id}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            <span className="text-xs text-muted-foreground">{selected.length}/4</span>
          </div>
          {selected.length < 4 ? (
            <div className="space-y-2">
              <Input
                placeholder="Search by name or symbol…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="max-w-xs"
              />
              {query ? (
                <div className="flex flex-wrap gap-2">
                  {matches.map((c) => (
                    <Button
                      key={c.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => add(c.id)}
                    >
                      <CoinThumb src={c.image} alt={c.symbol} size={16} />
                      {c.name}
                    </Button>
                  ))}
                  {matches.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No matches in top 250.</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <QueryState isLoading={top.isLoading} error={top.error}>
        {rows.length < 2 ? (
          <p className="text-sm text-muted-foreground">Pick at least two tokens to compare.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {rows.map((c) => (
              <Card key={c.id}>
                <CardContent className="space-y-2 pt-4">
                  <Link to={`/tokens/${c.id}`} className="flex items-center gap-2 hover:text-primary">
                    <CoinThumb src={c.image} alt={c.symbol} size={28} />
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs uppercase text-muted-foreground">{c.symbol}</span>
                    <Plus className="ml-auto h-3 w-3 opacity-40" />
                  </Link>
                  <div className="num text-2xl font-semibold">{formatCurrency(c.current_price)}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Stat label="24h" value={formatPct(c.price_change_percentage_24h)} tone={changeColor(c.price_change_percentage_24h)} />
                    <Stat label="7d" value={formatPct(c.price_change_percentage_7d)} tone={changeColor(c.price_change_percentage_7d)} />
                    <Stat label="30d" value={formatPct(c.price_change_percentage_30d)} tone={changeColor(c.price_change_percentage_30d)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Stat label="Mcap" value={formatCompact(c.market_cap, "USD")} />
                    <Stat label="Vol 24h" value={formatCompact(c.total_volume, "USD")} />
                    <Stat label="ATH" value={formatCurrency(c.ath)} />
                    <Stat label="ATL" value={formatCurrency(c.atl)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className={`num font-medium ${tone ?? ""}`}>{value}</div>
    </div>
  );
}

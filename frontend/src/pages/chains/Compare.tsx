import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useChains } from "@/hooks/queries";
import { formatCompact } from "@/lib/utils";

export function ChainsComparePage() {
  const chains = useChains();
  const universe = chains.data?.chains ?? [];
  const [picked, setPicked] = useState<string[]>(["Ethereum", "Arbitrum"]);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return universe.filter((c) => c.name.toLowerCase().includes(q) && !picked.includes(c.name)).slice(0, 8);
  }, [universe, query, picked]);

  const rows = picked
    .map((name) => universe.find((c) => c.name === name))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Compare Chains"
        description="Pick up to 4 chains and compare their TVL side-by-side."
      />
      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex flex-wrap gap-2">
            {picked.map((p) => (
              <Badge key={p} variant="secondary" className="gap-1 px-2 py-1">
                {p}
                <button onClick={() => setPicked(picked.filter((x) => x !== p))} aria-label={`Remove ${p}`}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground">{picked.length}/4</span>
          </div>
          {picked.length < 4 ? (
            <div className="space-y-2">
              <Input
                placeholder="Search chains…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="max-w-xs"
              />
              {query ? (
                <div className="flex flex-wrap gap-2">
                  {matches.map((c) => (
                    <Button
                      key={c.name}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPicked([...picked, c.name]);
                        setQuery("");
                      }}
                    >
                      {c.name}
                    </Button>
                  ))}
                  {matches.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No matches.</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
      <QueryState isLoading={chains.isLoading} error={chains.error}>
        {rows.length < 2 ? (
          <p className="text-sm text-muted-foreground">Pick at least two chains to compare.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {rows.map((r) => (
              <Card key={r.name}>
                <CardContent className="space-y-2 pt-4">
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="num text-2xl font-semibold">{formatCompact(r.tvl, "USD")}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Native</div>
                      <div className="num">{r.tokenSymbol ?? "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Chain ID</div>
                      <div className="num">{r.chainId ?? "—"}</div>
                    </div>
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

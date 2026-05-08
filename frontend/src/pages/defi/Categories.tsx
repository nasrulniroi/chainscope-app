import { useMemo } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { useDefiProtocols } from "@/hooks/queries";
import { formatCompact } from "@/lib/utils";

export function DefiCategoriesPage() {
  const protocols = useDefiProtocols();
  const list = protocols.data?.protocols ?? [];
  const grouped = useMemo(() => {
    const map = new Map<string, { tvl: number; protocols: number }>();
    list.forEach((p) => {
      const cat = p.category ?? "Uncategorised";
      const entry = map.get(cat) ?? { tvl: 0, protocols: 0 };
      entry.tvl += p.tvl ?? 0;
      entry.protocols += 1;
      map.set(cat, entry);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.tvl - a.tvl);
  }, [list]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="DeFi Categories"
        description="Protocol counts and TVL per DefiLlama category."
      />
      <QueryState isLoading={protocols.isLoading} error={protocols.error}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((c) => (
            <Card key={c.name}>
              <CardContent className="pt-4">
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.protocols} protocols</div>
                <div className="num mt-2 text-lg font-semibold">{formatCompact(c.tvl, "USD")}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

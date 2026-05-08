import { useMemo } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useNftTrending } from "@/hooks/queries";
import { changeColor, formatPct } from "@/lib/utils";

export function NftFloorRadarPage() {
  const data = useNftTrending();
  const sorted = useMemo(() => {
    return [...(data.data?.collections ?? [])]
      .filter((c) => c.floor_change_24h !== null)
      .sort((a, b) => Math.abs(b.floor_change_24h ?? 0) - Math.abs(a.floor_change_24h ?? 0))
      .slice(0, 36);
  }, [data.data]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Floor Radar"
        description="NFT collections with the largest 24h floor moves, ranked by absolute change."
      />
      <QueryState isLoading={data.isLoading} error={data.error}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((c) => (
            <Card key={c.slug ?? c.name}>
              <CardContent className="flex items-center gap-3 pt-4">
                <CoinThumb src={c.image} alt={c.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Floor {c.floor_eth ? `${c.floor_eth.toFixed(3)} Ξ` : "—"}
                  </div>
                </div>
                <div className={`num text-sm font-semibold ${changeColor(c.floor_change_24h)}`}>
                  {formatPct(c.floor_change_24h)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

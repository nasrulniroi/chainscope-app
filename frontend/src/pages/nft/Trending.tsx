import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useNftTrending } from "@/hooks/queries";
import type { NftCollectionRow } from "@/types/api";
import { changeColor, formatCompact, formatPct } from "@/lib/utils";

export function NftTrendingPage() {
  const data = useNftTrending();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data.data?.collections ?? []).filter((c) => (q ? c.name.toLowerCase().includes(q) : true));
  }, [data.data, search]);

  const cols: Column<NftCollectionRow>[] = [
    {
      key: "name",
      label: "Collection",
      render: (r) => (
        <span className="flex items-center gap-2">
          <CoinThumb src={r.image} alt={r.name} size={28} />
          <span className="font-medium">{r.name}</span>
        </span>
      ),
      sortable: true,
      sortValue: (r) => r.name,
    },
    {
      key: "floor",
      label: "Floor",
      align: "right",
      render: (r) => <span className="num">{r.floor_eth ? `${r.floor_eth.toFixed(3)} Ξ` : "-"}</span>,
      sortable: true,
      sortValue: (r) => r.floor_eth ?? null,
    },
    {
      key: "vol1d",
      label: "Volume 24h",
      align: "right",
      render: (r) => <span className="num">{r.volume_eth ? `${formatCompact(r.volume_eth)} Ξ` : "-"}</span>,
      sortable: true,
      sortValue: (r) => r.volume_eth ?? null,
    },
    {
      key: "ch1",
      label: "1d %",
      align: "right",
      render: (r) => <span className={`num ${changeColor(r.floor_change_24h)}`}>{formatPct(r.floor_change_24h)}</span>,
      sortable: true,
      sortValue: (r) => r.floor_change_24h ?? null,
    },
    {
      key: "supply",
      label: "Supply",
      align: "right",
      render: (r) => <span className="num">{formatCompact(r.supply)}</span>,
      sortable: true,
      sortValue: (r) => r.supply ?? null,
    },
    {
      key: "owners",
      label: "Owners",
      align: "right",
      render: (r) => <span className="num">{formatCompact(r.owners)}</span>,
      sortable: true,
      sortValue: (r) => r.owners ?? null,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Trending NFTs"
        description="Top NFT collections by 24h volume, sourced from Reservoir."
        actions={
          <Input
            placeholder="Search collection…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        }
      />
      <QueryState isLoading={data.isLoading} error={data.error}>
        <DataTable
          data={filtered}
          columns={cols}
          rowKey={(r) => r.slug ?? r.name}
          initialSort={{ key: "vol1d", dir: "desc" }}
          pageSize={50}
        />
      </QueryState>
    </div>
  );
}

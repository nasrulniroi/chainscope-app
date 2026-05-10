import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { useChains } from "@/hooks/queries";
import type { ChainSummary } from "@/types/api";
import { formatCompact } from "@/lib/utils";

export function ChainsPage() {
  const chains = useChains();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (chains.data?.chains ?? []).filter((c) =>
      q ? c.name.toLowerCase().includes(q) || (c.tokenSymbol ?? "").toLowerCase().includes(q) : true,
    );
  }, [chains.data, search]);

  const cols: Column<ChainSummary>[] = [
    {
      key: "name",
      label: "Chain",
      render: (r) => (
        <Link to={`/chains/${encodeURIComponent(r.name)}`} className="font-medium hover:text-primary">
          {r.name}
        </Link>
      ),
      sortable: true,
      sortValue: (r) => r.name,
    },
    {
      key: "token",
      label: "Native",
      render: (r) => <span className="text-xs uppercase">{r.tokenSymbol ?? "-"}</span>,
    },
    {
      key: "tvl",
      label: "TVL",
      align: "right",
      render: (r) => <span className="num font-semibold">{formatCompact(r.tvl, "USD")}</span>,
      sortable: true,
      sortValue: (r) => r.tvl ?? null,
    },
    {
      key: "id",
      label: "Chain ID",
      align: "right",
      render: (r) => <span className="num text-xs text-muted-foreground">{r.chainId ?? "-"}</span>,
      sortable: true,
      sortValue: (r) => r.chainId ?? null,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Chains"
        description="Total value locked per chain, ranked by TVL."
        actions={
          <Input
            placeholder="Search chain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
        }
      />
      <QueryState isLoading={chains.isLoading} error={chains.error}>
        <DataTable
          data={filtered}
          columns={cols}
          rowKey={(r) => r.name}
          initialSort={{ key: "tvl", dir: "desc" }}
          pageSize={50}
        />
      </QueryState>
    </div>
  );
}

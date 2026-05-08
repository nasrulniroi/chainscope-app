import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDefiYields } from "@/hooks/queries";
import type { YieldPool } from "@/types/api";
import { formatCompact } from "@/lib/utils";

const LENDING_PROJECTS = new Set([
  "aave-v3",
  "aave-v2",
  "compound-v3",
  "compound-v2",
  "morpho-blue",
  "morpho-aave",
  "morpho-compound",
  "spark",
  "venus",
  "radiant-v2",
  "fluid-lending",
  "silo-finance",
  "euler-v2",
  "benqi-lending",
]);

export function DefiLendingPage() {
  const yields = useDefiYields();
  const [search, setSearch] = useState("");

  const lending = useMemo(() => {
    const all = yields.data?.pools ?? [];
    return all.filter((p) => LENDING_PROJECTS.has(p.project));
  }, [yields.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lending.filter((p) =>
      q ? p.symbol.toLowerCase().includes(q) || p.project.toLowerCase().includes(q) || p.chain.toLowerCase().includes(q) : true,
    );
  }, [lending, search]);

  const cols: Column<YieldPool>[] = [
    { key: "symbol", label: "Asset", render: (r) => <span className="font-medium">{r.symbol}</span>, sortable: true, sortValue: (r) => r.symbol },
    { key: "project", label: "Protocol", render: (r) => <Badge variant="outline">{r.project}</Badge>, sortable: true, sortValue: (r) => r.project },
    { key: "chain", label: "Chain", render: (r) => <span className="text-xs">{r.chain}</span>, sortable: true, sortValue: (r) => r.chain },
    { key: "tvl", label: "TVL", align: "right", render: (r) => <span className="num">{formatCompact(r.tvlUsd, "USD")}</span>, sortable: true, sortValue: (r) => r.tvlUsd ?? null },
    {
      key: "apy",
      label: "Supply APY",
      align: "right",
      render: (r) => (
        <span className="num font-semibold text-emerald-300">{r.apy === null ? "—" : `${r.apy.toFixed(2)}%`}</span>
      ),
      sortable: true,
      sortValue: (r) => r.apy ?? null,
    },
    {
      key: "exposure",
      label: "Exposure",
      render: (r) => <span className="text-xs uppercase text-muted-foreground">{r.exposure ?? "—"}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lending Markets"
        description="Compare supply APYs on Aave, Compound, Morpho, Spark, Euler and more."
        actions={
          <Input
            placeholder="Search asset, chain, protocol…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72"
          />
        }
      />
      <QueryState isLoading={yields.isLoading} error={yields.error}>
        <DataTable
          data={filtered}
          columns={cols}
          rowKey={(r) => r.pool}
          initialSort={{ key: "apy", dir: "desc" }}
          pageSize={50}
          emptyMessage="No lending pools matched your filters."
        />
      </QueryState>
    </div>
  );
}

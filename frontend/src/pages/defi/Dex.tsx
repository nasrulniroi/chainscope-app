import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDefiDex } from "@/hooks/queries";
import type { DexSummary } from "@/types/api";
import { changeColor, formatCompact, formatPct } from "@/lib/utils";

export function DefiDexPage() {
  const dex = useDefiDex();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (dex.data?.dexs ?? []).filter((d) =>
      q ? d.name.toLowerCase().includes(q) || d.chains.some((c) => c.toLowerCase().includes(q)) : true,
    );
  }, [dex.data, search]);

  const cols: Column<DexSummary>[] = [
    { key: "name", label: "DEX", render: (r) => <span className="font-medium">{r.name}</span>, sortable: true, sortValue: (r) => r.name },
    { key: "vol1d", label: "Volume 24h", align: "right", render: (r) => <span className="num">{formatCompact(r.total24h, "USD")}</span>, sortable: true, sortValue: (r) => r.total24h ?? null },
    { key: "vol7d", label: "Volume 7d", align: "right", render: (r) => <span className="num">{formatCompact(r.total7d, "USD")}</span>, sortable: true, sortValue: (r) => r.total7d ?? null },
    {
      key: "ch1",
      label: "1d %",
      align: "right",
      render: (r) => <span className={`num ${changeColor(r.change_1d)}`}>{formatPct(r.change_1d)}</span>,
      sortable: true,
      sortValue: (r) => r.change_1d ?? null,
    },
    {
      key: "chains",
      label: "Chains",
      render: (r) => (
        <span className="flex flex-wrap gap-1">
          {(r.chains ?? []).slice(0, 4).map((c) => (
            <Badge key={c} variant="secondary" className="text-[10px]">
              {c}
            </Badge>
          ))}
          {(r.chains ?? []).length > 4 ? <span className="text-[10px]">+{(r.chains ?? []).length - 4}</span> : null}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="DEX Volume"
        description="Decentralized exchange volume rankings, sourced from DefiLlama."
        actions={
          <Input
            placeholder="Search DEX or chain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        }
      />
      <QueryState isLoading={dex.isLoading} error={dex.error}>
        <DataTable
          data={filtered}
          columns={cols}
          rowKey={(r) => r.name}
          initialSort={{ key: "vol1d", dir: "desc" }}
          pageSize={50}
        />
      </QueryState>
    </div>
  );
}

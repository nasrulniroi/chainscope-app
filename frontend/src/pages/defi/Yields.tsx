import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDefiYields } from "@/hooks/queries";
import type { YieldPool } from "@/types/api";
import { formatCompact } from "@/lib/utils";

export function DefiYieldsPage() {
  const yields = useDefiYields();
  const pools = yields.data?.pools ?? [];
  const [chain, setChain] = useState("all");
  const [project, setProject] = useState("all");
  const [search, setSearch] = useState("");
  const [stableOnly, setStableOnly] = useState(false);

  const chains = useMemo(() => ["all", ...Array.from(new Set(pools.map((p) => p.chain))).sort()], [pools]);
  const projects = useMemo(() => ["all", ...Array.from(new Set(pools.map((p) => p.project))).sort()], [pools]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pools
      .filter((p) => (chain === "all" ? true : p.chain === chain))
      .filter((p) => (project === "all" ? true : p.project === project))
      .filter((p) => (stableOnly ? p.stable : true))
      .filter((p) => (q ? p.symbol.toLowerCase().includes(q) || p.project.toLowerCase().includes(q) : true));
  }, [pools, chain, project, search, stableOnly]);

  const cols: Column<YieldPool>[] = [
    {
      key: "symbol",
      label: "Pool",
      render: (r) => (
        <Link to={`/defi/yields/${r.pool}`} className="flex flex-col hover:text-primary">
          <span className="font-medium">{r.symbol}</span>
          <span className="text-[10px] text-muted-foreground">{r.project}</span>
        </Link>
      ),
      sortable: true,
      sortValue: (r) => r.symbol,
    },
    {
      key: "chain",
      label: "Chain",
      render: (r) => <Badge variant="outline">{r.chain}</Badge>,
      sortable: true,
      sortValue: (r) => r.chain,
    },
    {
      key: "tvl",
      label: "TVL",
      align: "right",
      render: (r) => <span className="num">{formatCompact(r.tvlUsd, "USD")}</span>,
      sortable: true,
      sortValue: (r) => r.tvlUsd ?? null,
    },
    {
      key: "apy",
      label: "APY",
      align: "right",
      render: (r) =>
        r.apy === null ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <span className="num font-semibold text-emerald-300">{r.apy.toFixed(2)}%</span>
        ),
      sortable: true,
      sortValue: (r) => r.apy ?? null,
    },
    {
      key: "apyBase",
      label: "Base",
      align: "right",
      render: (r) => (
        <span className="num text-xs">{r.apyBase === null ? "—" : `${r.apyBase.toFixed(2)}%`}</span>
      ),
      sortable: true,
      sortValue: (r) => r.apyBase ?? null,
    },
    {
      key: "apyReward",
      label: "Reward",
      align: "right",
      render: (r) => (
        <span className="num text-xs">{r.apyReward === null ? "—" : `${r.apyReward.toFixed(2)}%`}</span>
      ),
      sortable: true,
      sortValue: (r) => r.apyReward ?? null,
    },
    {
      key: "exposure",
      label: "Exposure",
      render: (r) => <span className="text-xs uppercase text-muted-foreground">{r.exposure ?? "—"}</span>,
    },
    {
      key: "stable",
      label: "Stable",
      align: "center",
      render: (r) =>
        r.stable ? (
          <Badge variant="success">stable</Badge>
        ) : (
          <span className="text-[10px] text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Yields"
        description="Live APYs across DeFi protocols and chains, sourced from DefiLlama."
        actions={
          <Input
            placeholder="Search symbol or project…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        }
      />
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground">Chain</span>
        <Select value={chain} onValueChange={setChain}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {chains.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All chains" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">Project</span>
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="h-8 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {projects.map((p) => (
              <SelectItem key={p} value={p}>
                {p === "all" ? "All projects" : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2">
          <Switch checked={stableOnly} onCheckedChange={setStableOnly} />
          <span>Stablecoin pools only</span>
        </label>
        <span className="text-muted-foreground">{filtered.length} pools</span>
      </div>
      <QueryState isLoading={yields.isLoading} error={yields.error}>
        <DataTable
          data={filtered}
          columns={cols}
          rowKey={(r) => r.pool}
          initialSort={{ key: "apy", dir: "desc" }}
          pageSize={50}
        />
      </QueryState>
    </div>
  );
}

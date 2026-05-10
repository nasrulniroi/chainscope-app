import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useDefiProtocols } from "@/hooks/queries";
import type { ProtocolSummary } from "@/types/api";
import { changeColor, formatCompact, formatPct } from "@/lib/utils";

export function DefiProtocolsPage() {
  const protocols = useDefiProtocols();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [chain, setChain] = useState("all");

  const list = protocols.data?.protocols ?? [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    list.forEach((p) => p.category && set.add(p.category));
    return ["all", ...Array.from(set).sort()];
  }, [list]);
  const chains = useMemo(() => {
    const set = new Set<string>();
    list.forEach((p) => p.chain && set.add(p.chain));
    return ["all", ...Array.from(set).sort()];
  }, [list]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list
      .filter((p) => (category === "all" ? true : p.category === category))
      .filter((p) => (chain === "all" ? true : p.chain === chain))
      .filter((p) =>
        q
          ? p.name.toLowerCase().includes(q) ||
            (p.symbol ?? "").toLowerCase().includes(q) ||
            (p.slug ?? "").toLowerCase().includes(q)
          : true,
      );
  }, [list, search, category, chain]);

  const cols: Column<ProtocolSummary>[] = [
    {
      key: "name",
      label: "Protocol",
      render: (r) => (
        <Link to={`/defi/protocols/${r.slug}`} className="flex items-center gap-2 hover:text-primary">
          <CoinThumb src={r.logo} alt={r.name} size={20} />
          <span className="font-medium">{r.name}</span>
          {r.symbol ? (
            <span className="text-xs uppercase text-muted-foreground">{r.symbol}</span>
          ) : null}
        </Link>
      ),
      sortable: true,
      sortValue: (r) => r.name,
    },
    {
      key: "category",
      label: "Category",
      render: (r) => (r.category ? <Badge variant="outline">{r.category}</Badge> : <span className="text-xs text-muted-foreground">-</span>),
      sortable: true,
      sortValue: (r) => r.category ?? "",
    },
    {
      key: "chain",
      label: "Chain",
      render: (r) => <span className="text-xs">{r.chain ?? "-"}</span>,
      sortable: true,
      sortValue: (r) => r.chain ?? "",
    },
    {
      key: "tvl",
      label: "TVL",
      align: "right",
      render: (r) => <span className="num font-medium">{formatCompact(r.tvl, "USD")}</span>,
      sortable: true,
      sortValue: (r) => r.tvl ?? null,
    },
    {
      key: "ch1",
      label: "1d",
      align: "right",
      render: (r) => <span className={`num ${changeColor(r.change_1d)}`}>{formatPct(r.change_1d)}</span>,
      sortable: true,
      sortValue: (r) => r.change_1d ?? null,
    },
    {
      key: "ch7",
      label: "7d",
      align: "right",
      render: (r) => <span className={`num ${changeColor(r.change_7d)}`}>{formatPct(r.change_7d)}</span>,
      sortable: true,
      sortValue: (r) => r.change_7d ?? null,
    },
    {
      key: "mcap",
      label: "Mcap",
      align: "right",
      render: (r) => <span className="num">{formatCompact(r.mcap, "USD")}</span>,
      sortable: true,
      sortValue: (r) => r.mcap ?? null,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="DeFi Protocols"
        description="Live TVL across hundreds of protocols, sourced from DefiLlama."
        actions={
          <Input
            placeholder="Search protocols…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect label="Category" value={category} onChange={setCategory} options={categories} />
        <FilterSelect label="Chain" value={chain} onChange={setChain} options={chains} />
        <span className="text-xs text-muted-foreground">{filtered.length} protocols</span>
      </div>
      <QueryState isLoading={protocols.isLoading} error={protocols.error}>
        <DataTable
          data={filtered}
          columns={cols}
          rowKey={(r) => r.slug ?? r.name}
          initialSort={{ key: "tvl", dir: "desc" }}
          pageSize={50}
        />
      </QueryState>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o === "all" ? "All" : o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

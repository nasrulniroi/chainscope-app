import { useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { MetricCard } from "@/components/common/MetricCard";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { useStablecoins } from "@/hooks/queries";
import type { StablecoinEntry } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { formatCompact, formatCurrency } from "@/lib/utils";

export function MarketsStablecoinsPage() {
  const stables = useStablecoins();
  const list = stables.data?.stablecoins ?? [];

  const totals = useMemo(() => {
    const total = list.reduce((sum, s) => sum + (s.circulating ?? 0), 0);
    const top = list[0];
    const peggedFiat = list.filter((s) => (s.pegType ?? "").toLowerCase().includes("usd"));
    return {
      total,
      topName: top?.name ?? "—",
      topShare: top && total ? ((top.circulating ?? 0) / total) * 100 : null,
      usdShare: total ? (peggedFiat.reduce((s, x) => s + (x.circulating ?? 0), 0) / total) * 100 : null,
    };
  }, [list]);

  const columns: Column<StablecoinEntry>[] = [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span>, sortable: true, sortValue: (r) => r.name },
    { key: "symbol", label: "Symbol", render: (r) => <span className="text-xs uppercase text-muted-foreground">{r.symbol}</span> },
    {
      key: "pegType",
      label: "Peg",
      render: (r) => (
        <span className="flex items-center gap-1">
          <Badge variant="outline">{r.pegType ?? "—"}</Badge>
          <span className="text-[10px] text-muted-foreground">{r.pegMechanism ?? ""}</span>
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      render: (r) => <span className="num">{formatCurrency(r.price)}</span>,
      sortable: true,
      sortValue: (r) => r.price ?? null,
    },
    {
      key: "circulating",
      label: "Circulating",
      align: "right",
      render: (r) => <span className="num">{formatCompact(r.circulating, "USD")}</span>,
      sortable: true,
      sortValue: (r) => r.circulating ?? null,
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
          {(r.chains ?? []).length > 4 ? (
            <span className="text-[10px] text-muted-foreground">+{(r.chains ?? []).length - 4}</span>
          ) : null}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Stablecoins" description="Supply, peg deviation, and chain coverage across major stablecoins." />
      <QueryState isLoading={stables.isLoading} error={stables.error}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard label="Total Stablecoin Mcap" value={formatCompact(totals.total, "USD")} />
          <MetricCard
            label="Largest Issuer"
            value={totals.topName}
            hint={totals.topShare !== null ? `${totals.topShare.toFixed(1)}% share` : ""}
          />
          <MetricCard
            label="USD-pegged share"
            value={totals.usdShare !== null ? `${totals.usdShare.toFixed(1)}%` : "—"}
            hint="Across all listed assets"
          />
        </div>
        <DataTable
          data={list}
          columns={columns}
          rowKey={(r) => String(r.id)}
          initialSort={{ key: "circulating", dir: "desc" }}
          pageSize={50}
        />
      </QueryState>
    </div>
  );
}

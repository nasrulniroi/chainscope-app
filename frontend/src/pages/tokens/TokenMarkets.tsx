import { Link, useParams } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { useCoinDetail } from "@/hooks/queries";
import { formatCompact, formatCurrency } from "@/lib/utils";

interface MarketRow {
  exchange: string | null;
  exchange_id: string | null;
  pair: string;
  price: number | null;
  volume: number | null;
  trust_score: string | null;
  url: string | null;
}

export function TokenMarketsPage() {
  const { id } = useParams<{ id: string }>();
  const detail = useCoinDetail(id);
  const rows: MarketRow[] = detail.data?.tickers ?? [];

  const cols: Column<MarketRow>[] = [
    { key: "exchange", label: "Exchange", render: (r) => <span className="font-medium">{r.exchange ?? "-"}</span>, sortable: true, sortValue: (r) => r.exchange ?? "" },
    { key: "pair", label: "Pair", render: (r) => <span className="text-xs text-muted-foreground">{r.pair}</span> },
    { key: "price", label: "Price", align: "right", render: (r) => <span className="num">{formatCurrency(r.price)}</span>, sortable: true, sortValue: (r) => r.price ?? null },
    { key: "volume", label: "Volume", align: "right", render: (r) => <span className="num">{formatCompact(r.volume, "USD")}</span>, sortable: true, sortValue: (r) => r.volume ?? null },
    {
      key: "trust",
      label: "Trust",
      render: (r) =>
        r.trust_score ? (
          <Badge variant={r.trust_score === "green" ? "success" : r.trust_score === "yellow" ? "warning" : "destructive"}>
            {r.trust_score}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
    {
      key: "link",
      label: "",
      align: "right",
      render: (r) =>
        r.url ? (
          <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
            Trade →
          </a>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${detail.data?.name ?? id} markets`}
        description="Top exchanges and pairs ranked by 24h volume."
        actions={
          <Link to={`/tokens/${id}`} className="text-xs text-primary hover:underline">
            ← Back to detail
          </Link>
        }
      />
      <QueryState isLoading={detail.isLoading} error={detail.error}>
        <DataTable
          data={rows}
          columns={cols}
          rowKey={(r, i) => `${r.exchange_id ?? r.exchange ?? ""}-${r.pair}-${i}`}
          initialSort={{ key: "volume", dir: "desc" }}
          pageSize={25}
          emptyMessage="No exchanges reported for this token."
        />
      </QueryState>
    </div>
  );
}

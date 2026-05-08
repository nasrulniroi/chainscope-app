import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Input } from "@/components/ui/input";
import { Sparkline } from "@/components/common/Sparkline";
import { CoinThumb } from "@/components/common/CoinThumb";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { useTopCoins } from "@/hooks/queries";
import type { CoinSummary } from "@/types/api";
import { changeColor, formatCompact, formatCurrency, formatPct } from "@/lib/utils";

export function TokensPage() {
  const [filter, setFilter] = useState("");
  const top = useTopCoins({ perPage: 250 });
  const coins = top.data?.coins ?? [];

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter(
      (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
    );
  }, [coins, filter]);

  const columns: Column<CoinSummary>[] = [
    {
      key: "rank",
      label: "#",
      render: (r) => <span className="num text-muted-foreground">{r.market_cap_rank ?? "—"}</span>,
      sortable: true,
      sortValue: (r) => r.market_cap_rank ?? 9999,
    },
    {
      key: "name",
      label: "Coin",
      render: (r) => (
        <Link to={`/tokens/${r.id}`} className="flex items-center gap-2 hover:text-primary">
          <CoinThumb src={r.image} alt={r.symbol} size={22} />
          <span className="font-medium">{r.name}</span>
          <span className="text-xs uppercase text-muted-foreground">{r.symbol}</span>
        </Link>
      ),
      sortable: true,
      sortValue: (r) => r.name,
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      render: (r) => <span className="num">{formatCurrency(r.current_price)}</span>,
      sortable: true,
      sortValue: (r) => r.current_price ?? null,
    },
    {
      key: "ch24",
      label: "24h",
      align: "right",
      render: (r) => (
        <span className={`num ${changeColor(r.price_change_percentage_24h)}`}>
          {formatPct(r.price_change_percentage_24h)}
        </span>
      ),
      sortable: true,
      sortValue: (r) => r.price_change_percentage_24h ?? null,
    },
    {
      key: "ch7",
      label: "7d",
      align: "right",
      render: (r) => (
        <span className={`num ${changeColor(r.price_change_percentage_7d)}`}>
          {formatPct(r.price_change_percentage_7d)}
        </span>
      ),
      sortable: true,
      sortValue: (r) => r.price_change_percentage_7d ?? null,
    },
    {
      key: "mcap",
      label: "Mcap",
      align: "right",
      render: (r) => <span className="num">{formatCompact(r.market_cap, "USD")}</span>,
      sortable: true,
      sortValue: (r) => r.market_cap ?? null,
    },
    {
      key: "vol",
      label: "Volume 24h",
      align: "right",
      render: (r) => <span className="num">{formatCompact(r.total_volume, "USD")}</span>,
      sortable: true,
      sortValue: (r) => r.total_volume ?? null,
    },
    {
      key: "supply",
      label: "Circulating",
      align: "right",
      render: (r) => <span className="num">{formatCompact(r.circulating_supply)}</span>,
      sortable: true,
      sortValue: (r) => r.circulating_supply ?? null,
    },
    {
      key: "spark",
      label: "7d",
      align: "right",
      render: (r) => (
        <Sparkline
          data={r.sparkline_7d}
          positive={(r.price_change_percentage_24h ?? 0) >= 0}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tokens"
        description="Sortable, searchable, filterable list of the top 250 tokens by market cap."
        actions={
          <Input
            placeholder="Search name or symbol…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-72"
          />
        }
      />
      <QueryState isLoading={top.isLoading} error={top.error}>
        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(r) => r.id}
          initialSort={{ key: "mcap", dir: "desc" }}
          pageSize={50}
        />
      </QueryState>
    </div>
  );
}

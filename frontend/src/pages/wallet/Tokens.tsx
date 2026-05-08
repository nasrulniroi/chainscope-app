import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { CoinThumb } from "@/components/common/CoinThumb";
import { RequireWallet } from "@/components/wallet/RequireWallet";
import { useEthWallet } from "@/hooks/queries";
import { formatCurrency } from "@/lib/utils";

interface Row {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: number | null;
  price: number | null;
  value: number | null;
  image: string | null;
}

export function WalletTokensPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Wallet Tokens" description="Multichain ERC-20 holdings (Ethereum mainnet via Ethplorer free tier)." />
      <RequireWallet>{(address) => <Inner address={address} />}</RequireWallet>
    </div>
  );
}

function Inner({ address }: { address: `0x${string}` }) {
  const wallet = useEthWallet(address);
  const [search, setSearch] = useState("");

  const data: Row[] = useMemo(() => wallet.data?.tokens ?? [], [wallet.data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((r) =>
      q ? r.symbol.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) : true,
    );
  }, [data, search]);

  const cols: Column<Row>[] = [
    {
      key: "symbol",
      label: "Token",
      render: (r) => (
        <span className="flex items-center gap-2">
          <CoinThumb src={r.image} alt={r.symbol} size={20} />
          <span className="font-medium">{r.name}</span>
          <span className="text-xs uppercase text-muted-foreground">{r.symbol}</span>
        </span>
      ),
      sortable: true,
      sortValue: (r) => r.name,
    },
    { key: "balance", label: "Balance", align: "right", render: (r) => <span className="num">{(r.balance ?? 0).toFixed(4)}</span>, sortable: true, sortValue: (r) => r.balance ?? null },
    { key: "price", label: "Price", align: "right", render: (r) => <span className="num">{formatCurrency(r.price)}</span>, sortable: true, sortValue: (r) => r.price ?? null },
    { key: "value", label: "Value", align: "right", render: (r) => <span className="num font-medium">{formatCurrency(r.value)}</span>, sortable: true, sortValue: (r) => r.value ?? null },
  ];

  return (
    <QueryState isLoading={wallet.isLoading} error={wallet.error} isEmpty={filtered.length === 0} emptyMessage="No ERC-20 tokens found on Ethereum mainnet.">
      <div className="flex items-center justify-between">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter tokens…" className="w-64" />
        <span className="text-xs text-muted-foreground">{filtered.length} tokens</span>
      </div>
      <DataTable
        data={filtered}
        columns={cols}
        rowKey={(r) => r.address}
        initialSort={{ key: "value", dir: "desc" }}
        pageSize={50}
      />
    </QueryState>
  );
}

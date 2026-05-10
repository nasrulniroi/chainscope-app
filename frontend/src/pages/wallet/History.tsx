import { useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { DataTable } from "@/components/common/DataTable";
import type { Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequireWallet } from "@/components/wallet/RequireWallet";
import { useWalletHistory } from "@/hooks/queries";
import { shortAddress, timeAgo } from "@/lib/utils";

const CHAINS = [
  { id: 1, label: "Ethereum" },
  { id: 10, label: "Optimism" },
  { id: 42161, label: "Arbitrum" },
  { id: 137, label: "Polygon" },
  { id: 8453, label: "Base" },
  { id: 56, label: "BNB" },
];

interface Tx {
  hash: string;
  from: string;
  to: string;
  value_eth: number | null;
  block: string;
  ts: number;
  is_error: boolean;
  method: string | null;
  kind: string;
  gas_used: number | null;
}

const KIND_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "outline" | "warning"> = {
  swap: "warning",
  approve: "warning",
  transfer: "outline",
  "erc20-transfer": "secondary",
  mint: "success",
  contract: "outline",
};

export function WalletHistoryPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Transaction history" description="Last 50 transactions for this wallet on the selected chain." />
      <RequireWallet>{(address) => <Inner address={address} />}</RequireWallet>
    </div>
  );
}

function Inner({ address }: { address: `0x${string}` }) {
  const [chainId, setChainId] = useState(1);
  const history = useWalletHistory(address, chainId);
  const txs: Tx[] = history.data?.txs ?? [];

  const cols: Column<Tx>[] = [
    {
      key: "kind",
      label: "Type",
      render: (r) => <Badge variant={KIND_VARIANT[r.kind] ?? "outline"}>{r.kind}</Badge>,
    },
    {
      key: "hash",
      label: "Hash",
      render: (r) => (
        <a
          href={`https://etherscan.io/tx/${r.hash}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-primary hover:underline"
        >
          {shortAddress(r.hash)}
        </a>
      ),
    },
    { key: "from", label: "From", render: (r) => <span className="font-mono text-xs">{shortAddress(r.from)}</span> },
    { key: "to", label: "To", render: (r) => <span className="font-mono text-xs">{shortAddress(r.to ?? "")}</span> },
    {
      key: "value",
      label: "Value (native)",
      align: "right",
      render: (r) => <span className="num">{r.value_eth?.toFixed(4) ?? "-"}</span>,
      sortable: true,
      sortValue: (r) => r.value_eth ?? null,
    },
    { key: "ts", label: "When", render: (r) => <span className="text-xs text-muted-foreground">{timeAgo(r.ts * 1000)}</span> },
    {
      key: "status",
      label: "Status",
      render: (r) =>
        r.is_error ? (
          <Badge variant="destructive">failed</Badge>
        ) : (
          <span className="text-xs text-emerald-300">ok</span>
        ),
    },
  ];

  return (
    <QueryState
      isLoading={history.isLoading}
      error={history.error}
      isEmpty={txs.length === 0}
      emptyMessage={history.data?.error ?? "No transactions found on this chain yet."}
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Chain</span>
        <Select value={String(chainId)} onValueChange={(v) => setChainId(Number(v))}>
          <SelectTrigger className="h-8 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHAINS.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">{txs.length} txs</span>
      </div>
      <DataTable data={txs} columns={cols} rowKey={(r) => r.hash} initialSort={{ key: "value", dir: "desc" }} pageSize={50} />
    </QueryState>
  );
}

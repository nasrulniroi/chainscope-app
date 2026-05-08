import { useMemo } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoinThumb } from "@/components/common/CoinThumb";
import { RequireWallet } from "@/components/wallet/RequireWallet";
import { useEthWallet, useTopCoins } from "@/hooks/queries";
import { changeColor, formatCurrency, formatPct } from "@/lib/utils";

export function WalletPnlPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="PnL Estimator"
        description="Approximate unrealised PnL using current 24h price change as proxy. Connect wallet for token balances."
      />
      <RequireWallet>{(address) => <Inner address={address} />}</RequireWallet>
    </div>
  );
}

function Inner({ address }: { address: `0x${string}` }) {
  const wallet = useEthWallet(address);
  const top = useTopCoins({ perPage: 250 });

  const rows = useMemo(() => {
    const tokens = wallet.data?.tokens ?? [];
    const eth = wallet.data?.eth ?? null;
    const universe = top.data?.coins ?? [];
    const symbolMap = new Map(universe.map((c) => [c.symbol.toLowerCase(), c]));
    const items = tokens.map((t) => ({
      symbol: t.symbol,
      name: t.name,
      balance: t.balance ?? 0,
      value: t.value ?? 0,
      change: symbolMap.get((t.symbol ?? "").toLowerCase())?.price_change_percentage_24h ?? null,
    }));
    if (eth && eth.value) {
      items.unshift({
        symbol: "ETH",
        name: "Ether",
        balance: eth.balance ?? 0,
        value: eth.value,
        change: symbolMap.get("eth")?.price_change_percentage_24h ?? null,
      });
    }
    return items.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  }, [wallet.data, top.data]);

  const totalValue = rows.reduce((s, r) => s + (r.value ?? 0), 0);
  const totalPnl = rows.reduce((s, r) => s + (r.value ?? 0) * ((r.change ?? 0) / 100), 0);
  const totalPct = totalValue ? (totalPnl / totalValue) * 100 : 0;

  return (
    <QueryState
      isLoading={wallet.isLoading || top.isLoading}
      error={wallet.error ?? top.error}
      isEmpty={rows.length === 0}
      emptyMessage="No priced positions to estimate PnL from."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs uppercase text-muted-foreground">Portfolio value</div>
            <div className="num text-xl font-semibold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs uppercase text-muted-foreground">24h PnL (estimated)</div>
            <div className={`num text-xl font-semibold ${changeColor(totalPnl)}`}>{formatCurrency(totalPnl)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs uppercase text-muted-foreground">24h change</div>
            <div className={`num text-xl font-semibold ${changeColor(totalPct)}`}>{formatPct(totalPct)}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Per-token estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Token</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-right">24h %</th>
                  <th className="px-3 py-2 text-right">PnL est.</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 30).map((r, i) => {
                  const pnl = (r.value ?? 0) * ((r.change ?? 0) / 100);
                  return (
                    <tr key={`${r.symbol}-${i}`} className="border-t border-border/60">
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-2">
                          <CoinThumb src={null} alt={r.symbol} size={18} />
                          <span className="font-medium">{r.symbol}</span>
                          <Badge variant="outline" className="text-[10px]">{r.name}</Badge>
                        </span>
                      </td>
                      <td className="num px-3 py-2 text-right">{(r.balance ?? 0).toFixed(4)}</td>
                      <td className="num px-3 py-2 text-right">{formatCurrency(r.value)}</td>
                      <td className={`num px-3 py-2 text-right ${changeColor(r.change)}`}>{formatPct(r.change)}</td>
                      <td className={`num px-3 py-2 text-right ${changeColor(pnl)}`}>{formatCurrency(pnl)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </QueryState>
  );
}

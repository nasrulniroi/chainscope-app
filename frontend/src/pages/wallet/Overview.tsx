import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/common/MetricCard";
import { CoinThumb } from "@/components/common/CoinThumb";
import { RequireWallet } from "@/components/wallet/RequireWallet";
import { useEthWallet } from "@/hooks/queries";
import { formatCompact, formatCurrency, shortAddress } from "@/lib/utils";

const COLORS = ["#22d3ee", "#a78bfa", "#22c55e", "#f97316", "#f43f5e", "#facc15", "#60a5fa"];

export function WalletOverviewPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="My Wallet"
        description="Aggregate value across major chains. Connect a wallet to begin."
      />
      <RequireWallet>
        {(address) => <WalletOverviewInner address={address} />}
      </RequireWallet>
    </div>
  );
}

function WalletOverviewInner({ address }: { address: `0x${string}` }) {
  const wallet = useEthWallet(address);
  const tokens = wallet.data?.tokens ?? [];
  const totalValue = (wallet.data?.eth.value ?? 0) + tokens.reduce((s, t) => s + (t.value ?? 0), 0);

  const allocation = [
    { name: "ETH", value: wallet.data?.eth.value ?? 0 },
    ...tokens
      .filter((t) => (t.value ?? 0) > 0)
      .slice(0, 8)
      .map((t) => ({ name: t.symbol, value: t.value ?? 0 })),
  ].filter((a) => a.value > 0);

  return (
    <QueryState isLoading={wallet.isLoading} error={wallet.error}>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <MetricCard label="Address" value={<span className="num text-base">{shortAddress(address)}</span>} hint="Read-only" />
        <MetricCard label="Total value (ETH chain)" value={formatCurrency(totalValue)} />
        <MetricCard
          label="ETH balance"
          value={`${(wallet.data?.eth.balance ?? 0).toFixed(4)} ETH`}
          hint={formatCurrency(wallet.data?.eth.value)}
        />
        <MetricCard label="ERC-20 tokens" value={tokens.length.toString()} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Token</th>
                    <th className="px-3 py-2 text-right">Balance</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="px-3 py-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/60">
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2 font-medium">
                        <CoinThumb src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="ETH" size={20} />
                        Ether
                      </span>
                    </td>
                    <td className="num px-3 py-2 text-right">{(wallet.data?.eth.balance ?? 0).toFixed(4)}</td>
                    <td className="num px-3 py-2 text-right">{formatCurrency(wallet.data?.eth.price)}</td>
                    <td className="num px-3 py-2 text-right">{formatCurrency(wallet.data?.eth.value)}</td>
                  </tr>
                  {tokens.slice(0, 12).map((t) => (
                    <tr key={t.address} className="border-t border-border/60">
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-2">
                          <CoinThumb src={t.image} alt={t.symbol ?? "?"} size={20} />
                          <span className="font-medium">{t.name}</span>
                          <span className="text-xs uppercase text-muted-foreground">{t.symbol}</span>
                        </span>
                      </td>
                      <td className="num px-3 py-2 text-right">{(t.balance ?? 0).toFixed(4)}</td>
                      <td className="num px-3 py-2 text-right">{formatCurrency(t.price)}</td>
                      <td className="num px-3 py-2 text-right">{formatCurrency(t.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {allocation.length === 0 ? (
              <p className="text-sm text-muted-foreground">No priced tokens to chart.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={40} outerRadius={75}>
                      {allocation.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0b0f17", border: "1px solid #1f2937" }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Top {allocation.length} positions, valued at {formatCompact(totalValue, "USD")}.
            </p>
          </CardContent>
        </Card>
      </div>
    </QueryState>
  );
}

import { useState } from "react";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CoinThumb } from "@/components/common/CoinThumb";
import { Badge } from "@/components/ui/badge";
import { useEthWallet, useWalletHistory } from "@/hooks/queries";
import { formatCurrency, shortAddress, timeAgo } from "@/lib/utils";

export function OnchainWalletLookupPage() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const wallet = useEthWallet(submitted ?? undefined);
  const history = useWalletHistory(submitted ?? undefined, 1);

  const ok = input.trim().match(/^0x[0-9a-fA-F]{40}$/);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Wallet Lookup"
        description="Enter any Ethereum address to view balances and recent transactions. Read-only - no signing."
      />
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
          <div className="min-w-[280px] flex-1">
            <label className="text-xs text-muted-foreground">Ethereum address</label>
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="0x…" />
          </div>
          <Button
            type="button"
            disabled={!ok}
            onClick={() => setSubmitted(input.trim())}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Lookup
          </Button>
        </CardContent>
      </Card>
      {submitted ? (
        <QueryState isLoading={wallet.isLoading} error={wallet.error}>
          {wallet.data ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Balances on Ethereum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-md border border-border/60">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left">Token</th>
                          <th className="px-3 py-2 text-right">Balance</th>
                          <th className="px-3 py-2 text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-border/60">
                          <td className="px-3 py-2 font-medium">Ether</td>
                          <td className="num px-3 py-2 text-right">
                            {(wallet.data.eth.balance ?? 0).toFixed(4)}
                          </td>
                          <td className="num px-3 py-2 text-right">
                            {formatCurrency(wallet.data.eth.value)}
                          </td>
                        </tr>
                        {wallet.data.tokens.slice(0, 20).map((t) => (
                          <tr key={t.address} className="border-t border-border/60">
                            <td className="px-3 py-2">
                              <span className="flex items-center gap-2">
                                <CoinThumb src={t.image} alt={t.symbol ?? "?"} size={18} />
                                <span className="font-medium">{t.name}</span>
                                <span className="text-xs uppercase text-muted-foreground">
                                  {t.symbol}
                                </span>
                              </span>
                            </td>
                            <td className="num px-3 py-2 text-right">
                              {(t.balance ?? 0).toFixed(4)}
                            </td>
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
                  <CardTitle>Recent transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {(history.data?.txs ?? []).slice(0, 12).map((t) => (
                      <li
                        key={t.hash}
                        className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2"
                      >
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {t.kind}
                          </Badge>
                          <a
                            href={`https://etherscan.io/tx/${t.hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs text-primary hover:underline"
                          >
                            {shortAddress(t.hash)}
                          </a>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(t.ts * 1000)}
                        </span>
                      </li>
                    ))}
                    {(history.data?.txs ?? []).length === 0 ? (
                      <li className="text-xs text-muted-foreground">No recent transactions.</li>
                    ) : null}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </QueryState>
      ) : null}
    </div>
  );
}

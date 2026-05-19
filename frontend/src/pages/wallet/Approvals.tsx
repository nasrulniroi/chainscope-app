import { useMemo } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireWallet } from "@/components/wallet/RequireWallet";
import { useWalletHistory } from "@/hooks/queries";
import { shortAddress, timeAgo } from "@/lib/utils";

export function WalletApprovalsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Token Approvals"
        description="Approval transactions detected from your most recent on-chain history. Use Etherscan or a tool like Revoke.cash to revoke."
      />
      <RequireWallet>{(address) => <Inner address={address} />}</RequireWallet>
    </div>
  );
}

function Inner({ address }: { address: `0x${string}` }) {
  const history = useWalletHistory(address, 1);
  const approvals = useMemo(() => (history.data?.txs ?? []).filter((t) => t.kind === "approve"), [history.data]);

  return (
    <QueryState
      isLoading={history.isLoading}
      error={history.error}
      isEmpty={approvals.length === 0}
      emptyMessage="No approval transactions in the last 50 transactions."
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Tx</th>
                  <th className="px-3 py-2 text-left">Token contract</th>
                  <th className="px-3 py-2 text-left">Spender</th>
                  <th className="px-3 py-2 text-left">When</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((t) => (
                  <tr key={t.hash} className="border-t border-border/60">
                    <td className="px-3 py-2">
                      <a
                        href={`https://etherscan.io/tx/${t.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {shortAddress(t.hash)}
                      </a>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{shortAddress(t.to)}</td>
                    <td className="px-3 py-2"><Badge variant="outline">{t.method ?? "approve"}</Badge></td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{timeAgo(t.ts * 1000)}</td>
                    <td className="px-3 py-2 text-right">
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={`https://revoke.cash/address/${address}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Revoke ↗
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            For safety, signed revokes are routed through revoke.cash (open-source). ChainScope never requests
            transactional signing.
          </p>
        </CardContent>
      </Card>
    </QueryState>
  );
}

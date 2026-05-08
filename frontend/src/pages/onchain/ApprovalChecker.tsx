import { useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWalletHistory } from "@/hooks/queries";
import { shortAddress, timeAgo } from "@/lib/utils";

export function OnchainApprovalCheckerPage() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const history = useWalletHistory(submitted ?? undefined, 1);
  const approvals = (history.data?.txs ?? []).filter((t) => t.kind === "approve");
  const ok = input.trim().match(/^0x[0-9a-fA-F]{40}$/);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Approval Checker"
        description="Scan any address for approval transactions. Use Revoke.cash externally to revoke."
      />
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
          <div className="min-w-[280px] flex-1">
            <label className="text-xs text-muted-foreground">Address</label>
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="0x…" />
          </div>
          <Button type="button" disabled={!ok} onClick={() => setSubmitted(input.trim())}>
            Scan
          </Button>
        </CardContent>
      </Card>
      {submitted ? (
        <QueryState
          isLoading={history.isLoading}
          error={history.error}
          isEmpty={approvals.length === 0}
          emptyMessage="No approve() transactions in the last 50 transactions."
        >
          <Card>
            <CardContent className="pt-4">
              <div className="overflow-hidden rounded-md border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Tx</th>
                      <th className="px-3 py-2 text-left">Token contract</th>
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
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {timeAgo(t.ts * 1000)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <a
                            href={`https://revoke.cash/address/${submitted}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Revoke ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <Badge variant="outline">limited to 50 most recent txs (free Etherscan tier)</Badge>
              </div>
            </CardContent>
          </Card>
        </QueryState>
      ) : null}
    </div>
  );
}

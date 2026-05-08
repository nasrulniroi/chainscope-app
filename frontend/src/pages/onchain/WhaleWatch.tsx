import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api";
import { shortAddress } from "@/lib/utils";
import { Link } from "react-router-dom";

interface WhaleWallet {
  label: string;
  address: string;
  chain: number;
}

export function OnchainWhaleWatchPage() {
  const data = useQuery<{ coin: string; wallets: WhaleWallet[] }>({
    queryKey: ["onchain", "whales"],
    queryFn: () => apiGet("/api/onchain/whales"),
    staleTime: 5 * 60_000,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Whale Watch"
        description="Curated list of well-known smart-money addresses. Click any to inspect via Wallet Lookup."
      />
      <QueryState isLoading={data.isLoading} error={data.error}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(data.data?.wallets ?? []).map((w) => (
            <Card key={w.address}>
              <CardHeader>
                <CardTitle className="text-sm">{w.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="outline">chain {w.chain}</Badge>
                <div className="font-mono text-xs">{shortAddress(w.address)}</div>
                <div className="flex gap-2 text-[11px]">
                  <Link
                    className="text-primary hover:underline"
                    to={`/onchain/wallet-lookup?address=${w.address}`}
                  >
                    Inspect →
                  </Link>
                  <a
                    href={`https://etherscan.io/address/${w.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Etherscan ↗
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

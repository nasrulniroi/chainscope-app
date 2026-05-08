import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { CoinThumb } from "@/components/common/CoinThumb";
import { RequireWallet } from "@/components/wallet/RequireWallet";
import { useNftWallet } from "@/hooks/queries";
import { formatCompact } from "@/lib/utils";

export function WalletNftsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="NFT Holdings" description="Collections held by this wallet, with floor estimates from Reservoir." />
      <RequireWallet>{(address) => <Inner address={address} />}</RequireWallet>
    </div>
  );
}

function Inner({ address }: { address: `0x${string}` }) {
  const nfts = useNftWallet(address);
  return (
    <QueryState
      isLoading={nfts.isLoading}
      error={nfts.error}
      isEmpty={(nfts.data?.collections?.length ?? 0) === 0}
      emptyMessage="No NFT collections found for this address."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(nfts.data?.collections ?? []).map((c) => (
          <Card key={c.slug}>
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center gap-2">
                <CoinThumb src={c.image} alt={c.name} size={32} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.token_count ?? 0} owned</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Floor</span>
                <span className="num">{c.floor_eth ? `${c.floor_eth.toFixed(3)} Ξ` : "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Estimated value</span>
                <span className="num">{c.value_eth ? `${formatCompact(c.value_eth)} Ξ` : "—"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </QueryState>
  );
}

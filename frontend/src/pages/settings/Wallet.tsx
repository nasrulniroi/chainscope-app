import { useAccount, useChainId, useChains } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { shortAddress } from "@/lib/utils";

export function SettingsWalletPage() {
  const account = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const active = chains.find((c) => c.id === chainId);

  return (
    <div className="space-y-4">
      <PageHeader title="Wallet Settings" description="Wallet provider information and supported networks." />
      <Card>
        <CardHeader>
          <CardTitle>Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">
                {account.isConnected ? account.address ? shortAddress(account.address) : "-" : "Not connected"}
              </div>
              <div className="text-xs text-muted-foreground">
                {account.connector?.name ?? "No connector"}
              </div>
            </div>
            <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
          </div>
          {active ? (
            <div className="text-xs text-muted-foreground">
              Active network: <Badge variant="outline">{active.name}</Badge>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Supported networks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
            {chains.map((c) => (
              <div key={c.id} className="rounded-md border border-border/60 bg-muted/20 p-2">
                <div className="font-medium">{c.name}</div>
                <div className="text-muted-foreground">id {c.id}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { useAccount } from "wagmi";

import { Card, CardContent } from "@/components/ui/card";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";

interface Props {
  children: (address: `0x${string}`) => ReactNode;
}

export function RequireWallet({ children }: Props) {
  const account = useAccount();
  if (!account.isConnected || !account.address) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Connect a wallet to continue</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Connect with MetaMask, WalletConnect, Coinbase Wallet or any RainbowKit-supported
            provider. We never request signing for read-only views.
          </p>
          <ConnectWalletButton variant="default" />
        </CardContent>
      </Card>
    );
  }
  return <>{children(account.address)}</>;
}

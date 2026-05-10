import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  /** Layout style. "compact" caps the width so long account labels can't break the header. */
  variant?: "compact" | "default";
}

/**
 * Wallet connect button using RainbowKit's render-prop API but with a fixed
 * compact footprint and English label, regardless of UI language or browser
 * locale. Avoids the layout overflow caused by long localized RainbowKit
 * labels in narrow header slots.
 */
export function ConnectWalletButton({ className, variant = "compact" }: Props) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, openAccountModal, mounted }) => {
        const ready = mounted;
        const connected = ready && !!account && !!chain;
        const compact = variant === "compact";

        if (!ready) {
          return (
            <Button
              size="sm"
              variant="outline"
              disabled
              className={cn("h-8 px-3 text-xs", compact && "max-w-[160px]", className)}
              aria-hidden
            >
              <Wallet className="mr-1.5 h-3.5 w-3.5" />
              Connect Wallet
            </Button>
          );
        }

        if (!connected) {
          return (
            <Button
              type="button"
              size="sm"
              onClick={openConnectModal}
              className={cn("h-8 whitespace-nowrap px-3 text-xs", compact && "max-w-[180px]", className)}
            >
              <Wallet className="mr-1.5 h-3.5 w-3.5" />
              Connect Wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={openChainModal}
              className={cn("h-8 px-3 text-xs", className)}
            >
              Wrong network
            </Button>
          );
        }

        return (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={openAccountModal}
            className={cn(
              "h-8 gap-1.5 whitespace-nowrap px-2.5 text-xs font-mono",
              compact && "max-w-[180px]",
              className,
            )}
            title={account.address}
          >
            {chain.hasIcon && chain.iconUrl ? (
              <img src={chain.iconUrl} alt={chain.name ?? ""} className="h-3.5 w-3.5 rounded-full" />
            ) : (
              <Wallet className="h-3.5 w-3.5" />
            )}
            <span className="truncate">{account.displayName}</span>
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}

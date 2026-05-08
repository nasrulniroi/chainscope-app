import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, bsc, mainnet, optimism, polygon } from "wagmi/chains";

const PROJECT_ID =
  import.meta.env.VITE_WC_PROJECT_ID && import.meta.env.VITE_WC_PROJECT_ID.length > 0
    ? import.meta.env.VITE_WC_PROJECT_ID
    : "0000000000000000000000000000beef";

export const supportedChains = [mainnet, arbitrum, optimism, base, polygon, bsc] as const;

export const wagmiConfig = getDefaultConfig({
  appName: "DeFi Command Center",
  projectId: PROJECT_ID,
  chains: supportedChains,
  ssr: false,
});

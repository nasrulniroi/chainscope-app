import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRightLeft,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  Bell,
  Calculator,
  Calendar,
  Coins,
  Crown,
  Database,
  FileSearch,
  FileText,
  Flame,
  Globe2,
  Image as ImageIcon,
  Layers,
  LineChart,
  Newspaper,
  Network,
  Percent,
  PieChart,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";

export interface RouteLeaf {
  label: string;
  to: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  walletGated?: boolean;
}

export interface RouteSection {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  walletGated?: boolean;
  basePath: string;
  items: RouteLeaf[];
}

export const NAV_SECTIONS: RouteSection[] = [
  {
    id: "wallet",
    label: "My Wallet",
    icon: Wallet,
    walletGated: true,
    basePath: "/wallet",
    items: [
      { label: "Overview", to: "/wallet/overview", icon: PieChart },
      { label: "Tokens", to: "/wallet/tokens", icon: Coins },
      { label: "DeFi Positions", to: "/wallet/positions", icon: Layers },
      { label: "NFTs", to: "/wallet/nfts", icon: ImageIcon },
      { label: "Tx History", to: "/wallet/history", icon: Activity },
      { label: "PnL", to: "/wallet/pnl", icon: TrendingUp },
      { label: "Approvals", to: "/wallet/approvals", icon: AlertTriangle },
      { label: "Alerts", to: "/wallet/alerts", icon: Bell },
    ],
  },
  {
    id: "markets",
    label: "Markets",
    icon: BarChart3,
    basePath: "/markets",
    items: [
      { label: "Overview", to: "/markets/overview", icon: BarChart3 },
      { label: "Heatmap", to: "/markets/heatmap", icon: LineChart },
      { label: "Sectors", to: "/markets/sectors", icon: Layers },
      { label: "Stablecoins", to: "/markets/stablecoins", icon: BadgeDollarSign },
      { label: "Trending", to: "/markets/trending", icon: TrendingUp },
    ],
  },
  {
    id: "tokens",
    label: "Tokens",
    icon: Coins,
    basePath: "/tokens",
    items: [
      { label: "All Tokens", to: "/tokens", icon: Coins },
      { label: "New Listings", to: "/tokens/new-listings", icon: Sparkles },
      { label: "Categories", to: "/tokens/categories", icon: Layers },
      { label: "Compare", to: "/tokens/compare", icon: ArrowRightLeft },
    ],
  },
  {
    id: "defi",
    label: "DeFi",
    icon: Banknote,
    basePath: "/defi",
    items: [
      { label: "Protocols", to: "/defi/protocols", icon: Database },
      { label: "Yields", to: "/defi/yields", icon: Percent },
      { label: "Lending", to: "/defi/lending", icon: Banknote },
      { label: "DEX Volumes", to: "/defi/dex", icon: ArrowLeftRight },
      { label: "Categories", to: "/defi/categories", icon: Layers },
    ],
  },
  {
    id: "chains",
    label: "Chains",
    icon: Network,
    basePath: "/chains",
    items: [
      { label: "All Chains", to: "/chains", icon: Network },
      { label: "Compare", to: "/chains/compare", icon: ArrowRightLeft },
      { label: "Bridges", to: "/chains/bridges", icon: Globe2 },
    ],
  },
  {
    id: "onchain",
    label: "On-Chain Tools",
    icon: Search,
    basePath: "/onchain",
    items: [
      { label: "Wallet Lookup", to: "/onchain/wallet-lookup", icon: Search },
      { label: "Whale Watch", to: "/onchain/whale-watch", icon: Crown },
      { label: "Contract", to: "/onchain/contract", icon: FileSearch },
      { label: "Approval Checker", to: "/onchain/approval-checker", icon: AlertTriangle },
    ],
  },
  {
    id: "nft",
    label: "NFT",
    icon: ImageIcon,
    basePath: "/nft",
    items: [
      { label: "Trending", to: "/nft/trending", icon: TrendingUp },
      { label: "Floor Radar", to: "/nft/floor-radar", icon: BarChart3 },
      { label: "Calendar", to: "/nft/calendar", icon: Calendar },
    ],
  },
  {
    id: "news",
    label: "News & Sentiment",
    icon: Newspaper,
    basePath: "/news",
    items: [
      { label: "Latest News", to: "/news", icon: Newspaper },
      { label: "Categories", to: "/news/categories", icon: Layers },
      { label: "Sentiment", to: "/news/sentiment", icon: TrendingUp },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: Zap,
    basePath: "/tools",
    items: [
      { label: "Gas", to: "/tools/gas", icon: Flame },
      { label: "Converter", to: "/tools/converter", icon: ArrowLeftRight },
      { label: "Swap Simulator", to: "/tools/swap-simulator", icon: ArrowRightLeft },
      { label: "IL Calculator", to: "/tools/il-calculator", icon: Calculator },
      { label: "DCA Backtest", to: "/tools/dca", icon: Calendar },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    basePath: "/settings",
    items: [
      { label: "General", to: "/settings/general", icon: Settings },
      { label: "Wallet", to: "/settings/wallet", icon: Wallet },
      { label: "API Health", to: "/settings/api", icon: Activity },
      { label: "Data", to: "/settings/data", icon: FileText },
    ],
  },
];

export interface BreadcrumbEntry {
  label: string;
  to?: string;
}

export function findRouteByPath(pathname: string): {
  section: RouteSection | null;
  leaf: RouteLeaf | null;
} {
  for (const section of NAV_SECTIONS) {
    if (pathname === section.basePath || pathname.startsWith(`${section.basePath}/`)) {
      const leaf =
        section.items.find((it) => pathname === it.to) ??
        section.items.find((it) => pathname.startsWith(`${it.to}/`)) ??
        null;
      return { section, leaf };
    }
  }
  return { section: null, leaf: null };
}

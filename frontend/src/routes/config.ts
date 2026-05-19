import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRightLeft,
  BadgeDollarSign,
  BarChart3,
  Bell,
  BookOpen,
  Bolt,
  Calculator,
  Calendar,
  Compass,
  Cpu,
  Crown,
  Crosshair,
  Database,
  Diamond,
  FileSearch,
  FileText,
  Flame,
  Frame,
  Gauge,
  Gem,
  Globe2,
  Landmark,
  Layers,
  LineChart,
  Newspaper,
  Palette,
  Percent,
  PieChart,
  Radar,
  Rss,
  Scan,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  WalletCards,
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
  description: string;
  /** Path to navigate to when only the section is clicked (no specific leaf). */
  landingPath: string;
  items: RouteLeaf[];
}

export const NAV_SECTIONS: RouteSection[] = [
  {
    id: "wallet",
    label: "My Wallet",
    icon: WalletCards,
    walletGated: true,
    basePath: "/wallet",
    landingPath: "/wallet",
    description: "Connect once, see everything: holdings, NFTs, DeFi positions, history, PnL, approvals, and alerts.",
    items: [
      { label: "Overview", to: "/wallet/overview", icon: PieChart, description: "Net worth, allocation, recent activity." },
      { label: "Tokens", to: "/wallet/tokens", icon: Gem, description: "All ERC-20 balances with USD values." },
      { label: "DeFi Positions", to: "/wallet/positions", icon: Layers, description: "Lending, LPing, staking exposures." },
      { label: "NFTs", to: "/wallet/nfts", icon: Diamond, description: "Collections owned with floor estimates." },
      { label: "Tx History", to: "/wallet/history", icon: Activity, description: "Recent transactions decoded." },
      { label: "PnL", to: "/wallet/pnl", icon: TrendingUp, description: "Unrealized profit & loss vs market." },
      { label: "Approvals", to: "/wallet/approvals", icon: ShieldCheck, description: "Outstanding token approvals." },
      { label: "Alerts", to: "/wallet/alerts", icon: Bell, description: "Watchlist price alerts." },
    ],
  },
  {
    id: "markets",
    label: "Markets",
    icon: Gauge,
    basePath: "/markets",
    landingPath: "/markets",
    description: "Macro view of crypto: market cap, dominance, heatmaps, sectors, stablecoins, and trending coins.",
    items: [
      { label: "Overview", to: "/markets/overview", icon: Gauge, description: "Total cap, BTC/ETH dominance, fear & greed." },
      { label: "Heatmap", to: "/markets/heatmap", icon: LineChart, description: "Top 100 coloured by 24h change." },
      { label: "Sectors", to: "/markets/sectors", icon: Layers, description: "Categories ranked by market cap." },
      { label: "Stablecoins", to: "/markets/stablecoins", icon: BadgeDollarSign, description: "Supply, peg, and dominance." },
      { label: "Trending", to: "/markets/trending", icon: TrendingUp, description: "Searched coins + biggest movers." },
    ],
  },
  {
    id: "tokens",
    label: "Tokens",
    icon: Gem,
    basePath: "/tokens",
    landingPath: "/tokens",
    description: "Browse, filter, and compare every token tracked by CoinGecko, with detail pages for each one.",
    items: [
      { label: "All Tokens", to: "/tokens", icon: Gem, description: "Sortable, filterable token universe." },
      { label: "New Listings", to: "/tokens/new-listings", icon: Sparkles, description: "Mid-cap newcomers (rank > 100)." },
      { label: "Categories", to: "/tokens/categories", icon: Layers, description: "Tokens grouped by sector." },
      { label: "Compare", to: "/tokens/compare", icon: ArrowRightLeft, description: "Side-by-side comparison." },
    ],
  },
  {
    id: "defi",
    label: "DeFi",
    icon: Landmark,
    basePath: "/defi",
    landingPath: "/defi",
    description: "Live DeFi data from DefiLlama: TVL, yields, lending markets, DEX volumes, and category breakdowns.",
    items: [
      { label: "Protocols", to: "/defi/protocols", icon: Database, description: "Every tracked DeFi protocol by TVL." },
      { label: "Yields", to: "/defi/yields", icon: Percent, description: "Live APYs across chains and pools." },
      { label: "Lending", to: "/defi/lending", icon: Landmark, description: "Lending-only protocols and rates." },
      { label: "DEX Volumes", to: "/defi/dex", icon: ArrowLeftRight, description: "Trading volume by DEX." },
      { label: "Categories", to: "/defi/categories", icon: Layers, description: "Sectors ranked by activity." },
    ],
  },
  {
    id: "chains",
    label: "Chains",
    icon: Cpu,
    basePath: "/chains",
    landingPath: "/chains",
    description: "Chain-level analytics, side-by-side comparison, and a bridge router across L1s and L2s.",
    items: [
      { label: "All Chains", to: "/chains", icon: Cpu, description: "Every L1/L2 ranked by TVL." },
      { label: "Compare", to: "/chains/compare", icon: ArrowRightLeft, description: "Compare TVL & history." },
      { label: "Bridges", to: "/chains/bridges", icon: Compass, description: "Quote routes via LI.FI." },
    ],
  },
  {
    id: "onchain",
    label: "On-Chain Tools",
    icon: Crosshair,
    basePath: "/onchain",
    landingPath: "/onchain",
    description: "Power-user utilities: lookup any address, watch whale flows, inspect contracts, audit approvals.",
    items: [
      { label: "Wallet Lookup", to: "/onchain/wallet-lookup", icon: Scan, description: "Inspect any 0x address." },
      { label: "Whale Watch", to: "/onchain/whale-watch", icon: Radar, description: "Largest recent transfers." },
      { label: "Contract", to: "/onchain/contract", icon: FileSearch, description: "ABI & verified source code." },
      { label: "Approval Checker", to: "/onchain/approval-checker", icon: ShieldCheck, description: "Risky token approvals." },
    ],
  },
  {
    id: "nft",
    label: "NFT",
    icon: Diamond,
    basePath: "/nft",
    landingPath: "/nft",
    description: "NFT market overview powered by Reservoir: trending collections, floor radar, drop calendar.",
    items: [
      { label: "Trending", to: "/nft/trending", icon: TrendingUp, description: "Top collections by 24h volume." },
      { label: "Floor Radar", to: "/nft/floor-radar", icon: Radar, description: "Track floor for your watchlist." },
      { label: "Calendar", to: "/nft/calendar", icon: Calendar, description: "Upcoming mints & releases." },
    ],
  },
  {
    id: "news",
    label: "News & Sentiment",
    icon: Rss,
    basePath: "/news",
    landingPath: "/news",
    description: "Latest crypto headlines from CryptoCompare, Cointelegraph, and Bitcoin Magazine, plus market sentiment.",
    items: [
      { label: "Latest News", to: "/news", icon: Rss, description: "All recent headlines." },
      { label: "Categories", to: "/news/categories", icon: BookOpen, description: "Filter news by topic." },
      { label: "Sentiment", to: "/news/sentiment", icon: TrendingUp, description: "Fear & Greed history." },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: Bolt,
    basePath: "/tools",
    landingPath: "/tools",
    description: "Practical calculators and live data: gas tracker, swap quotes, IL calculator, DCA backtest.",
    items: [
      { label: "Gas", to: "/tools/gas", icon: Flame, description: "Live ETH gas + cost estimates." },
      { label: "Converter", to: "/tools/converter", icon: ArrowLeftRight, description: "Token-to-token live FX." },
      { label: "Swap Simulator", to: "/tools/swap-simulator", icon: ArrowRightLeft, description: "1inch quote previews." },
      { label: "IL Calculator", to: "/tools/il-calculator", icon: Calculator, description: "Impermanent loss helper." },
      { label: "DCA Backtest", to: "/tools/dca", icon: Calendar, description: "Replay a periodic buy strategy." },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: SlidersHorizontal,
    basePath: "/settings",
    landingPath: "/settings",
    description: "App preferences, wallet management, upstream API health, and data import/export.",
    items: [
      { label: "General", to: "/settings/general", icon: SlidersHorizontal, description: "Theme, currency, locale." },
      { label: "Wallet", to: "/settings/wallet", icon: WalletCards, description: "Connect / disconnect wallets." },
      { label: "API Health", to: "/settings/api", icon: Activity, description: "Backend & upstream status." },
      { label: "Data", to: "/settings/data", icon: FileText, description: "Local cache & export." },
    ],
  },
];

export const NAV_SECTIONS_BY_ID: Record<string, RouteSection> = Object.fromEntries(
  NAV_SECTIONS.map((s) => [s.id, s]),
);

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

import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/Home";
import { NotFoundPage } from "@/pages/NotFound";

import { MarketsOverviewPage } from "@/pages/markets/Overview";
import { MarketsHeatmapPage } from "@/pages/markets/Heatmap";
import { MarketsSectorsPage } from "@/pages/markets/Sectors";
import { MarketsStablecoinsPage } from "@/pages/markets/Stablecoins";
import { MarketsTrendingPage } from "@/pages/markets/Trending";

import { TokensPage } from "@/pages/tokens/Tokens";
import { TokensNewListingsPage } from "@/pages/tokens/NewListings";
import { TokensCategoriesPage } from "@/pages/tokens/Categories";
import { TokensComparePage } from "@/pages/tokens/Compare";
import { TokenDetailPage } from "@/pages/tokens/Detail";
import { TokenMarketsPage } from "@/pages/tokens/TokenMarkets";
import { TokenNewsPage } from "@/pages/tokens/TokenNews";

import { DefiProtocolsPage } from "@/pages/defi/Protocols";
import { DefiProtocolDetailPage } from "@/pages/defi/ProtocolDetail";
import { DefiYieldsPage } from "@/pages/defi/Yields";
import { DefiYieldDetailPage } from "@/pages/defi/YieldDetail";
import { DefiLendingPage } from "@/pages/defi/Lending";
import { DefiDexPage } from "@/pages/defi/Dex";
import { DefiCategoriesPage } from "@/pages/defi/Categories";

import { ChainsPage } from "@/pages/chains/Chains";
import { ChainsComparePage } from "@/pages/chains/Compare";
import { ChainDetailPage } from "@/pages/chains/ChainDetail";
import { ChainsBridgesPage } from "@/pages/chains/Bridges";

import { WalletOverviewPage } from "@/pages/wallet/Overview";
import { WalletTokensPage } from "@/pages/wallet/Tokens";
import { WalletPositionsPage } from "@/pages/wallet/Positions";
import { WalletNftsPage } from "@/pages/wallet/Nfts";
import { WalletHistoryPage } from "@/pages/wallet/History";
import { WalletPnlPage } from "@/pages/wallet/Pnl";
import { WalletApprovalsPage } from "@/pages/wallet/Approvals";
import { WalletAlertsPage } from "@/pages/wallet/Alerts";

import { OnchainWalletLookupPage } from "@/pages/onchain/WalletLookup";
import { OnchainWhaleWatchPage } from "@/pages/onchain/WhaleWatch";
import { OnchainContractPage } from "@/pages/onchain/Contract";
import { OnchainApprovalCheckerPage } from "@/pages/onchain/ApprovalChecker";

import { NftTrendingPage } from "@/pages/nft/Trending";
import { NftFloorRadarPage } from "@/pages/nft/FloorRadar";
import { NftCalendarPage } from "@/pages/nft/Calendar";

import { NewsPage } from "@/pages/news/News";
import { NewsCategoriesPage } from "@/pages/news/Categories";
import { NewsSentimentPage } from "@/pages/news/Sentiment";

import { ToolsGasPage } from "@/pages/tools/Gas";
import { ToolsConverterPage } from "@/pages/tools/Converter";
import { ToolsSwapSimulatorPage } from "@/pages/tools/SwapSimulator";
import { ToolsIlCalculatorPage } from "@/pages/tools/IlCalculator";
import { ToolsDcaPage } from "@/pages/tools/Dca";

import { SettingsGeneralPage } from "@/pages/settings/General";
import { SettingsWalletPage } from "@/pages/settings/Wallet";
import { SettingsApiPage } from "@/pages/settings/Api";
import { SettingsDataPage } from "@/pages/settings/Data";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />

        <Route path="markets">
          <Route index element={<Navigate to="/markets/overview" replace />} />
          <Route path="overview" element={<MarketsOverviewPage />} />
          <Route path="heatmap" element={<MarketsHeatmapPage />} />
          <Route path="sectors" element={<MarketsSectorsPage />} />
          <Route path="stablecoins" element={<MarketsStablecoinsPage />} />
          <Route path="trending" element={<MarketsTrendingPage />} />
        </Route>

        <Route path="tokens">
          <Route index element={<TokensPage />} />
          <Route path="new-listings" element={<TokensNewListingsPage />} />
          <Route path="categories" element={<TokensCategoriesPage />} />
          <Route path="compare" element={<TokensComparePage />} />
          <Route path=":id" element={<TokenDetailPage />} />
          <Route path=":id/markets" element={<TokenMarketsPage />} />
          <Route path=":id/news" element={<TokenNewsPage />} />
        </Route>

        <Route path="defi">
          <Route index element={<Navigate to="/defi/protocols" replace />} />
          <Route path="protocols" element={<DefiProtocolsPage />} />
          <Route path="protocols/:slug" element={<DefiProtocolDetailPage />} />
          <Route path="yields" element={<DefiYieldsPage />} />
          <Route path="yields/:pool" element={<DefiYieldDetailPage />} />
          <Route path="lending" element={<DefiLendingPage />} />
          <Route path="dex" element={<DefiDexPage />} />
          <Route path="categories" element={<DefiCategoriesPage />} />
        </Route>

        <Route path="chains">
          <Route index element={<ChainsPage />} />
          <Route path="compare" element={<ChainsComparePage />} />
          <Route path="bridges" element={<ChainsBridgesPage />} />
          <Route path=":name" element={<ChainDetailPage />} />
        </Route>

        <Route path="wallet">
          <Route index element={<Navigate to="/wallet/overview" replace />} />
          <Route path="overview" element={<WalletOverviewPage />} />
          <Route path="tokens" element={<WalletTokensPage />} />
          <Route path="positions" element={<WalletPositionsPage />} />
          <Route path="nfts" element={<WalletNftsPage />} />
          <Route path="history" element={<WalletHistoryPage />} />
          <Route path="pnl" element={<WalletPnlPage />} />
          <Route path="approvals" element={<WalletApprovalsPage />} />
          <Route path="alerts" element={<WalletAlertsPage />} />
        </Route>

        <Route path="onchain">
          <Route index element={<Navigate to="/onchain/wallet-lookup" replace />} />
          <Route path="wallet-lookup" element={<OnchainWalletLookupPage />} />
          <Route path="whale-watch" element={<OnchainWhaleWatchPage />} />
          <Route path="contract" element={<OnchainContractPage />} />
          <Route path="approval-checker" element={<OnchainApprovalCheckerPage />} />
        </Route>

        <Route path="nft">
          <Route index element={<Navigate to="/nft/trending" replace />} />
          <Route path="trending" element={<NftTrendingPage />} />
          <Route path="floor-radar" element={<NftFloorRadarPage />} />
          <Route path="calendar" element={<NftCalendarPage />} />
        </Route>

        <Route path="news">
          <Route index element={<NewsPage />} />
          <Route path="categories" element={<NewsCategoriesPage />} />
          <Route path="sentiment" element={<NewsSentimentPage />} />
        </Route>

        <Route path="tools">
          <Route index element={<Navigate to="/tools/gas" replace />} />
          <Route path="gas" element={<ToolsGasPage />} />
          <Route path="converter" element={<ToolsConverterPage />} />
          <Route path="swap-simulator" element={<ToolsSwapSimulatorPage />} />
          <Route path="il-calculator" element={<ToolsIlCalculatorPage />} />
          <Route path="dca" element={<ToolsDcaPage />} />
        </Route>

        <Route path="settings">
          <Route index element={<Navigate to="/settings/general" replace />} />
          <Route path="general" element={<SettingsGeneralPage />} />
          <Route path="wallet" element={<SettingsWalletPage />} />
          <Route path="api" element={<SettingsApiPage />} />
          <Route path="data" element={<SettingsDataPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

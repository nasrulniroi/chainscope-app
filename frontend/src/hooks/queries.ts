import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type {
  ApiHealth,
  CategoryEntry,
  CoinSummary,
  DexSummary,
  GasOracle,
  GasHistoryPoint,
  MarketGlobal,
  NewsArticle,
  NftCollectionRow,
  ProtocolDetail,
  ProtocolSummary,
  StablecoinEntry,
  ChainSummary,
  ChainDetail,
  YieldPool,
  YieldPoolDetail,
} from "@/types/api";

const ONE_MINUTE = 60_000;

export function useMarketGlobal() {
  return useQuery<MarketGlobal>({
    queryKey: ["markets", "overview"],
    queryFn: () => apiGet<MarketGlobal>("/api/markets/overview"),
    staleTime: ONE_MINUTE,
  });
}

export function useTopCoins(opts?: { perPage?: number; page?: number; ids?: string }) {
  const params = new URLSearchParams();
  params.set("per_page", String(opts?.perPage ?? 100));
  params.set("page", String(opts?.page ?? 1));
  if (opts?.ids) params.set("ids", opts.ids);
  return useQuery<{ coins: CoinSummary[] }>({
    queryKey: ["markets", "top", opts?.perPage ?? 100, opts?.page ?? 1, opts?.ids ?? ""],
    queryFn: () => apiGet<{ coins: CoinSummary[] }>(`/api/markets/top?${params.toString()}`),
    staleTime: ONE_MINUTE,
  });
}

export function useCategories() {
  return useQuery<{ categories: CategoryEntry[] }>({
    queryKey: ["markets", "categories"],
    queryFn: () => apiGet<{ categories: CategoryEntry[] }>("/api/markets/categories"),
    staleTime: 5 * ONE_MINUTE,
  });
}

export function useTrending() {
  return useQuery<{ coins: { id: string; name: string; symbol: string; thumb: string | null; market_cap_rank: number | null; score: number | null; price_btc: number | null }[] }>({
    queryKey: ["markets", "trending"],
    queryFn: () => apiGet("/api/markets/trending"),
    staleTime: 2 * ONE_MINUTE,
  });
}

export function useStablecoins() {
  return useQuery<{ stablecoins: StablecoinEntry[] }>({
    queryKey: ["markets", "stablecoins"],
    queryFn: () => apiGet("/api/markets/stablecoins"),
    staleTime: 5 * ONE_MINUTE,
  });
}

export function useCoinDetail(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["coin", "detail", id],
    queryFn: () => apiGet<{
      id: string;
      symbol: string;
      name: string;
      image: string | null;
      description: string | null;
      homepage: string[];
      categories: string[];
      current_price: number | null;
      market_cap: number | null;
      market_cap_rank: number | null;
      fully_diluted_valuation: number | null;
      total_volume: number | null;
      ath: number | null;
      atl: number | null;
      ath_date: string | null;
      atl_date: string | null;
      circulating_supply: number | null;
      total_supply: number | null;
      max_supply: number | null;
      price_change_percentage_24h: number | null;
      price_change_percentage_7d: number | null;
      price_change_percentage_30d: number | null;
      price_change_percentage_1y: number | null;
      tickers: {
        exchange: string | null;
        exchange_id: string | null;
        pair: string;
        price: number | null;
        volume: number | null;
        trust_score: string | null;
        url: string | null;
      }[];
      sparkline_7d: number[];
    }>(`/api/coins/${encodeURIComponent(id ?? "")}`),
    staleTime: ONE_MINUTE,
  });
}

export function useCoinChart(id: string | undefined, days: string) {
  return useQuery<{
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
  }>({
    enabled: !!id,
    queryKey: ["coin", "chart", id, days],
    queryFn: () => apiGet(`/api/coins/${encodeURIComponent(id ?? "")}/chart?days=${days}`),
    staleTime: 5 * ONE_MINUTE,
  });
}

export function useDefiProtocols() {
  return useQuery<{ protocols: ProtocolSummary[] }>({
    queryKey: ["defi", "protocols"],
    queryFn: () => apiGet("/api/defi/protocols"),
    staleTime: 3 * ONE_MINUTE,
  });
}

export function useDefiProtocolDetail(slug: string | undefined) {
  return useQuery<ProtocolDetail>({
    enabled: !!slug,
    queryKey: ["defi", "protocol", slug],
    queryFn: () => apiGet(`/api/defi/protocols/${encodeURIComponent(slug ?? "")}`),
    staleTime: 5 * ONE_MINUTE,
  });
}

export function useDefiYields() {
  return useQuery<{ pools: YieldPool[] }>({
    queryKey: ["defi", "yields"],
    queryFn: () => apiGet("/api/defi/yields"),
    staleTime: 3 * ONE_MINUTE,
  });
}

export function useDefiYieldDetail(pool: string | undefined) {
  return useQuery<YieldPoolDetail>({
    enabled: !!pool,
    queryKey: ["defi", "yield", pool],
    queryFn: () => apiGet(`/api/defi/yields/${encodeURIComponent(pool ?? "")}`),
    staleTime: 10 * ONE_MINUTE,
  });
}

export function useDefiDex() {
  return useQuery<{ dexs: DexSummary[] }>({
    queryKey: ["defi", "dex"],
    queryFn: () => apiGet("/api/defi/dex"),
    staleTime: 5 * ONE_MINUTE,
  });
}

export function useChains() {
  return useQuery<{ chains: ChainSummary[] }>({
    queryKey: ["chains", "list"],
    queryFn: () => apiGet("/api/chains"),
    staleTime: 5 * ONE_MINUTE,
  });
}

export function useChainDetail(name: string | undefined) {
  return useQuery<ChainDetail>({
    enabled: !!name,
    queryKey: ["chains", "detail", name],
    queryFn: () => apiGet(`/api/chains/${encodeURIComponent(name ?? "")}`),
    staleTime: 10 * ONE_MINUTE,
  });
}

export function useGasOracle() {
  return useQuery<GasOracle>({
    queryKey: ["tools", "gas"],
    queryFn: () => apiGet("/api/tools/gas"),
    refetchInterval: 30_000,
    staleTime: 30_000,
  });
}

export function useGasHistory() {
  return useQuery<{ history: GasHistoryPoint[] }>({
    queryKey: ["tools", "gas-history"],
    queryFn: () => apiGet("/api/tools/gas-history"),
    refetchInterval: 30_000,
    staleTime: 30_000,
  });
}

export function useNews(category?: string) {
  return useQuery<{ articles: NewsArticle[] }>({
    queryKey: ["news", "latest", category ?? ""],
    queryFn: () => apiGet(`/api/news${category ? `?category=${encodeURIComponent(category)}` : ""}`),
    staleTime: 90_000,
  });
}

export function useTokenNews(symbol: string | undefined) {
  return useQuery<{ articles: NewsArticle[] }>({
    enabled: !!symbol,
    queryKey: ["news", "token", symbol],
    queryFn: () => apiGet(`/api/news/token?symbol=${encodeURIComponent(symbol ?? "")}`),
    staleTime: 5 * ONE_MINUTE,
  });
}

export function useSentimentHistory() {
  return useQuery<{
    history: { ts: number; value: number; classification: string }[];
    latest: { ts: number; value: number; classification: string } | null;
  }>({
    queryKey: ["sentiment"],
    queryFn: () => apiGet("/api/sentiment"),
    staleTime: 10 * ONE_MINUTE,
  });
}

export function useNftTrending() {
  return useQuery<{ collections: NftCollectionRow[] }>({
    queryKey: ["nft", "trending"],
    queryFn: () => apiGet("/api/nft/trending"),
    staleTime: 5 * ONE_MINUTE,
  });
}

export function useNftWallet(address: string | undefined) {
  return useQuery<{
    collections: {
      slug: string;
      name: string;
      image: string | null;
      token_count: number | null;
      floor_eth: number | null;
      value_eth: number | null;
    }[];
  }>({
    enabled: !!address,
    queryKey: ["nft", "wallet", address],
    queryFn: () => apiGet(`/api/wallet/nfts?address=${encodeURIComponent(address ?? "")}`),
    staleTime: ONE_MINUTE,
  });
}

export function useApiHealth() {
  return useQuery<ApiHealth & { checks: { name: string; ok: boolean; error?: string }[] }>({
    queryKey: ["api", "health"],
    queryFn: () => apiGet("/api/health"),
    staleTime: ONE_MINUTE,
  });
}

export function useEthWallet(address: string | undefined) {
  return useQuery<{
    address: string;
    eth: { balance: number | null; price: number | null; value: number | null };
    tokens: {
      address: string;
      name: string;
      symbol: string;
      decimals: number;
      balance: number | null;
      price: number | null;
      value: number | null;
      image: string | null;
    }[];
  }>({
    enabled: !!address,
    queryKey: ["wallet", "eth", address],
    queryFn: () => apiGet(`/api/wallet/eth?address=${encodeURIComponent(address ?? "")}`),
    staleTime: ONE_MINUTE,
  });
}

export function useWalletHistory(address: string | undefined, chainId: number) {
  return useQuery<{
    chain_id: number;
    address: string;
    txs: {
      hash: string;
      from: string;
      to: string;
      value_eth: number | null;
      block: string;
      ts: number;
      is_error: boolean;
      method: string | null;
      kind: string;
      gas_used: number | null;
    }[];
    error?: string;
  }>({
    enabled: !!address,
    queryKey: ["wallet", "history", address, chainId],
    queryFn: () =>
      apiGet(
        `/api/wallet/history?chainId=${chainId}&address=${encodeURIComponent(address ?? "")}`,
      ),
    staleTime: ONE_MINUTE,
  });
}

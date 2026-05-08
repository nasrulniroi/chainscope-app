export interface ApiHealth {
  ok: boolean;
  service: string;
  ts: number;
  endpoints?: { path: string; ok: boolean }[];
}

export interface MarketGlobal {
  total_market_cap: number;
  total_volume: number;
  market_cap_change_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  active_cryptocurrencies: number;
  markets: number;
  fear_greed: { value: number; classification: string; ts: number } | null;
}

export interface CoinSummary {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d: number | null;
  price_change_percentage_30d: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  ath: number | null;
  atl: number | null;
  sparkline_7d: number[];
}

export interface CategoryEntry {
  id: string;
  name: string;
  market_cap: number | null;
  market_cap_change_24h: number | null;
  volume_24h: number | null;
  top_3_coins: string[];
}

export interface StablecoinEntry {
  id: number;
  name: string;
  symbol: string;
  pegType: string;
  pegMechanism: string;
  circulating: number | null;
  price: number | null;
  chains: string[];
}

export interface ProtocolSummary {
  id: string;
  name: string;
  slug: string;
  symbol: string | null;
  logo: string | null;
  category: string | null;
  chain: string | null;
  chains: string[];
  tvl: number | null;
  change_1d: number | null;
  change_7d: number | null;
  mcap: number | null;
  url: string | null;
}

export interface ProtocolDetail extends ProtocolSummary {
  description: string | null;
  twitter: string | null;
  audits: string | null;
  tvl_history: { date: number; tvl: number }[];
  chain_tvls: Record<string, number>;
}

export interface YieldPool {
  pool: string;
  project: string;
  chain: string;
  symbol: string;
  tvlUsd: number | null;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
  ilRisk: string | null;
  exposure: string | null;
  stable: boolean | null;
  url: string | null;
}

export interface YieldPoolDetail extends YieldPool {
  history: { ts: number; apy: number; tvlUsd: number }[];
}

export interface ChainSummary {
  name: string;
  tvl: number | null;
  tokenSymbol: string | null;
  chainId: number | null;
  cmcId: number | null;
  gecko_id: string | null;
}

export interface ChainDetail {
  name: string;
  tvl: number | null;
  tokenSymbol: string | null;
  history: { date: number; tvl: number }[];
  protocols: ProtocolSummary[];
}

export interface DexSummary {
  name: string;
  total24h: number | null;
  total7d: number | null;
  change_1d: number | null;
  chains: string[];
}

export interface BridgeRoute {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  amount: string;
  estimate: {
    toAmount: string;
    durationSec: number;
    feeUsd: number;
    gasUsd: number;
  };
  bridge: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  body: string;
  imageurl: string | null;
  published_on: number;
  categories: string;
}

export interface GasOracle {
  safe: number | null;
  propose: number | null;
  fast: number | null;
  base_fee: number | null;
  block: number | null;
  ts: number;
}

export interface GasHistoryPoint {
  ts: number;
  base_fee: number | null;
  fast: number | null;
}

export interface NftCollectionRow {
  slug: string;
  name: string;
  image: string | null;
  floor_eth: number | null;
  floor_change_24h: number | null;
  volume_eth: number | null;
  owners: number | null;
  supply: number | null;
}

export interface SwapQuote {
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
  estimated_gas: number | null;
  protocols: string[] | null;
}

export interface ContractInfo {
  address: string;
  is_contract: boolean;
  source_verified: boolean;
  contract_name: string | null;
  compiler: string | null;
  abi: unknown;
  source_code: string | null;
  proxy: boolean;
  implementation: string | null;
}

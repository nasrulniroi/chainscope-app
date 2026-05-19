# ChainScope

Multi-chain DeFi intelligence platform — real-time market data, on-chain analytics, wallet tracking, and DeFi protocol insights across 50+ chains.

## Features

- **Markets**: Overview, trending tokens, sectors, stablecoins, heatmap
- **Tokens**: Detailed token pages, comparison, categories, new listings, markets, news
- **DeFi**: Protocol rankings, yields, DEX analytics, lending, categories
- **Chains**: Multi-chain comparison, bridge tracking, chain details
- **On-Chain Tools**: Whale watch, approval checker, wallet lookup, contract analysis
- **NFT**: Trending collections, floor radar, calendar
- **News**: Aggregated crypto news with sentiment analysis
- **Tools**: DCA calculator, gas tracker, converter, impermanent loss calculator, swap simulator
- **Wallet**: Portfolio tracking, PnL analysis, positions, token holdings, NFT gallery

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Python serverless (Vercel Functions)
- **Data**: CoinGecko, DefiLlama, and other public crypto APIs
- **Wallet**: Wagmi + WalletConnect (MetaMask, Rabby, etc.)

## Development

```bash
cd frontend
npm install
npm run dev
```

## Deployment

Configured for Vercel with Python serverless backend at `api/index.py`.

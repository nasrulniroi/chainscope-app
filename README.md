# DeFi Command Center

A Bloomberg-style Web3/DeFi terminal — a multi-page SPA built with Vite + React + TypeScript on the
frontend and a single Vercel Python serverless function on the backend, deployable on Vercel using
only free APIs (no API keys required).

## Stack

- **Frontend** — Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, Recharts, lucide-react,
  React Router v6, @tanstack/react-query, wagmi + viem + RainbowKit (multichain read-only wallet).
- **Backend** — Single Vercel Python serverless function in `api/index.py` using only the standard
  library (`http.server.BaseHTTPRequestHandler`, `urllib.request`, `json`, `re`). CORS allow-all,
  in-memory TTL cache.

## Free data sources

| Domain | Source |
| --- | --- |
| Market data, charts, trending | CoinGecko free |
| TVL, protocols, yields, chains, stablecoins, bridges | DefiLlama |
| Gas oracle, ETH balance, tx | Etherscan V2 free tier |
| Fear & Greed | api.alternative.me |
| News | CryptoCompare, Cointelegraph RSS, Bitcoin Magazine RSS |
| Wallet token holdings | Ethplorer (ETH), Etherscan tokenlist (others) |
| Bridge route quotes | LI.FI public endpoint |
| Swap quotes | 1inch public quote |
| NFT trending, floor | Reservoir public |

## Local development

```bash
# Install root tooling and the Vite frontend
npm install
cd frontend && npm install

# Run the frontend (Vite dev server on http://localhost:5173)
npm run dev

# Build the SPA
cd frontend && npm run build
```

The Python API runs as a Vercel serverless function. For local testing you can run the file
directly:

```bash
python3 api/index.py
```

## Deployment

Pushed to Vercel — see `vercel.json` at the repo root for the rewrites that make the SPA work.

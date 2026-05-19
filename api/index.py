"""ChainScope serverless API.

A single Vercel Python function that proxies a curated set of free public
crypto / DeFi APIs and exposes a stable JSON contract to the frontend.

Implementation constraints (per project requirements):
- Standard library only.
- Must work without any API keys (Etherscan key optional).
- CORS allow-all.
- In-memory TTL cache to minimise upstream load.

The handler dispatches based on ``self.path`` so a single function file can
back many ``/api/*`` routes via ``vercel.json`` rewrites.
"""

from __future__ import annotations

import json
import os
import re
import socket
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler
from typing import Any, Callable
from xml.etree import ElementTree

# ---------------------------------------------------------------------------
# Tunables
# ---------------------------------------------------------------------------

DEFAULT_TIMEOUT = 12  # seconds for any single upstream call
USER_AGENT = "ChainScope/0.1"

ETHERSCAN_API_KEY = os.environ.get("ETHERSCAN_API_KEY", "").strip()


# ---------------------------------------------------------------------------
# In-memory TTL cache
# ---------------------------------------------------------------------------


class _TTLCache:
    def __init__(self) -> None:
        self._data: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Any | None:
        now = time.time()
        with self._lock:
            entry = self._data.get(key)
            if entry is None:
                return None
            expires, value = entry
            if expires < now:
                self._data.pop(key, None)
                return None
            return value

    def set(self, key: str, value: Any, ttl: float) -> None:
        with self._lock:
            self._data[key] = (time.time() + ttl, value)


_CACHE = _TTLCache()


def _cached(key: str, ttl: float, fn: Callable[[], Any]) -> Any:
    cached = _CACHE.get(key)
    if cached is not None:
        return cached
    value = fn()
    _CACHE.set(key, value, ttl)
    return value


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------


def _http_get(url: str, timeout: float = DEFAULT_TIMEOUT, accept: str = "application/json") -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": accept,
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:  # noqa: S310 - HTTPS only
        return resp.read()


def _http_get_json(url: str, timeout: float = DEFAULT_TIMEOUT) -> Any:
    raw = _http_get(url, timeout=timeout, accept="application/json")
    return json.loads(raw.decode("utf-8"))


def _safe_call(label: str, fn: Callable[[], Any], default: Any = None) -> Any:
    """Run ``fn`` and degrade gracefully on upstream errors."""
    try:
        return fn()
    except (urllib.error.URLError, urllib.error.HTTPError, socket.timeout, ValueError, KeyError) as exc:
        print(f"[api] upstream {label} failed: {exc}")  # appears in vercel logs
        return default


def _safe_number(value: Any) -> float | None:
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    if f != f:  # NaN
        return None
    return f


# ---------------------------------------------------------------------------
# Endpoint handlers
# ---------------------------------------------------------------------------


def _markets_overview() -> dict[str, Any]:
    def fetch_global() -> dict[str, Any]:
        data = _http_get_json("https://api.coingecko.com/api/v3/global")
        d = data.get("data", {})
        mcap = d.get("total_market_cap", {}).get("usd")
        vol = d.get("total_volume", {}).get("usd")
        chg = d.get("market_cap_change_percentage_24h_usd")
        return {
            "total_market_cap": _safe_number(mcap),
            "total_volume": _safe_number(vol),
            "market_cap_change_24h": _safe_number(chg),
            "btc_dominance": _safe_number(d.get("market_cap_percentage", {}).get("btc")),
            "eth_dominance": _safe_number(d.get("market_cap_percentage", {}).get("eth")),
            "active_cryptocurrencies": d.get("active_cryptocurrencies"),
            "markets": d.get("markets"),
        }

    def fetch_fng() -> dict[str, Any] | None:
        data = _http_get_json("https://api.alternative.me/fng/?limit=1")
        first = (data.get("data") or [{}])[0]
        if not first:
            return None
        ts = int(first.get("timestamp") or 0)
        return {
            "value": int(first.get("value", 0) or 0),
            "classification": first.get("value_classification") or "",
            "ts": ts,
        }

    body = _cached("markets:overview", 60, lambda: {**fetch_global(), "fear_greed": _safe_call("fng", fetch_fng)})
    return body


def _coingecko_markets(*, page: int, per_page: int, ids: str | None, sparkline: bool) -> list[dict[str, Any]]:
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": per_page,
        "page": page,
        "price_change_percentage": "24h,7d,30d",
        "sparkline": "true" if sparkline else "false",
    }
    if ids:
        params["ids"] = ids
    url = "https://api.coingecko.com/api/v3/coins/markets?" + urllib.parse.urlencode(params)
    raw = _http_get_json(url)
    out: list[dict[str, Any]] = []
    for c in raw or []:
        out.append(
            {
                "id": c.get("id"),
                "symbol": c.get("symbol"),
                "name": c.get("name"),
                "image": c.get("image"),
                "current_price": _safe_number(c.get("current_price")),
                "market_cap": _safe_number(c.get("market_cap")),
                "market_cap_rank": c.get("market_cap_rank"),
                "total_volume": _safe_number(c.get("total_volume")),
                "price_change_percentage_24h": _safe_number(c.get("price_change_percentage_24h_in_currency")),
                "price_change_percentage_7d": _safe_number(c.get("price_change_percentage_7d_in_currency")),
                "price_change_percentage_30d": _safe_number(c.get("price_change_percentage_30d_in_currency")),
                "circulating_supply": _safe_number(c.get("circulating_supply")),
                "total_supply": _safe_number(c.get("total_supply")),
                "ath": _safe_number(c.get("ath")),
                "atl": _safe_number(c.get("atl")),
                "sparkline_7d": (c.get("sparkline_in_7d") or {}).get("price") or [],
            }
        )
    return out


def _markets_top(query: dict[str, list[str]]) -> list[dict[str, Any]]:
    page = max(1, int(query.get("page", ["1"])[0] or 1))
    # CoinGecko allows up to 250 per page on the public endpoint.
    per_page = min(250, max(10, int(query.get("per_page", ["100"])[0] or 100)))
    ids_param = query.get("ids", [None])[0]
    sparkline = (query.get("sparkline", ["true"])[0] or "true").lower() != "false"
    cache_key = f"markets:top:{page}:{per_page}:{ids_param}:{sparkline}"
    return _cached(cache_key, 60, lambda: _coingecko_markets(page=page, per_page=per_page, ids=ids_param, sparkline=sparkline))


def _markets_categories() -> list[dict[str, Any]]:
    def fetch() -> list[dict[str, Any]]:
        url = "https://api.coingecko.com/api/v3/coins/categories"
        data = _http_get_json(url)
        out: list[dict[str, Any]] = []
        for c in data or []:
            out.append(
                {
                    "id": c.get("id"),
                    "name": c.get("name"),
                    "market_cap": _safe_number(c.get("market_cap")),
                    "market_cap_change_24h": _safe_number(c.get("market_cap_change_24h")),
                    "volume_24h": _safe_number(c.get("volume_24h")),
                    "top_3_coins": c.get("top_3_coins") or [],
                }
            )
        return out

    return _cached("markets:categories", 5 * 60, fetch)


def _markets_trending() -> dict[str, Any]:
    def fetch() -> dict[str, Any]:
        trending = _http_get_json("https://api.coingecko.com/api/v3/search/trending")
        coins = []
        for entry in (trending or {}).get("coins", [])[:15]:
            item = entry.get("item") or {}
            coins.append(
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "symbol": item.get("symbol"),
                    "thumb": item.get("thumb") or item.get("small"),
                    "market_cap_rank": item.get("market_cap_rank"),
                    "score": item.get("score"),
                    "price_btc": _safe_number(item.get("price_btc")),
                }
            )
        return {"coins": coins}

    return _cached("markets:trending", 2 * 60, fetch)


def _markets_stablecoins() -> list[dict[str, Any]]:
    def fetch() -> list[dict[str, Any]]:
        data = _http_get_json("https://stablecoins.llama.fi/stablecoins?includePrices=true")
        out: list[dict[str, Any]] = []
        for s in (data or {}).get("peggedAssets", []):
            circ = s.get("circulating") or {}
            value = circ.get("peggedUSD") or 0
            out.append(
                {
                    "id": s.get("id"),
                    "name": s.get("name"),
                    "symbol": s.get("symbol"),
                    "pegType": s.get("pegType"),
                    "pegMechanism": s.get("pegMechanism"),
                    "circulating": _safe_number(value),
                    "price": _safe_number(s.get("price")),
                    "chains": s.get("chains") or [],
                }
            )
        return sorted(out, key=lambda x: x["circulating"] or 0, reverse=True)

    return _cached("markets:stablecoins", 5 * 60, fetch)


def _coin_detail(coin_id: str) -> dict[str, Any]:
    coin_id = coin_id.lower()

    def fetch() -> dict[str, Any]:
        params = {
            "localization": "false",
            "tickers": "true",
            "market_data": "true",
            "community_data": "false",
            "developer_data": "false",
            "sparkline": "true",
        }
        url = f"https://api.coingecko.com/api/v3/coins/{urllib.parse.quote(coin_id)}?" + urllib.parse.urlencode(params)
        data = _http_get_json(url)
        market = data.get("market_data") or {}
        return {
            "id": data.get("id"),
            "symbol": data.get("symbol"),
            "name": data.get("name"),
            "image": (data.get("image") or {}).get("large") or (data.get("image") or {}).get("small"),
            "description": (data.get("description") or {}).get("en"),
            "homepage": (data.get("links") or {}).get("homepage", []),
            "categories": data.get("categories") or [],
            "current_price": _safe_number((market.get("current_price") or {}).get("usd")),
            "market_cap": _safe_number((market.get("market_cap") or {}).get("usd")),
            "market_cap_rank": market.get("market_cap_rank"),
            "fully_diluted_valuation": _safe_number((market.get("fully_diluted_valuation") or {}).get("usd")),
            "total_volume": _safe_number((market.get("total_volume") or {}).get("usd")),
            "ath": _safe_number((market.get("ath") or {}).get("usd")),
            "atl": _safe_number((market.get("atl") or {}).get("usd")),
            "ath_date": (market.get("ath_date") or {}).get("usd"),
            "atl_date": (market.get("atl_date") or {}).get("usd"),
            "circulating_supply": _safe_number(market.get("circulating_supply")),
            "total_supply": _safe_number(market.get("total_supply")),
            "max_supply": _safe_number(market.get("max_supply")),
            "price_change_percentage_24h": _safe_number(market.get("price_change_percentage_24h")),
            "price_change_percentage_7d": _safe_number(market.get("price_change_percentage_7d")),
            "price_change_percentage_30d": _safe_number(market.get("price_change_percentage_30d")),
            "price_change_percentage_1y": _safe_number(market.get("price_change_percentage_1y")),
            "tickers": [
                {
                    "exchange": (t.get("market") or {}).get("name"),
                    "exchange_id": (t.get("market") or {}).get("identifier"),
                    "pair": f"{(t.get('base') or '').upper()}/{(t.get('target') or '').upper()}",
                    "price": _safe_number(t.get("converted_last", {}).get("usd")),
                    "volume": _safe_number(t.get("converted_volume", {}).get("usd")),
                    "trust_score": t.get("trust_score"),
                    "url": t.get("trade_url"),
                }
                for t in (data.get("tickers") or [])[:50]
            ],
            "sparkline_7d": ((market.get("sparkline_7d") or {}).get("price")) or [],
        }

    return _cached(f"coins:detail:{coin_id}", 60, fetch)


def _coin_chart(coin_id: str, days: str) -> dict[str, Any]:
    coin_id = coin_id.lower()
    safe_days = days if days in {"1", "7", "30", "90", "180", "365", "max"} else "30"

    def fetch() -> dict[str, Any]:
        url = f"https://api.coingecko.com/api/v3/coins/{urllib.parse.quote(coin_id)}/market_chart?vs_currency=usd&days={safe_days}"
        try:
            data = _http_get_json(url)
        except (urllib.error.HTTPError, urllib.error.URLError, socket.timeout, OSError):
            return {"prices": [], "market_caps": [], "total_volumes": []}
        return {
            "prices": data.get("prices") or [],
            "market_caps": data.get("market_caps") or [],
            "total_volumes": data.get("total_volumes") or [],
        }

    return _cached(f"coins:chart:{coin_id}:{safe_days}", 5 * 60, fetch)


def _defi_protocols() -> list[dict[str, Any]]:
    def fetch() -> list[dict[str, Any]]:
        data = _http_get_json("https://api.llama.fi/protocols")
        out: list[dict[str, Any]] = []
        for p in data or []:
            out.append(
                {
                    "id": p.get("id"),
                    "name": p.get("name"),
                    "slug": p.get("slug"),
                    "symbol": p.get("symbol"),
                    "logo": p.get("logo"),
                    "category": p.get("category"),
                    "chain": p.get("chain"),
                    "chains": p.get("chains") or [],
                    "tvl": _safe_number(p.get("tvl")),
                    "change_1d": _safe_number(p.get("change_1d")),
                    "change_7d": _safe_number(p.get("change_7d")),
                    "mcap": _safe_number(p.get("mcap")),
                    "url": p.get("url"),
                }
            )
        return out

    return _cached("defi:protocols", 3 * 60, fetch)


def _defi_protocol_detail(slug: str) -> dict[str, Any]:
    safe = re.sub(r"[^a-zA-Z0-9_-]", "", slug)

    def fetch() -> dict[str, Any]:
        data = _http_get_json(f"https://api.llama.fi/protocol/{safe}")
        history = []
        for entry in data.get("tvl") or []:
            history.append({"date": entry.get("date"), "tvl": _safe_number(entry.get("totalLiquidityUSD"))})
        return {
            "id": data.get("id"),
            "name": data.get("name"),
            "slug": data.get("slug"),
            "symbol": data.get("symbol"),
            "logo": data.get("logo"),
            "url": data.get("url"),
            "description": data.get("description"),
            "twitter": data.get("twitter"),
            "audits": data.get("audits"),
            "category": data.get("category"),
            "chain": data.get("chain"),
            "chains": data.get("chains") or [],
            "tvl": _safe_number(data.get("tvl")[-1]["totalLiquidityUSD"]) if data.get("tvl") else None,
            "tvl_history": history,
            "chain_tvls": data.get("currentChainTvls") or {},
            "mcap": _safe_number(data.get("mcap")),
            "change_1d": _safe_number(data.get("change_1d")),
            "change_7d": _safe_number(data.get("change_7d")),
        }

    return _cached(f"defi:protocol:{safe}", 5 * 60, fetch)


def _defi_yields() -> list[dict[str, Any]]:
    def fetch() -> list[dict[str, Any]]:
        data = _http_get_json("https://yields.llama.fi/pools")
        out: list[dict[str, Any]] = []
        for p in (data or {}).get("data", []):
            out.append(
                {
                    "pool": p.get("pool"),
                    "project": p.get("project"),
                    "chain": p.get("chain"),
                    "symbol": p.get("symbol"),
                    "tvlUsd": _safe_number(p.get("tvlUsd")),
                    "apy": _safe_number(p.get("apy")),
                    "apyBase": _safe_number(p.get("apyBase")),
                    "apyReward": _safe_number(p.get("apyReward")),
                    "ilRisk": p.get("ilRisk"),
                    "exposure": p.get("exposure"),
                    "stable": p.get("stablecoin"),
                    "url": p.get("url"),
                }
            )
        out.sort(key=lambda x: x["tvlUsd"] or 0, reverse=True)
        return out[:1000]

    return _cached("defi:yields", 3 * 60, fetch)


def _defi_yield_detail(pool: str) -> dict[str, Any]:
    safe = re.sub(r"[^a-zA-Z0-9_-]", "", pool)

    def fetch() -> dict[str, Any]:
        data = _http_get_json(f"https://yields.llama.fi/chart/{safe}")
        history = [
            {
                "ts": entry.get("timestamp"),
                "apy": _safe_number(entry.get("apy")),
                "tvlUsd": _safe_number(entry.get("tvlUsd")),
            }
            for entry in (data or {}).get("data", [])
        ]
        return {"pool": safe, "history": history[-365:]}

    return _cached(f"defi:yield:{safe}", 10 * 60, fetch)


def _defi_dex() -> list[dict[str, Any]]:
    def fetch() -> list[dict[str, Any]]:
        data = _http_get_json("https://api.llama.fi/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true")
        out: list[dict[str, Any]] = []
        for p in (data or {}).get("protocols", []):
            out.append(
                {
                    "name": p.get("name"),
                    "logo": p.get("logo"),
                    "category": p.get("category"),
                    "total24h": _safe_number(p.get("total24h")),
                    "total7d": _safe_number(p.get("total7d")),
                    "change_1d": _safe_number(p.get("change_1d")),
                    "chains": p.get("chains") or [],
                }
            )
        out.sort(key=lambda x: x["total24h"] or 0, reverse=True)
        return out

    return _cached("defi:dex", 5 * 60, fetch)


def _chains() -> list[dict[str, Any]]:
    def fetch() -> list[dict[str, Any]]:
        data = _http_get_json("https://api.llama.fi/v2/chains")
        out: list[dict[str, Any]] = []
        for c in data or []:
            out.append(
                {
                    "name": c.get("name"),
                    "tvl": _safe_number(c.get("tvl")),
                    "tokenSymbol": c.get("tokenSymbol"),
                    "chainId": c.get("chainId"),
                    "cmcId": c.get("cmcId"),
                    "gecko_id": c.get("gecko_id"),
                }
            )
        out.sort(key=lambda x: x["tvl"] or 0, reverse=True)
        return out

    return _cached("chains:list", 5 * 60, fetch)


def _chain_detail(name: str) -> dict[str, Any]:
    safe = urllib.parse.quote(name)

    def fetch() -> dict[str, Any]:
        history_raw = _http_get_json(f"https://api.llama.fi/v2/historicalChainTvl/{safe}")
        history = [
            {"date": entry.get("date"), "tvl": _safe_number(entry.get("tvl"))}
            for entry in history_raw or []
        ]
        protocols = _defi_protocols()
        chain_protocols = [p for p in protocols if (p.get("chain") or "").lower() == name.lower()]
        chain_protocols = sorted(chain_protocols, key=lambda p: p["tvl"] or 0, reverse=True)[:30]
        return {
            "name": name,
            "tvl": history[-1]["tvl"] if history else None,
            "history": history,
            "protocols": chain_protocols,
        }

    return _cached(f"chains:detail:{name}", 10 * 60, fetch)


def _bridges_routes(query: dict[str, list[str]]) -> dict[str, Any]:
    from_chain = int(query.get("fromChain", ["1"])[0])
    to_chain = int(query.get("toChain", ["10"])[0])
    from_token = query.get("fromToken", ["0x0000000000000000000000000000000000000000"])[0]
    to_token = query.get("toToken", ["0x0000000000000000000000000000000000000000"])[0]
    amount = query.get("amount", ["1000000000000000000"])[0]
    # LI.FI's /v1/quote requires a fromAddress; the quote response itself does not move funds.
    placeholder_address = "0x000000000000000000000000000000000000dEaD"
    from_address = query.get("fromAddress", [placeholder_address])[0] or placeholder_address
    to_address = query.get("toAddress", [from_address])[0] or from_address

    def fetch() -> dict[str, Any]:
        params = {
            "fromChain": from_chain,
            "toChain": to_chain,
            "fromToken": from_token,
            "toToken": to_token,
            "fromAmount": amount,
            "fromAddress": from_address,
            "toAddress": to_address,
            "integrator": "chainscope",
        }
        url = "https://li.quest/v1/quote?" + urllib.parse.urlencode(params)
        try:
            data = _http_get_json(url)
        except urllib.error.HTTPError as exc:
            return {"error": f"LI.FI returned {exc.code}", "routes": []}
        except (urllib.error.URLError, socket.timeout, OSError) as exc:
            return {"error": f"LI.FI unreachable: {exc}", "routes": []}
        estimate = data.get("estimate") or {}
        return {
            "routes": [
                {
                    "fromChain": from_chain,
                    "toChain": to_chain,
                    "fromToken": from_token,
                    "toToken": to_token,
                    "amount": amount,
                    "estimate": {
                        "toAmount": estimate.get("toAmount"),
                        "durationSec": _safe_number(estimate.get("executionDuration")),
                        "feeUsd": _safe_number(
                            sum(
                                _safe_number(c.get("amountUSD")) or 0
                                for c in estimate.get("feeCosts") or []
                            )
                        ),
                        "gasUsd": _safe_number(
                            sum(
                                _safe_number(c.get("amountUSD")) or 0
                                for c in estimate.get("gasCosts") or []
                            )
                        ),
                    },
                    "bridge": data.get("toolDetails", {}).get("name") or data.get("tool") or "unknown",
                }
            ]
        }

    return _cached(
        f"bridges:{from_chain}:{to_chain}:{from_token}:{to_token}:{amount}",
        60,
        fetch,
    )


def _gas_oracle() -> dict[str, Any]:
    def fetch() -> dict[str, Any]:
        # Etherscan V2 free tier; key optional
        key_part = f"&apikey={ETHERSCAN_API_KEY}" if ETHERSCAN_API_KEY else ""
        url = (
            "https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle" + key_part
        )
        data = _http_get_json(url)
        result = (data or {}).get("result") or {}
        return {
            "safe": _safe_number(result.get("SafeGasPrice")),
            "propose": _safe_number(result.get("ProposeGasPrice")),
            "fast": _safe_number(result.get("FastGasPrice")),
            "base_fee": _safe_number(result.get("suggestBaseFee")),
            "block": _safe_number(result.get("LastBlock")),
            "ts": int(time.time()),
        }

    fallback: dict[str, Any] = {
        "safe": None,
        "propose": None,
        "fast": None,
        "base_fee": None,
        "block": None,
        "ts": int(time.time()),
    }
    return _cached("tools:gas", 30, lambda: _safe_call("gas-oracle", fetch, fallback))


_GAS_HISTORY: list[dict[str, Any]] = []


def _gas_history() -> list[dict[str, Any]]:
    sample = _gas_oracle()
    _GAS_HISTORY.append(
        {
            "ts": sample.get("ts"),
            "base_fee": sample.get("base_fee"),
            "fast": sample.get("fast"),
        }
    )
    if len(_GAS_HISTORY) > 240:
        del _GAS_HISTORY[: len(_GAS_HISTORY) - 240]
    return _GAS_HISTORY[-120:]


def _wallet_eth_balances(address: str) -> dict[str, Any]:
    address = address.lower()

    def fetch() -> dict[str, Any]:
        url = f"https://api.ethplorer.io/getAddressInfo/{address}?apiKey=freekey"
        try:
            data = _http_get_json(url)
        except (urllib.error.HTTPError, urllib.error.URLError, socket.timeout, OSError) as exc:
            return {
                "address": address,
                "eth": {"balance": 0, "price": None, "value": 0},
                "tokens": [],
                "error": f"Ethplorer unreachable: {exc}",
            }
        eth = data.get("ETH") or {}
        tokens: list[dict[str, Any]] = []
        for t in data.get("tokens") or []:
            info = t.get("tokenInfo") or {}
            decimals = int(info.get("decimals") or 0)
            raw = _safe_number(t.get("balance"))
            qty = (raw / (10**decimals)) if (raw is not None and decimals >= 0) else None
            price = _safe_number((info.get("price") or {}).get("rate"))
            tokens.append(
                {
                    "address": info.get("address"),
                    "name": info.get("name"),
                    "symbol": info.get("symbol"),
                    "decimals": decimals,
                    "balance": qty,
                    "price": price,
                    "value": (qty * price) if (qty is not None and price is not None) else None,
                    "image": info.get("image"),
                }
            )
        tokens.sort(key=lambda x: x["value"] or 0, reverse=True)
        return {
            "address": address,
            "eth": {
                "balance": _safe_number(eth.get("balance")),
                "price": _safe_number((eth.get("price") or {}).get("rate")),
                "value": (
                    (_safe_number(eth.get("balance")) or 0)
                    * (_safe_number((eth.get("price") or {}).get("rate")) or 0)
                ),
            },
            "tokens": tokens,
        }

    return _cached(f"wallet:eth:{address}", 60, fetch)


def _wallet_etherscan_tokens(chain_id: int, address: str) -> dict[str, Any]:
    safe_addr = address.lower()
    key_part = f"&apikey={ETHERSCAN_API_KEY}" if ETHERSCAN_API_KEY else ""

    def fetch() -> dict[str, Any]:
        url = (
            f"https://api.etherscan.io/v2/api?chainid={chain_id}&module=account&action=tokenbalance"
            f"&contractaddress={safe_addr}&address={safe_addr}&tag=latest" + key_part
        )
        try:
            data = _http_get_json(url)
        except urllib.error.HTTPError:
            data = {"result": []}
        return {"chain_id": chain_id, "address": safe_addr, "raw": data}

    return _cached(f"wallet:es:{chain_id}:{safe_addr}", 60, fetch)


def _wallet_history(address: str, chain_id: int) -> dict[str, Any]:
    safe = address.lower()
    key_part = f"&apikey={ETHERSCAN_API_KEY}" if ETHERSCAN_API_KEY else ""

    def fetch() -> dict[str, Any]:
        url = (
            f"https://api.etherscan.io/v2/api?chainid={chain_id}&module=account&action=txlist"
            f"&address={safe}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc" + key_part
        )
        try:
            data = _http_get_json(url)
        except urllib.error.HTTPError as exc:
            return {"error": f"Etherscan {exc.code}", "txs": []}
        except (urllib.error.URLError, socket.timeout, OSError) as exc:
            return {"error": f"Etherscan unreachable: {exc}", "txs": []}
        # Etherscan V2 returns result as a string error message when the request is malformed
        # (e.g. missing API key, rate limit). Treat that as an empty list rather than crashing.
        if isinstance((data or {}).get("result"), str):
            return {"error": str(data.get("result")), "chain_id": chain_id, "address": safe, "txs": []}
        txs: list[dict[str, Any]] = []
        for t in (data or {}).get("result") or []:
            value_eth: float | None = None
            try:
                value_eth = int(t.get("value") or "0") / 10**18
            except (ValueError, TypeError):
                value_eth = None
            inp = t.get("input") or "0x"
            kind = "transfer"
            if inp and inp != "0x":
                if inp.startswith("0x095ea7b3"):
                    kind = "approve"
                elif inp.startswith("0xa9059cbb"):
                    kind = "erc20-transfer"
                elif inp.startswith("0x7ff36ab5") or inp.startswith("0x18cbafe5"):
                    kind = "swap"
                elif inp.startswith("0x40c10f19"):
                    kind = "mint"
                else:
                    kind = "contract"
            txs.append(
                {
                    "hash": t.get("hash"),
                    "from": t.get("from"),
                    "to": t.get("to"),
                    "value_eth": value_eth,
                    "block": t.get("blockNumber"),
                    "ts": int(t.get("timeStamp") or 0),
                    "is_error": t.get("isError") == "1",
                    "method": t.get("methodId") or None,
                    "kind": kind,
                    "gas_used": _safe_number(t.get("gasUsed")),
                }
            )
        return {"chain_id": chain_id, "address": safe, "txs": txs}

    return _cached(f"wallet:hist:{chain_id}:{safe}", 60, fetch)


def _onchain_contract(query: dict[str, list[str]]) -> dict[str, Any]:
    addr = (query.get("address", [""])[0] or "").lower()
    chain_id = int(query.get("chainId", ["1"])[0] or 1)
    if not re.fullmatch(r"0x[a-f0-9]{40}", addr):
        raise ValueError("invalid address")
    key_part = f"&apikey={ETHERSCAN_API_KEY}" if ETHERSCAN_API_KEY else ""

    def fetch() -> dict[str, Any]:
        url = (
            f"https://api.etherscan.io/v2/api?chainid={chain_id}&module=contract&action=getsourcecode"
            f"&address={addr}" + key_part
        )
        try:
            data = _http_get_json(url)
        except (urllib.error.HTTPError, urllib.error.URLError, socket.timeout, OSError) as exc:
            return {
                "address": addr,
                "chain_id": chain_id,
                "is_contract": False,
                "source_verified": False,
                "contract_name": None,
                "compiler": None,
                "abi": None,
                "source_code": None,
                "proxy": False,
                "implementation": None,
                "error": f"Etherscan unreachable: {exc}",
            }
        result = (data or {}).get("result")
        # Etherscan V2 returns a string in `result` for errors / unverified contracts.
        if isinstance(result, str):
            return {
                "address": addr,
                "chain_id": chain_id,
                "is_contract": False,
                "source_verified": False,
                "contract_name": None,
                "compiler": None,
                "abi": None,
                "source_code": None,
                "proxy": False,
                "implementation": None,
                "error": result,
            }
        first = (result or [{}])[0]
        if not isinstance(first, dict):
            first = {}
        is_contract = bool(first.get("ABI") and first.get("ABI") != "Contract source code not verified")
        abi: Any = None
        if is_contract:
            try:
                abi = json.loads(first.get("ABI") or "[]")
            except json.JSONDecodeError:
                abi = None
        return {
            "address": addr,
            "chain_id": chain_id,
            "is_contract": is_contract,
            "source_verified": is_contract,
            "contract_name": first.get("ContractName") or None,
            "compiler": first.get("CompilerVersion") or None,
            "abi": abi,
            "source_code": (first.get("SourceCode") or None),
            "proxy": str(first.get("Proxy") or "0") == "1",
            "implementation": first.get("Implementation") or None,
        }

    return _cached(f"onchain:contract:{chain_id}:{addr}", 5 * 60, fetch)


def _news_latest(query: dict[str, list[str]]) -> dict[str, Any]:
    cat = (query.get("category", [""])[0] or "").strip()

    def fetch_cc() -> list[dict[str, Any]]:
        params = {"lang": "EN"}
        if cat:
            params["categories"] = cat.upper()
        url = "https://min-api.cryptocompare.com/data/v2/news/?" + urllib.parse.urlencode(params)
        data = _http_get_json(url)
        out: list[dict[str, Any]] = []
        for n in (data or {}).get("Data", []):
            out.append(
                {
                    "id": str(n.get("id") or n.get("guid") or n.get("url")),
                    "title": n.get("title"),
                    "url": n.get("url"),
                    "source": (n.get("source_info") or {}).get("name") or n.get("source") or "",
                    "body": n.get("body") or "",
                    "imageurl": n.get("imageurl"),
                    "published_on": int(n.get("published_on") or 0),
                    "categories": n.get("categories") or "",
                }
            )
        return out

    def fetch_rss(url: str, source: str) -> list[dict[str, Any]]:
        raw = _http_get(url, accept="application/rss+xml")
        try:
            tree = ElementTree.fromstring(raw)
        except ElementTree.ParseError:
            return []
        items: list[dict[str, Any]] = []
        for item in tree.iter("item"):
            title_el = item.find("title")
            link_el = item.find("link")
            desc_el = item.find("description")
            pub_el = item.find("pubDate")
            ts = 0
            if pub_el is not None and pub_el.text:
                try:
                    import email.utils as eu

                    parsed = eu.parsedate_tz(pub_el.text)
                    if parsed:
                        ts = int(eu.mktime_tz(parsed))
                except Exception:  # noqa: BLE001
                    ts = 0
            items.append(
                {
                    "id": (link_el.text or "")[:120],
                    "title": (title_el.text or "")[:280],
                    "url": link_el.text or "",
                    "source": source,
                    "body": (desc_el.text or "")[:600],
                    "imageurl": None,
                    "published_on": ts,
                    "categories": "",
                }
            )
        return items[:25]

    def fetch_all() -> list[dict[str, Any]]:
        merged = (
            (_safe_call("cryptocompare", fetch_cc, []) or [])
            + (_safe_call("cointelegraph", lambda: fetch_rss("https://cointelegraph.com/rss", "Cointelegraph"), []) or [])
            + (_safe_call("bitcoinmagazine", lambda: fetch_rss("https://bitcoinmagazine.com/.rss/full/", "Bitcoin Magazine"), []) or [])
        )
        merged.sort(key=lambda n: n["published_on"] or 0, reverse=True)
        return merged[:120]

    return _cached(f"news:{cat or 'all'}", 90, lambda: {"articles": fetch_all()})


def _news_token(query: dict[str, list[str]]) -> dict[str, Any]:
    sym = (query.get("symbol", [""])[0] or "").strip().upper()

    def fetch() -> list[dict[str, Any]]:
        if not sym:
            return []
        params = {"lang": "EN", "categories": sym}
        url = "https://min-api.cryptocompare.com/data/v2/news/?" + urllib.parse.urlencode(params)
        data = _http_get_json(url)
        return [
            {
                "id": str(n.get("id")),
                "title": n.get("title"),
                "url": n.get("url"),
                "source": (n.get("source_info") or {}).get("name") or "",
                "body": n.get("body") or "",
                "imageurl": n.get("imageurl"),
                "published_on": int(n.get("published_on") or 0),
                "categories": n.get("categories") or "",
            }
            for n in (data or {}).get("Data", [])
        ]

    return _cached(f"news:token:{sym}", 5 * 60, lambda: {"articles": fetch()})


def _sentiment_history() -> dict[str, Any]:
    def fetch() -> dict[str, Any]:
        data = _http_get_json("https://api.alternative.me/fng/?limit=120")
        history = [
            {
                "ts": int(d.get("timestamp") or 0),
                "value": int(d.get("value") or 0),
                "classification": d.get("value_classification"),
            }
            for d in (data or {}).get("data", [])
        ]
        history.sort(key=lambda x: x["ts"])
        return {"history": history, "latest": history[-1] if history else None}

    return _cached("sentiment", 10 * 60, fetch)


def _swap_quote(query: dict[str, list[str]]) -> dict[str, Any]:
    chain_id = int(query.get("chainId", ["1"])[0] or 1)
    src = query.get("src", [""])[0]
    dst = query.get("dst", [""])[0]
    amount = query.get("amount", ["1000000000000000000"])[0]

    def fetch() -> dict[str, Any]:
        params = {"src": src, "dst": dst, "amount": amount}
        url = (
            f"https://api.1inch.dev/swap/v6.0/{chain_id}/quote?" + urllib.parse.urlencode(params)
        )
        try:
            data = _http_get_json(url)
        except (urllib.error.HTTPError, urllib.error.URLError, socket.timeout, OSError):
            # Public 1inch endpoint without API key is best-effort. Fall back.
            return {
                "from_token": src,
                "to_token": dst,
                "from_amount": amount,
                "to_amount": "0",
                "estimated_gas": None,
                "protocols": None,
                "error": "1inch quote unavailable for this pair without an API key.",
            }
        return {
            "from_token": src,
            "to_token": dst,
            "from_amount": amount,
            "to_amount": str(data.get("dstAmount") or data.get("toAmount") or "0"),
            "estimated_gas": _safe_number(data.get("gas") or data.get("estimatedGas")),
            "protocols": data.get("protocols"),
        }

    return _cached(f"swap:{chain_id}:{src}:{dst}:{amount}", 30, fetch)


def _nft_trending() -> dict[str, Any]:
    def fetch() -> dict[str, Any]:
        url = "https://api.reservoir.tools/collections/trending/v1?period=24h&limit=24"
        try:
            data = _http_get_json(url)
        except (urllib.error.HTTPError, urllib.error.URLError, socket.timeout, OSError):
            data = {"collections": []}
        out: list[dict[str, Any]] = []
        for c in data.get("collections") or []:
            floor = ((c.get("floorAsk") or {}).get("price") or {}).get("amount") or {}
            out.append(
                {
                    "slug": c.get("slug") or c.get("id"),
                    "name": c.get("name"),
                    "image": c.get("image"),
                    "floor_eth": _safe_number(floor.get("native") or floor.get("decimal")),
                    "floor_change_24h": _safe_number(c.get("floorAskPercentChange")),
                    "volume_eth": _safe_number((c.get("volume") or {}).get("1day")),
                    "owners": c.get("ownerCount"),
                    "supply": c.get("tokenCount"),
                }
            )
        return {"collections": out}

    return _cached("nft:trending", 5 * 60, fetch)


def _nft_floor(query: dict[str, list[str]]) -> dict[str, Any]:
    slug = (query.get("slug", [""])[0] or "").strip()
    if not slug:
        return {"history": []}

    def fetch() -> dict[str, Any]:
        url = (
            "https://api.reservoir.tools/collections/v7?slug="
            + urllib.parse.quote(slug)
            + "&limit=1"
        )
        try:
            data = _http_get_json(url)
        except (urllib.error.HTTPError, urllib.error.URLError, socket.timeout, OSError):
            return {"collection": None}
        coll = (data.get("collections") or [{}])[0]
        floor = ((coll.get("floorAsk") or {}).get("price") or {}).get("amount") or {}
        return {
            "collection": {
                "slug": coll.get("slug"),
                "name": coll.get("name"),
                "image": coll.get("image"),
                "floor_eth": _safe_number(floor.get("native") or floor.get("decimal")),
                "supply": coll.get("tokenCount"),
                "owners": coll.get("ownerCount"),
            }
        }

    return _cached(f"nft:floor:{slug}", 5 * 60, fetch)


def _nft_wallet(query: dict[str, list[str]]) -> dict[str, Any]:
    addr = (query.get("address", [""])[0] or "").lower()
    if not re.fullmatch(r"0x[a-f0-9]{40}", addr):
        raise ValueError("invalid address")

    def fetch() -> dict[str, Any]:
        url = (
            "https://api.reservoir.tools/users/"
            + addr
            + "/collections/v3?limit=20&sortBy=allTimeVolume"
        )
        try:
            data = _http_get_json(url)
        except (urllib.error.HTTPError, urllib.error.URLError, socket.timeout, OSError):
            data = {"collections": []}
        out: list[dict[str, Any]] = []
        for c in data.get("collections") or []:
            coll = c.get("collection") or {}
            ownership = c.get("ownership") or {}
            floor = ((coll.get("floorAskPrice") or {}).get("amount") or {})
            out.append(
                {
                    "slug": coll.get("slug") or coll.get("id"),
                    "name": coll.get("name"),
                    "image": coll.get("image"),
                    "token_count": ownership.get("tokenCount"),
                    "floor_eth": _safe_number(floor.get("native") or floor.get("decimal")),
                    "value_eth": _safe_number(ownership.get("totalValue")),
                }
            )
        return {"collections": out}

    return _cached(f"nft:wallet:{addr}", 60, fetch)


def _whales(query: dict[str, list[str]]) -> dict[str, Any]:
    coin_id = (query.get("coin", ["bitcoin"])[0] or "bitcoin").lower()

    def fetch() -> dict[str, Any]:
        # Use CoinGecko 'top holders' endpoint via 'coins/{id}/contract' fallback to
        # public Etherscan token-holder list when applicable. Without an API key
        # our reach is limited, so return a curated public list of "smart money"
        # addresses derived from public sources.
        smart_money = [
            {"label": "Binance Hot Wallet", "address": "0x28C6c06298d514Db089934071355E5743bf21d60", "chain": 1},
            {"label": "Coinbase 1", "address": "0x71660c4005BA85c37ccec55d0C4493E66Fe775d3", "chain": 1},
            {"label": "Vitalik.eth", "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", "chain": 1},
            {"label": "Wintermute", "address": "0x0000000000A39bb272e79075ade125fd351887Ac", "chain": 1},
            {"label": "Jump Trading", "address": "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621", "chain": 1},
            {"label": "Justin Sun", "address": "0x176F3DAb24a159341c0509bB36B833E7fdd0a132", "chain": 1},
            {"label": "Mark Cuban", "address": "0x73BCEb1Cd57C711feaC4224D062b0F6ff338501e", "chain": 1},
            {"label": "Three Arrows (3AC)", "address": "0x1F9090aaE28b8a3dCeaDf281B0F12828e676c326", "chain": 1},
            {"label": "Kraken", "address": "0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2", "chain": 1},
            {"label": "Tether Treasury", "address": "0x5754284f345afc66a98fbB0a0Afe71e0F007B949", "chain": 1},
        ]
        return {"coin": coin_id, "wallets": smart_money}

    return _cached(f"whales:{coin_id}", 30 * 60, fetch)


def _api_health() -> dict[str, Any]:
    checks = [
        ("coingecko", "https://api.coingecko.com/api/v3/ping"),
        ("defillama", "https://api.llama.fi/protocols"),
        ("alternative_me", "https://api.alternative.me/fng/?limit=1"),
        ("cryptocompare", "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"),
        ("etherscan", "https://api.etherscan.io/v2/api?chainid=1&module=stats&action=ethsupply"),
        ("ethplorer", "https://api.ethplorer.io/getTop?apiKey=freekey&limit=1"),
        ("reservoir", "https://api.reservoir.tools/chain/stats/v1"),
    ]
    results: list[dict[str, Any]] = []
    for name, url in checks:
        try:
            _http_get(url, timeout=6)
            results.append({"name": name, "ok": True})
        except (urllib.error.URLError, urllib.error.HTTPError, socket.timeout) as exc:
            results.append({"name": name, "ok": False, "error": str(exc)})
    return {"ok": all(r["ok"] for r in results), "ts": int(time.time()), "checks": results}


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------


def _dispatch(path: str, query: dict[str, list[str]]) -> tuple[int, dict[str, Any]]:
    """Return (status_code, body_dict) for the given path."""
    if path in {"/healthz", "/api/index", "/api/", "/api"}:
        return 200, {"ok": True, "service": "chainscope", "ts": int(time.time())}

    if path == "/api/markets/overview":
        return 200, _markets_overview()
    if path == "/api/markets/top":
        return 200, {"coins": _markets_top(query)}
    if path == "/api/markets/categories":
        return 200, {"categories": _markets_categories()}
    if path == "/api/markets/trending":
        return 200, _markets_trending()
    if path == "/api/markets/stablecoins":
        return 200, {"stablecoins": _markets_stablecoins()}

    coin_match = re.fullmatch(r"/api/coins/([a-z0-9._-]+)", path)
    if coin_match:
        return 200, _coin_detail(coin_match.group(1))
    chart_match = re.fullmatch(r"/api/coins/([a-z0-9._-]+)/chart", path)
    if chart_match:
        days = (query.get("days", ["30"])[0] or "30")
        return 200, _coin_chart(chart_match.group(1), days)

    if path == "/api/defi/protocols":
        return 200, {"protocols": _defi_protocols()}
    proto_match = re.fullmatch(r"/api/defi/protocols/([a-zA-Z0-9_-]+)", path)
    if proto_match:
        return 200, _defi_protocol_detail(proto_match.group(1))
    if path == "/api/defi/yields":
        return 200, {"pools": _defi_yields()}
    yld_match = re.fullmatch(r"/api/defi/yields/([a-zA-Z0-9_-]+)", path)
    if yld_match:
        return 200, _defi_yield_detail(yld_match.group(1))
    if path == "/api/defi/dex":
        return 200, {"dexs": _defi_dex()}
    if path == "/api/defi/categories":
        return 200, {"categories": _markets_categories()}

    if path == "/api/chains":
        return 200, {"chains": _chains()}
    chain_match = re.fullmatch(r"/api/chains/([A-Za-z0-9 _.-]+)", path)
    if chain_match:
        return 200, _chain_detail(urllib.parse.unquote(chain_match.group(1)))
    if path == "/api/bridges/quote":
        return 200, _bridges_routes(query)

    if path == "/api/tools/gas":
        return 200, _gas_oracle()
    if path == "/api/tools/gas-history":
        return 200, {"history": _gas_history()}
    if path == "/api/tools/swap":
        return 200, _swap_quote(query)

    if path == "/api/wallet/eth":
        addr = (query.get("address", [""])[0] or "").lower()
        if not re.fullmatch(r"0x[a-f0-9]{40}", addr):
            return 400, {"error": "invalid address"}
        return 200, _wallet_eth_balances(addr)
    if path == "/api/wallet/tokens":
        addr = (query.get("address", [""])[0] or "").lower()
        chain_id = int(query.get("chainId", ["1"])[0] or 1)
        if not re.fullmatch(r"0x[a-f0-9]{40}", addr):
            return 400, {"error": "invalid address"}
        return 200, _wallet_etherscan_tokens(chain_id, addr)
    if path == "/api/wallet/history":
        addr = (query.get("address", [""])[0] or "").lower()
        chain_id = int(query.get("chainId", ["1"])[0] or 1)
        if not re.fullmatch(r"0x[a-f0-9]{40}", addr):
            return 400, {"error": "invalid address"}
        return 200, _wallet_history(addr, chain_id)
    if path == "/api/wallet/nfts":
        return 200, _nft_wallet(query)

    if path == "/api/onchain/contract":
        return 200, _onchain_contract(query)
    if path == "/api/onchain/whales":
        return 200, _whales(query)

    if path == "/api/nft/trending":
        return 200, _nft_trending()
    if path == "/api/nft/floor":
        return 200, _nft_floor(query)

    if path == "/api/news":
        return 200, _news_latest(query)
    if path == "/api/news/token":
        return 200, _news_token(query)
    if path == "/api/sentiment":
        return 200, _sentiment_history()

    if path == "/api/health":
        return 200, _api_health()

    return 404, {"error": f"unknown endpoint: {path}"}


# ---------------------------------------------------------------------------
# BaseHTTPRequestHandler — Vercel Python runtime entrypoint
# ---------------------------------------------------------------------------


class handler(BaseHTTPRequestHandler):  # noqa: N801 - Vercel expects lowercase
    server_version = "CS/1.0"

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002, ARG002
        return  # silence default stderr logging in serverless

    def _send_cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "public, max-age=15")

    def _respond(self, status: int, body: Any) -> None:
        payload = json.dumps(body, ensure_ascii=False, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self._send_cors()
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._send_cors()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        try:
            parsed = urllib.parse.urlparse(self.path)
            path = parsed.path
            query = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
            status, body = _dispatch(path, query)
        except ValueError as exc:
            status, body = 400, {"error": str(exc)}
        except Exception as exc:  # noqa: BLE001
            status, body = 500, {"error": f"internal: {exc}"}
        self._respond(status, body)


# ---------------------------------------------------------------------------
# Local dev runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    from http.server import HTTPServer

    port = int(os.environ.get("PORT", "3000"))
    print(f"ChainScope API listening on :{port}")
    HTTPServer(("0.0.0.0", port), handler).serve_forever()

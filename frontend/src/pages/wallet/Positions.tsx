import { useMemo } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoinThumb } from "@/components/common/CoinThumb";
import { RequireWallet } from "@/components/wallet/RequireWallet";
import { useEthWallet } from "@/hooks/queries";
import { formatCurrency } from "@/lib/utils";

const PROTOCOL_HINTS: { match: RegExp; protocol: string; href: string }[] = [
  { match: /^(a|stk-?|am3|av-)?aweth|^a-?eth|aave-?/i, protocol: "Aave", href: "/defi/protocols/aave-v3" },
  { match: /comp|^c-?eth|^c-?usdc|^c-?dai/i, protocol: "Compound", href: "/defi/protocols/compound-v3" },
  { match: /uni-?v3|uniswap/i, protocol: "Uniswap V3 LP", href: "/defi/protocols/uniswap-v3" },
  { match: /curve|^crv|^3crv|^crv-?steth/i, protocol: "Curve", href: "/defi/protocols/curve-finance" },
  { match: /pendle|pt-|yt-|sy-/i, protocol: "Pendle", href: "/defi/protocols/pendle" },
  { match: /lido|steth|wsteth/i, protocol: "Lido", href: "/defi/protocols/lido" },
  { match: /balancer|^bpt|^bal-?/i, protocol: "Balancer", href: "/defi/protocols/balancer-v2" },
  { match: /^morpho|maw/i, protocol: "Morpho", href: "/defi/protocols/morpho" },
];

interface Row {
  address: string;
  name: string;
  symbol: string;
  balance: number | null;
  value: number | null;
  protocol: string;
  href: string;
}

export function WalletPositionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="DeFi Positions" description="Heuristic detection of LP / lending tokens in your wallet." />
      <RequireWallet>{(address) => <Inner address={address} />}</RequireWallet>
    </div>
  );
}

function Inner({ address }: { address: `0x${string}` }) {
  const wallet = useEthWallet(address);
  const tokens = wallet.data?.tokens ?? [];
  const positions: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const t of tokens) {
      for (const hint of PROTOCOL_HINTS) {
        if (hint.match.test(t.symbol ?? "") || hint.match.test(t.name ?? "")) {
          out.push({
            address: t.address,
            name: t.name,
            symbol: t.symbol,
            balance: t.balance,
            value: t.value,
            protocol: hint.protocol,
            href: hint.href,
          });
          break;
        }
      }
    }
    return out.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  }, [tokens]);

  const grouped = useMemo(() => {
    const map = new Map<string, { rows: Row[]; total: number; href: string }>();
    for (const p of positions) {
      const entry = map.get(p.protocol) ?? { rows: [], total: 0, href: p.href };
      entry.rows.push(p);
      entry.total += p.value ?? 0;
      map.set(p.protocol, entry);
    }
    return Array.from(map.entries()).map(([protocol, value]) => ({ protocol, ...value }));
  }, [positions]);

  return (
    <QueryState isLoading={wallet.isLoading} error={wallet.error} isEmpty={grouped.length === 0} emptyMessage="No DeFi positions detected on Ethereum mainnet.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {grouped.map((g) => (
          <Card key={g.protocol}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{g.protocol}</CardTitle>
              <Link to={g.href} className="text-xs text-primary hover:underline">
                Protocol →
              </Link>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Estimated total</div>
              <div className="num text-xl font-semibold">{formatCurrency(g.total)}</div>
              <div className="mt-3 space-y-1">
                {g.rows.map((r) => (
                  <div key={r.address} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <CoinThumb src={null} alt={r.symbol ?? "?"} size={18} />
                      <span className="font-medium">{r.symbol}</span>
                      <Badge variant="outline" className="text-[10px]">{r.name}</Badge>
                    </span>
                    <span className="num">{formatCurrency(r.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </QueryState>
  );
}

import { useMemo } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CalendarEntry {
  date: string;
  title: string;
  category: "mint" | "reveal" | "snapshot" | "claim";
  description: string;
  link: string | null;
}

const ENTRIES: CalendarEntry[] = [
  {
    date: "T+1d",
    title: "Aave GHO mainnet liquidity expansion",
    category: "snapshot",
    description: "GHO governance proposal goes live for community vote.",
    link: "https://app.aave.com",
  },
  {
    date: "T+3d",
    title: "Pudgy Penguins: PENGU staking v2",
    category: "claim",
    description: "Staking v2 contract opens; previous deposits auto-migrate.",
    link: "https://pudgypenguins.com",
  },
  {
    date: "T+5d",
    title: "ENS DAO airdrop snapshot",
    category: "snapshot",
    description: "Snapshot block for the next round of ENS rewards.",
    link: "https://ens.domains",
  },
  {
    date: "T+7d",
    title: "Yuga Labs: TwelveFold mint",
    category: "mint",
    description: "Limited mint window for whitelisted holders.",
    link: "https://yuga.com",
  },
  {
    date: "T+10d",
    title: "OpenSea Studio reveal",
    category: "reveal",
    description: "New on-chain reveal mechanic for OpenSea Studio creators.",
    link: "https://opensea.io",
  },
];

export function NftCalendarPage() {
  const grouped = useMemo(() => ENTRIES, []);
  return (
    <div className="space-y-4">
      <PageHeader
        title="NFT Calendar"
        description="Curated catalogue of upcoming mints, snapshots, reveals and claim windows."
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {grouped.map((e) => (
          <Card key={`${e.date}-${e.title}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{e.title}</span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {e.category}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{e.date}</div>
              <p className="mt-1 text-sm">{e.description}</p>
              {e.link ? (
                <a
                  href={e.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-primary hover:underline"
                >
                  Project site ↗
                </a>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

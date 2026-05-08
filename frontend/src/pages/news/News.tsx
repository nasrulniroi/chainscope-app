import { useState } from "react";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNews } from "@/hooks/queries";
import { timeAgo } from "@/lib/utils";

const ALL_CATEGORIES = "all";

const CATEGORIES = [
  { id: ALL_CATEGORIES, label: "All" },
  { id: "BTC", label: "Bitcoin" },
  { id: "ETH", label: "Ethereum" },
  { id: "DeFi", label: "DeFi" },
  { id: "NFT", label: "NFTs" },
  { id: "Trading", label: "Trading" },
  { id: "Regulation", label: "Regulation" },
  { id: "Mining", label: "Mining" },
];

export function NewsPage() {
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const news = useNews(category === ALL_CATEGORIES ? "" : category);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Latest News"
        description="Headlines from CryptoCompare, Cointelegraph and Bitcoin Magazine."
        actions={
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <QueryState isLoading={news.isLoading} error={news.error} isEmpty={(news.data?.articles?.length ?? 0) === 0} emptyMessage="No headlines for this category right now.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(news.data?.articles ?? []).slice(0, 60).map((a) => (
            <Card key={`${a.id}-${a.url}`}>
              <CardContent className="pt-4">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium hover:text-primary"
                >
                  {a.title}
                </a>
                {a.body ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">
                    {a.source}
                  </Badge>
                  {(a.categories ? a.categories.split("|").filter(Boolean).slice(0, 3) : []).map((c) => (
                    <Badge key={c} variant="secondary" className="text-[10px]">
                      {c}
                    </Badge>
                  ))}
                  <span className="ml-auto">{timeAgo(a.published_on * 1000)}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

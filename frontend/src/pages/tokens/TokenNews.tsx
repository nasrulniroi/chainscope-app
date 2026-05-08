import { Link, useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { useCoinDetail, useTokenNews } from "@/hooks/queries";
import { timeAgo } from "@/lib/utils";

export function TokenNewsPage() {
  const { id } = useParams<{ id: string }>();
  const detail = useCoinDetail(id);
  const symbol = detail.data?.symbol?.toUpperCase();
  const news = useTokenNews(symbol);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${detail.data?.name ?? id} news`}
        description="Headlines mentioning this token from CryptoCompare."
        actions={
          <Link to={`/tokens/${id}`} className="text-xs text-primary hover:underline">
            ← Back to detail
          </Link>
        }
      />
      <QueryState
        isLoading={news.isLoading}
        error={news.error}
        isEmpty={(news.data?.articles?.length ?? 0) === 0}
        emptyMessage="No recent token-specific articles found."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(news.data?.articles ?? []).slice(0, 30).map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-4">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium hover:text-primary"
                >
                  {a.title}
                </a>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{a.source}</span>
                  <span>·</span>
                  <span>{timeAgo(a.published_on * 1000)}</span>
                  <ExternalLink className="ml-auto h-3 w-3 opacity-60" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

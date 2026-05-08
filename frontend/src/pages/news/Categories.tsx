import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { useNews } from "@/hooks/queries";
import { useMemo } from "react";

export function NewsCategoriesPage() {
  const news = useNews("");

  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    (news.data?.articles ?? []).forEach((a) => {
      if (!a.categories) return;
      a.categories
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((c) => map.set(c, (map.get(c) ?? 0) + 1));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 36);
  }, [news.data]);

  return (
    <div className="space-y-4">
      <PageHeader title="News categories" description="Frequency of categories across the latest 50 headlines." />
      <QueryState isLoading={news.isLoading} error={news.error}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {grouped.map(([name, count]) => (
            <Card key={name}>
              <CardHeader>
                <CardTitle className="text-sm">{name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="num text-2xl font-semibold">{count}</div>
                <div className="text-xs text-muted-foreground">articles</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApiHealth } from "@/hooks/queries";

export function SettingsApiPage() {
  const health = useApiHealth();
  return (
    <div className="space-y-4">
      <PageHeader title="API Health" description="Check connectivity to upstream data providers and the ChainScope backend." />
      <QueryState isLoading={health.isLoading} error={health.error}>
        <Card>
          <CardHeader>
            <CardTitle>
              Backend status: {health.data?.ok ? <Badge variant="success">healthy</Badge> : <Badge variant="destructive">issue</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Provider</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {(health.data?.checks ?? []).map((c) => (
                    <tr key={c.name} className="border-t border-border/60">
                      <td className="px-3 py-2 font-medium">{c.name}</td>
                      <td className="px-3 py-2">
                        {c.ok ? <Badge variant="success">ok</Badge> : <Badge variant="destructive">fail</Badge>}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.error ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </QueryState>
    </div>
  );
}

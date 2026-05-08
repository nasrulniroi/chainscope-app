import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { changeColor } from "@/lib/utils";

interface Props {
  label: string;
  value: ReactNode;
  change?: number | null;
  changeLabel?: string;
  hint?: string;
  icon?: ReactNode;
}

export function MetricCard({ label, value, change, changeLabel, hint, icon }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase tracking-wide">{label}</span>
          {icon ?? null}
        </div>
        <div className="num text-xl font-semibold leading-tight md:text-2xl">{value}</div>
        {change !== undefined && change !== null ? (
          <div className={`num text-xs ${changeColor(change)}`}>
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}% {changeLabel ?? "24h"}
          </div>
        ) : hint ? (
          <div className="text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

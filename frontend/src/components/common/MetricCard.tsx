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
    <Card className="group">
      <CardContent className="flex flex-col gap-1.5 pt-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>{label}</span>
          {icon ?? null}
        </div>
        <div className="num text-xl font-bold leading-tight md:text-2xl gradient-text">{value}</div>
        {change !== undefined && change !== null ? (
          <div className={`num text-xs font-medium ${changeColor(change)}`}>
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

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  isLoading: boolean;
  error: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  skeleton?: ReactNode;
  children: ReactNode;
}

export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyMessage = "No data available right now.",
  skeleton,
  children,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {skeleton ?? (
          <>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        )}
      </div>
    );
  }
  if (error) {
    const msg = error instanceof Error ? error.message : "Failed to load.";
    return (
      <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <div className="font-medium">Couldn&apos;t fetch data</div>
          <div className="text-xs opacity-80">{msg}</div>
        </div>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return <>{children}</>;
}

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: Omit<Toast, "id">) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((prev) => [...prev, { id, ...input }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon =
            t.type === "success"
              ? CheckCircle2
              : t.type === "error"
                ? XCircle
                : t.type === "warning"
                  ? TriangleAlert
                  : Info;
          const tone =
            t.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
              : t.type === "error"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
                : t.type === "warning"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                  : "border-sky-500/40 bg-sky-500/10 text-sky-100";
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-md border p-3 shadow-lg backdrop-blur",
                tone,
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <div className="font-medium">{t.title}</div>
                {t.description ? <div className="text-xs opacity-90">{t.description}</div> : null}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="opacity-70 transition hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

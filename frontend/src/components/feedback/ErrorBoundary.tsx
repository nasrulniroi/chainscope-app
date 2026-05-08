import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (typeof console !== "undefined") {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-base font-semibold">Something went wrong</h2>
          </div>
          <p className="text-sm">
            {this.state.error.message || "An unexpected error occurred while rendering this view."}
          </p>
          <button
            type="button"
            className="mt-2 rounded-md border border-destructive/40 px-3 py-1 text-xs font-medium hover:bg-destructive/20"
            onClick={() => this.setState({ error: null })}
          >
            Dismiss
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

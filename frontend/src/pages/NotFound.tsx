import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Compass className="mb-3 h-10 w-10 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Lost in the on-chain wilderness</h1>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t find the page you were looking for. Check the URL or jump back to the
        market overview.
      </p>
      <div className="mt-4 flex gap-2">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/markets/overview">Markets</Link>
        </Button>
      </div>
    </div>
  );
}

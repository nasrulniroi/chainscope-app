import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Moon, Search, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/providers/SettingsProvider";
import { findRouteByPath } from "@/routes/config";

export function Topbar() {
  const { theme, toggleTheme } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [crumbs, setCrumbs] = useState<{ label: string; to?: string }[]>([]);

  useEffect(() => {
    const { section, leaf } = findRouteByPath(location.pathname);
    const parts: { label: string; to?: string }[] = [{ label: "Home", to: "/" }];
    if (section) {
      parts.push({ label: section.label, to: section.items[0]?.to ?? section.basePath });
    }
    if (leaf) parts.push({ label: leaf.label });
    setCrumbs(parts);
  }, [location.pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    if (q.startsWith("0x") && q.length === 42) {
      navigate(`/onchain/wallet-lookup?address=${q}`);
    } else {
      navigate(`/tokens/${encodeURIComponent(q.toLowerCase())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {crumbs.map((c, idx) => (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-muted-foreground/50">/</span>}
            {c.to ? (
              <Link to={c.to} className="hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <form onSubmit={handleSubmit} className="ml-auto hidden md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search token or address (0x…)"
            className="h-8 w-72 pl-8"
            aria-label="Global search"
          />
        </div>
      </form>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={toggleTheme}
        className="h-8 w-8"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
    </header>
  );
}

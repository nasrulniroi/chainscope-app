import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Search, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/providers/SettingsProvider";
import { findRouteByPath } from "@/routes/config";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { leafSlug } from "@/i18n";

export function Topbar() {
  const { theme, toggleTheme } = useSettings();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [crumbs, setCrumbs] = useState<{ label: string; to?: string }[]>([]);

  useEffect(() => {
    const { section, leaf } = findRouteByPath(location.pathname);
    const parts: { label: string; to?: string }[] = [{ label: t("nav.home"), to: "/" }];
    if (section) {
      parts.push({
        label: t(`nav.sections.${section.id}.label`, { defaultValue: section.label }),
        to: section.landingPath,
      });
    }
    if (leaf && section) {
      const slug = leafSlug(section.basePath, leaf.to);
      parts.push({
        label: t(`nav.items.${section.id}.${slug}.label`, { defaultValue: leaf.label }),
      });
    }
    setCrumbs(parts);
  }, [location.pathname, t]);

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
    <header className="sticky top-0 z-30 flex h-12 flex-shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
            placeholder={t("topbar.searchPlaceholder")}
            className="h-8 w-72 pl-8"
            aria-label={t("topbar.searchPlaceholder")}
          />
        </div>
      </form>
      <LanguageSwitcher />
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("topbar.themeToggle")}
        title={t("topbar.themeToggle")}
        onClick={toggleTheme}
        className="h-8 w-8"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <ConnectWalletButton />
    </header>
  );
}

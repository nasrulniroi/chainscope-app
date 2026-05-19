import { useState, useMemo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Home,
  Layers,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { NAV_SECTIONS, findRouteByPath } from "@/routes/config";
import type { RouteSection } from "@/routes/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/SettingsProvider";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { leafSlug } from "@/i18n";

interface Props {
  onOpenMobile: () => void;
  walletConnected: boolean;
}

export function TopNav({ onOpenMobile, walletConnected }: Props) {
  const { theme, toggleTheme } = useSettings();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const activeSectionId = useMemo(() => {
    const { section } = findRouteByPath(location.pathname);
    return section?.id ?? null;
  }, [location.pathname]);

  const visibleSections = NAV_SECTIONS.filter(
    (s) => !s.walletGated || walletConnected,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    if (q.startsWith("0x") && q.length === 42) {
      navigate(`/onchain/wallet-lookup?address=${q}`);
    } else {
      navigate(`/tokens/${encodeURIComponent(q.toLowerCase())}`);
    }
    setSearch("");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      {/* Top bar: brand + actions */}
      <div className="flex h-11 items-center gap-3 px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={onOpenMobile}
          className="h-8 w-8 flex-shrink-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 mr-4">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20">
            <Layers className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-display text-sm font-bold tracking-wider uppercase text-foreground hidden sm:inline">
            ChainScope
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-0.5 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )
            }
          >
            <Home className="h-3.5 w-3.5" />
            {t("nav.home")}
          </NavLink>

          {visibleSections.map((section) => {
            const isActive = activeSectionId === section.id;
            const isOpen = openDropdown === section.id;
            const SectionIcon = section.icon;
            const sectionLabel = t(`nav.sections.${section.id}.label`, {
              defaultValue: section.label,
            });
            return (
              <div
                key={section.id}
                className="relative"
                onMouseEnter={() => setOpenDropdown(section.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <NavLink
                  to={section.landingPath}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <SectionIcon className="h-3.5 w-3.5" />
                  {sectionLabel}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </NavLink>
                {isOpen && (
                  <div className="absolute left-0 top-full z-50 mt-0.5 min-w-[200px] rounded-lg border border-border bg-popover/95 p-1 shadow-xl backdrop-blur-xl">
                    {section.items.map((item) => {
                      const Icon = item.icon ?? section.icon;
                      const slug = leafSlug(section.basePath, item.to);
                      const itemLabel = t(
                        `nav.items.${section.id}.${slug}.label`,
                        { defaultValue: item.label },
                      );
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                        >
                          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                          {itemLabel}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side: search + actions */}
        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={handleSubmit} className="hidden md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("topbar.searchPlaceholder")}
                className="h-7 w-56 rounded-md border-border/60 bg-muted/30 pl-7 text-xs focus-visible:ring-primary/40 lg:w-72"
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
            className="h-7 w-7"
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}

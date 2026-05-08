import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, LineChart } from "lucide-react";

import { NAV_SECTIONS } from "@/routes/config";
import type { RouteSection } from "@/routes/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  walletConnected: boolean;
}

const OPEN_KEY = "dcc_sidebar_open_v1";

export function Sidebar({ collapsed, onToggle, walletConnected }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    safeLocalStorageGet<Record<string, boolean>>(OPEN_KEY, {
      markets: true,
      tokens: true,
      defi: true,
      chains: true,
    }),
  );

  useEffect(() => {
    safeLocalStorageSet(OPEN_KEY, open);
  }, [open]);

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const visibleSections: RouteSection[] = NAV_SECTIONS.filter(
    (section) => !section.walletGated || walletConnected,
  );

  return (
    <aside
      className={cn(
        "flex h-screen flex-shrink-0 flex-col border-r border-border bg-card text-card-foreground transition-[width] duration-150",
        collapsed ? "w-14" : "w-60",
      )}
    >
      <div className="flex h-12 items-center justify-between border-b border-border px-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <LineChart className="h-5 w-5 text-primary" />
          {!collapsed && <span className="text-sm tracking-wide">DCC</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle sidebar"
          onClick={onToggle}
          className="h-7 w-7"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 py-2">
        {visibleSections.map((section) => {
          const isOpen = open[section.id] ?? !collapsed;
          const SectionIcon = section.icon;
          return (
            <div key={section.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center",
                )}
                title={section.label}
              >
                <span className="flex items-center gap-2">
                  <SectionIcon className="h-4 w-4" />
                  {!collapsed && <span>{section.label}</span>}
                </span>
                {!collapsed && (
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isOpen ? "rotate-0" : "-rotate-90",
                    )}
                  />
                )}
              </button>
              {isOpen && (
                <ul className="mt-1 space-y-0.5 pl-1">
                  {section.items.map((item) => {
                    const Icon = item.icon ?? section.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.to === section.basePath}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
                              isActive
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                              collapsed && "justify-center",
                            )
                          }
                          title={item.label}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-border p-2 text-[10px] text-muted-foreground">
        {!collapsed ? (
          <div className="flex flex-col gap-0.5 leading-tight">
            <span className="font-mono text-[10px] tracking-wide">DCC v0.1</span>
            <span>Free public APIs only</span>
          </div>
        ) : (
          <div className="text-center font-mono">v0.1</div>
        )}
      </div>
    </aside>
  );
}

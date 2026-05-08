import { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Home, LineChart } from "lucide-react";

import { NAV_SECTIONS, findRouteByPath } from "@/routes/config";
import type { RouteSection } from "@/routes/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  walletConnected: boolean;
}

const OPEN_ID_KEY = "dcc_sidebar_open_id_v2";

export function Sidebar({ collapsed, onToggle, walletConnected }: Props) {
  const location = useLocation();
  const activeSectionId = useMemo(() => {
    const { section } = findRouteByPath(location.pathname);
    return section?.id ?? null;
  }, [location.pathname]);

  // Accordion: at most one section open at a time. Auto-expands the active section.
  const [openId, setOpenId] = useState<string | null>(() =>
    safeLocalStorageGet<string | null>(OPEN_ID_KEY, null),
  );

  useEffect(() => {
    if (activeSectionId && openId !== activeSectionId) {
      setOpenId(activeSectionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionId]);

  useEffect(() => {
    safeLocalStorageSet(OPEN_ID_KEY, openId);
  }, [openId]);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

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
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              "mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              collapsed && "justify-center",
            )
          }
          title="Home"
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Home</span>}
        </NavLink>
        {visibleSections.map((section) => {
          const isOpen = openId === section.id;
          const isActive = activeSectionId === section.id;
          const SectionIcon = section.icon;
          return (
            <div key={section.id} className="mb-0.5">
              <div
                className={cn(
                  "flex items-stretch rounded-md transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Link
                  to={section.landingPath}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-l-md px-2 py-1.5 text-sm font-medium",
                    collapsed && "justify-center rounded-md",
                  )}
                  title={section.label}
                  onClick={() => setOpenId(section.id)}
                >
                  <SectionIcon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{section.label}</span>}
                </Link>
                {!collapsed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(section.id);
                    }}
                    aria-label={isOpen ? `Collapse ${section.label}` : `Expand ${section.label}`}
                    className="flex w-7 items-center justify-center rounded-r-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isOpen ? "rotate-0" : "-rotate-90",
                      )}
                    />
                  </button>
                )}
              </div>
              {!collapsed && isOpen && (
                <ul className="mt-0.5 space-y-0.5 border-l border-border/60 pl-2">
                  {section.items.map((item) => {
                    const Icon = item.icon ?? section.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.to === section.basePath}
                          className={({ isActive: leafActive }) =>
                            cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition",
                              leafActive
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )
                          }
                          title={item.label}
                        >
                          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
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

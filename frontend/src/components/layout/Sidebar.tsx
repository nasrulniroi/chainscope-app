import { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Home, Layers, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { NAV_SECTIONS, findRouteByPath } from "@/routes/config";
import type { RouteSection } from "@/routes/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage";
import { leafSlug } from "@/i18n";

interface Props {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  walletConnected: boolean;
}

const OPEN_ID_KEY = "cs_sidebar_open_id_v1";

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileClose,
  walletConnected,
}: Props) {
  const location = useLocation();
  const { t } = useTranslation();
  const activeSectionId = useMemo(() => {
    const { section } = findRouteByPath(location.pathname);
    return section?.id ?? null;
  }, [location.pathname]);

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

  useEffect(() => {
    if (mobileOpen) onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const visibleSections: RouteSection[] = NAV_SECTIONS.filter(
    (section) => !section.walletGated || walletConnected,
  );

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden={!mobileOpen}
        onClick={onMobileClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 max-w-[80vw] flex-col border-r border-white/[0.06] bg-card/80 text-card-foreground backdrop-blur-2xl transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
      >
        <SidebarInner
          collapsed={false}
          showMobileClose
          onMobileClose={onMobileClose}
          onToggleCollapsed={onToggleCollapsed}
          visibleSections={visibleSections}
          openId={openId}
          setOpenId={setOpenId}
          toggle={toggle}
          activeSectionId={activeSectionId}
          t={t}
        />
      </aside>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 z-20 hidden h-screen max-h-screen flex-shrink-0 flex-col self-start border-r border-white/[0.06] bg-card/60 text-card-foreground backdrop-blur-2xl transition-[width] duration-150 md:flex",
          collapsed ? "w-14" : "w-60",
        )}
      >
        <SidebarInner
          collapsed={collapsed}
          showMobileClose={false}
          onMobileClose={onMobileClose}
          onToggleCollapsed={onToggleCollapsed}
          visibleSections={visibleSections}
          openId={openId}
          setOpenId={setOpenId}
          toggle={toggle}
          activeSectionId={activeSectionId}
          t={t}
        />
      </aside>
    </>
  );
}

interface InnerProps {
  collapsed: boolean;
  showMobileClose: boolean;
  onMobileClose: () => void;
  onToggleCollapsed: () => void;
  visibleSections: RouteSection[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  toggle: (id: string) => void;
  activeSectionId: string | null;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

function SidebarInner({
  collapsed,
  showMobileClose,
  onMobileClose,
  onToggleCollapsed,
  visibleSections,
  openId,
  toggle,
  activeSectionId,
  t,
}: InnerProps) {
  return (
    <>
      <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-display text-base font-bold leading-none tracking-tight text-foreground">
              ChainScope
            </span>
          )}
        </Link>
        {showMobileClose ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={onMobileClose}
            className="h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle sidebar"
            onClick={onToggleCollapsed}
            className="h-7 w-7"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && <div className="label-eyebrow mb-2 px-2">Dashboard</div>}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              "mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all duration-200",
              isActive
                ? "bg-primary/15 text-primary shadow-sm shadow-primary/10"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              collapsed && "justify-center",
            )
          }
          title={t("nav.home")}
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>{t("nav.home")}</span>}
        </NavLink>
        {!collapsed && <div className="label-eyebrow mb-1 mt-3 px-2">Explore</div>}
        {visibleSections.map((section) => {
          const isOpen = openId === section.id;
          const isActive = activeSectionId === section.id;
          const SectionIcon = section.icon;
          const sectionLabel = t(`nav.sections.${section.id}.label`, {
            defaultValue: section.label,
          });
          return (
            <div key={section.id} className="mb-0.5">
              <div
                className={cn(
                  "flex items-stretch rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Link
                  to={section.landingPath}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-l-lg px-2 py-1.5 text-sm font-medium",
                    collapsed && "justify-center rounded-lg",
                  )}
                  title={sectionLabel}
                  onClick={() => setOpenId(section.id)}
                >
                  <SectionIcon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{sectionLabel}</span>}
                </Link>
                {!collapsed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(section.id);
                    }}
                    aria-label={isOpen ? `Collapse ${sectionLabel}` : `Expand ${sectionLabel}`}
                    className="flex w-7 items-center justify-center rounded-r-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground"
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
                <ul className="mt-0.5 space-y-0.5 border-l border-primary/20 pl-2">
                  {section.items.map((item) => {
                    const Icon = item.icon ?? section.icon;
                    const slug = leafSlug(section.basePath, item.to);
                    const itemLabel = t(`nav.items.${section.id}.${slug}.label`, {
                      defaultValue: item.label,
                    });
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.to === section.basePath}
                          className={({ isActive: leafActive }) =>
                            cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-all duration-200",
                              leafActive
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                            )
                          }
                          title={itemLabel}
                        >
                          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{itemLabel}</span>
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
      <div className="border-t border-white/[0.06] p-2 text-[10px] text-muted-foreground">
        <div className={cn("font-mono tracking-wide", collapsed && "text-center")}>
          ChainScope v1.0
        </div>
      </div>
    </>
  );
}

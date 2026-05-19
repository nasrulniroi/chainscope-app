import { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ChevronDown, Home, Layers, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { NAV_SECTIONS, findRouteByPath } from "@/routes/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { leafSlug } from "@/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  walletConnected: boolean;
}

export function MobileDrawer({ open, onClose, walletConnected }: Props) {
  const location = useLocation();
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  const activeSectionId = useMemo(() => {
    const { section } = findRouteByPath(location.pathname);
    return section?.id ?? null;
  }, [location.pathname]);

  useEffect(() => {
    if (activeSectionId) setOpenId(activeSectionId);
  }, [activeSectionId]);

  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const visibleSections = NAV_SECTIONS.filter(
    (s) => !s.walletGated || walletConnected,
  );

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-background/95 backdrop-blur-2xl transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex h-11 items-center justify-between border-b border-border px-3">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20">
              <Layers className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-display text-sm font-bold tracking-wider uppercase">
              ChainScope
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={onClose}
            className="h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 py-3">
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "mb-2 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )
            }
          >
            <Home className="h-4 w-4" />
            {t("nav.home")}
          </NavLink>

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
                    "flex items-stretch rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Link
                    to={section.landingPath}
                    className="flex flex-1 items-center gap-2 rounded-l-md px-2.5 py-2 text-sm font-medium"
                    onClick={onClose}
                  >
                    <SectionIcon className="h-4 w-4" />
                    <span className="truncate">{sectionLabel}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(section.id);
                    }}
                    className="flex w-7 items-center justify-center rounded-r-md"
                  >
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isOpen ? "rotate-0" : "-rotate-90",
                      )}
                    />
                  </button>
                </div>
                {isOpen && (
                  <ul className="mt-0.5 space-y-0.5 border-l border-primary/20 pl-2">
                    {section.items.map((item) => {
                      const Icon = item.icon ?? section.icon;
                      const slug = leafSlug(section.basePath, item.to);
                      const itemLabel = t(
                        `nav.items.${section.id}.${slug}.label`,
                        { defaultValue: item.label },
                      );
                      return (
                        <li key={item.to}>
                          <NavLink
                            to={item.to}
                            end={item.to === section.basePath}
                            onClick={onClose}
                            className={({ isActive: leafActive }) =>
                              cn(
                                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                                leafActive
                                  ? "bg-primary/15 text-primary"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                              )
                            }
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

        <div className="border-t border-border p-2 text-[10px] text-muted-foreground">
          <div className="font-mono tracking-wide text-center">
            ChainScope v1.0
          </div>
        </div>
      </aside>
    </>
  );
}

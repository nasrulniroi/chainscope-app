import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NAV_SECTIONS_BY_ID } from "@/routes/config";
import { leafSlug } from "@/i18n";

interface Props {
  sectionId: string;
}

/**
 * Landing page for a top-level section. Renders the section header and a card
 * for each leaf, so users see one tier at a time instead of every menu item
 * stacked on every page.
 */
export function SectionHub({ sectionId }: Props) {
  const { t } = useTranslation();
  const section = NAV_SECTIONS_BY_ID[sectionId];
  if (!section) {
    return null;
  }
  const SectionIcon = section.icon;
  const sectionLabel = t(`nav.sections.${section.id}.label`, { defaultValue: section.label });
  const sectionDesc = t(`nav.sections.${section.id}.description`, {
    defaultValue: section.description,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <SectionIcon className="h-6 w-6 text-primary" />
            {sectionLabel}
          </span>
        }
        description={sectionDesc}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((leaf) => {
          const Icon = leaf.icon ?? section.icon;
          const slug = leafSlug(section.basePath, leaf.to);
          const leafLabel = t(`nav.items.${section.id}.${slug}.label`, {
            defaultValue: leaf.label,
          });
          const leafDesc = t(`nav.items.${section.id}.${slug}.description`, {
            defaultValue: leaf.description ?? `${t("common.open")} ${leaf.label}.`,
          });
          return (
            <Link
              key={leaf.to}
              to={leaf.to}
              className="group block rounded-lg border border-border/60 bg-card transition hover:border-primary/40 hover:bg-accent"
            >
              <Card className="h-full border-0 bg-transparent shadow-none">
                <CardHeader className="flex-row items-center gap-3 space-y-0 pb-2">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="flex flex-1 items-center justify-between text-base">
                    <span>{leafLabel}</span>
                    <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {leafDesc}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

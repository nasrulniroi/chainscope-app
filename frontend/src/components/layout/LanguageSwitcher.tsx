import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const activeCode = current.split("-")[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs"
          aria-label={t("topbar.languageToggle")}
          title={t("topbar.languageToggle")}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{activeCode.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = current === lang.code || current.startsWith(`${lang.code}-`);
          return (
            <DropdownMenuItem
              key={lang.code}
              onSelect={() => {
                void i18n.changeLanguage(lang.code);
              }}
              className={cn("flex items-center justify-between gap-2", isActive && "font-medium text-primary")}
            >
              <span>{lang.nativeLabel}</span>
              <span className="text-[10px] uppercase text-muted-foreground">{lang.code}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

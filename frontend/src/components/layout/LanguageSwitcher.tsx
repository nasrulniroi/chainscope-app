import { Languages } from "lucide-react";
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={t("topbar.languageToggle")}
          title={t("topbar.languageToggle")}
        >
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = current === lang.code || current.startsWith(`${lang.code}-`);
          return (
            <DropdownMenuItem
              key={lang.code}
              onSelect={() => {
                void i18n.changeLanguage(lang.code);
              }}
              className={cn("flex items-center gap-2", isActive && "font-medium text-primary")}
            >
              <span aria-hidden>{lang.flag}</span>
              <span>{lang.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

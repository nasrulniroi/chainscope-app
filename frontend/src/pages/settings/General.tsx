import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/providers/SettingsProvider";
import type { FiatCurrency } from "@/providers/SettingsProvider";
import { SUPPORTED_LANGUAGES } from "@/i18n";

const REFRESH_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: "15 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
];

export function SettingsGeneralPage() {
  const settings = useSettings();
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage ?? i18n.language ?? "en").split("-")[0];
  return (
    <div className="space-y-4">
      <PageHeader title="General" description="Theme, language, currency and refresh interval." />
      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(v) => settings.setTheme(v as "light" | "dark")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select
                value={currentLang}
                onValueChange={(v) => {
                  void i18n.changeLanguage(v);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(v) => settings.setCurrency(v as FiatCurrency)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="IDR">IDR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Auto-refresh</Label>
              <Select
                value={String(settings.refreshSec)}
                onValueChange={(v) => settings.setRefreshSec(Number(v))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REFRESH_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

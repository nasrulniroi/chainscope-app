import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import id from "./locales/id.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number]["code"];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      id: { translation: id },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "dcc_i18n_lng",
    },
  });

export default i18n;

export function leafSlug(basePath: string, to: string): string {
  if (to === basePath) return "index";
  const tail = to.startsWith(`${basePath}/`) ? to.slice(basePath.length + 1) : to.replace(/^\//, "");
  return tail || "index";
}

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import id from "./locales/id.json";
import es from "./locales/es.json";
import ja from "./locales/ja.json";
import zh from "./locales/zh.json";
import fr from "./locales/fr.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
  { code: "fr", label: "French", nativeLabel: "Français" },
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number]["code"];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      id: { translation: id },
      es: { translation: es },
      ja: { translation: ja },
      zh: { translation: zh },
      fr: { translation: fr },
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

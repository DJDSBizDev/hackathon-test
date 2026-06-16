/**
 * i18next setup (BUILD-SPEC §11). English ships this scope; the architecture
 * is ready for `es` / `zh` resource files to be dropped in as a content-only
 * change. Default language comes from `navigator.language`, falling back to en.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./en";

export const SUPPORTED_LANGUAGES = ["en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

function detectLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang ?? "")
    ? (lang as Language)
    : "en";
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: { en: { translation: en } },
    lng: detectLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
  });
}

export default i18n;

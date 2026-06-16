"use client";

import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";
import { SUPPORTED_LANGUAGES } from "@/i18n/config";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
};

/**
 * Top bar: logo/wordmark (left), language selector with globe icon (right).
 * (BUILD-SPEC §7.0). The selector is wired to i18n; only English ships this
 * scope, so it currently lists a single option.
 */
export function TopBar() {
  const { t, i18n } = useTranslation();

  return (
    <header className="flex items-center justify-between px-5 py-4 sm:px-6">
      <Logo />
      <label className="flex items-center gap-1.5 text-ink-3">
        <span aria-hidden className="text-base leading-none">
          🌐
        </span>
        <span className="sr-only">{t("nav.languageLabel")}</span>
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="cursor-pointer rounded-[var(--radius-input)] bg-transparent py-1.5 pr-1 t-small text-ink-2 focus-visible:outline-none"
        >
          {SUPPORTED_LANGUAGES.map((lng) => (
            <option key={lng} value={lng}>
              {LANGUAGE_NAMES[lng] ?? lng}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}

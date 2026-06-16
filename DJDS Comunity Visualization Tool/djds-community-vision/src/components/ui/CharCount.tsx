"use client";

import { useTranslation } from "react-i18next";

/** Live "N characters left" counter shown under capped text inputs (§7). */
export function CharCount({ value, max }: { value: string; max: number }) {
  const { t } = useTranslation();
  const left = max - value.length;
  return (
    <span
      className="t-caption text-muted tabular-nums"
      aria-live="polite"
      data-near-limit={left <= 20 ? "true" : undefined}
    >
      {t("field.charsRemaining", { count: left })}
    </span>
  );
}

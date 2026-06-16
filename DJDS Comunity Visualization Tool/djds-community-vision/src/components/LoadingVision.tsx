"use client";

import { useTranslation } from "react-i18next";

/**
 * Calm, SVG-based loading state (BUILD-SPEC §8.5): a soft breathing motif, no
 * spinner anxiety, no fake progress bar. The global prefers-reduced-motion rule
 * neutralizes the animation for users who ask for stillness.
 */
export function LoadingVision() {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-16"
      role="status"
      aria-live="polite"
    >
      <svg
        viewBox="0 0 120 120"
        className="h-28 w-28"
        aria-hidden
        fill="none"
      >
        <circle cx="60" cy="60" r="50" stroke="var(--color-border-2)" strokeWidth="2" />
        <circle cx="60" cy="60" r="34" stroke="var(--color-teal)" strokeWidth="2" opacity="0.5">
          <animate attributeName="r" values="30;40;30" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="60" r="18" fill="var(--color-accent)" opacity="0.85">
          <animate attributeName="r" values="16;22;16" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
      <p className="t-body text-ink-2">{t("loading.message")}</p>
    </div>
  );
}

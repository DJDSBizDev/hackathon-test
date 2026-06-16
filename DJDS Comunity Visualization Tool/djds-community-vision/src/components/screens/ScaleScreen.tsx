"use client";

import { useTranslation } from "react-i18next";
import { useFormStore } from "@/lib/store";
import {
  SCALES,
  SCALE_ACCENT,
  SCALE_SIZE_LABEL,
  type Scale,
  type AccentName,
} from "@/lib/content";
import { ScreenShell } from "./ScreenShell";
import { NavigationButtons } from "../NavigationButtons";

const SCALE_ICON: Record<Scale, string> = {
  room: "🛋️",
  building: "🏛️",
  block: "🏘️",
  city: "🏙️",
  planet: "🌍",
};

// Selected card: colored border + tinted fill (state by more than color, §2).
const SELECTED_CARD: Record<AccentName, string> = {
  teal: "border-teal bg-teal-bg",
  amber: "border-amber bg-amber-bg",
  accent: "border-accent bg-accent/10",
  blue: "border-blue bg-blue/10",
  success: "border-success bg-success-bg",
};
const ICON_TILE: Record<AccentName, string> = {
  teal: "bg-teal text-white",
  amber: "bg-amber text-white",
  accent: "bg-accent text-white",
  blue: "bg-blue text-white",
  success: "bg-success text-white",
};

/** 7.1 — Scale. Single-select, REQUIRED. Selecting auto-advances to Step 2a. */
export function ScaleScreen() {
  const { t } = useTranslation();
  const scale = useFormStore((s) => s.scale);
  const setScale = useFormStore((s) => s.setScale);
  const next = useFormStore((s) => s.next);
  const back = useFormStore((s) => s.back);

  return (
    <ScreenShell heading={t("scale.h2")} sub={t("scale.sub")}>
      <div className="flex flex-col gap-3" role="radiogroup" aria-label={t("scale.h2")}>
        {SCALES.map((value) => {
          const accent = SCALE_ACCENT[value];
          const selected = scale === value;
          const size = SCALE_SIZE_LABEL[value];
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setScale(value)}
              className={[
                "flex w-full items-start gap-4 rounded-[var(--radius-card)] border p-4 text-left transition-colors duration-150",
                selected
                  ? SELECTED_CARD[accent]
                  : "border-border bg-surface hover:border-border-2",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-input)] text-2xl",
                  selected ? ICON_TILE[accent] : "bg-chip-bg",
                ].join(" ")}
              >
                {SCALE_ICON[value]}
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="flex items-center justify-between gap-2">
                  <span className="t-label text-ink">
                    {t(`scale.options.${value}.name`)}
                  </span>
                  {size && (
                    <span className="t-overline text-muted">
                      {t(`scale.sizeLabels.${size}`)}
                    </span>
                  )}
                </span>
                <span className="t-small text-ink-3">
                  {t(`scale.options.${value}.description`)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {/* Next is revealed (enabled) only after a scale is chosen; selecting auto-advances. */}
      <NavigationButtons onBack={back} onNext={next} nextDisabled={!scale} />
    </ScreenShell>
  );
}

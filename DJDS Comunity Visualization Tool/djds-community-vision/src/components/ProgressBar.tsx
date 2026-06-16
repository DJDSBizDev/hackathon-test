"use client";

import { useTranslation } from "react-i18next";
import {
  PROGRESS_STEPS,
  SCREENS,
  type ScreenKey,
  type ProgressStep,
} from "@/lib/content";

/**
 * Five labeled steps: Scale · Values · Feelings · Features · Your vision.
 * Steps 2a/2b/2c all live under "Values" — the bar does NOT advance across
 * the three sub-steps; the step label reads "Step 2a of 5" etc. while the
 * Values dot stays active (BUILD-SPEC §5.4).
 */
export function ProgressBar({ currentScreen }: { currentScreen: ScreenKey }) {
  const { t } = useTranslation();
  const screen = SCREENS.find((s) => s.key === currentScreen);
  if (!screen || !screen.progress) return null;

  const activeStep = screen.progress as ProgressStep;
  const activeIndex = PROGRESS_STEPS.indexOf(activeStep);
  const stepLabel = screen.stepLabel; // "1" | "2a" | "2b" | "2c" | "3" | "4" | "5"

  return (
    <nav aria-label="Progress" className="flex flex-col gap-3">
      <p className="t-overline text-accent">
        {t("progress.stepOf", { label: stepLabel })}
      </p>
      <ol className="flex items-center gap-2">
        {PROGRESS_STEPS.map((step, i) => {
          const state =
            i < activeIndex ? "done" : i === activeIndex ? "active" : "upcoming";
          return (
            <li
              key={step}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
              aria-current={state === "active" ? "step" : undefined}
            >
              <span
                className={[
                  "h-1.5 w-full rounded-full transition-colors duration-150",
                  state === "done"
                    ? "bg-success"
                    : state === "active"
                      ? "bg-accent"
                      : "bg-border",
                ].join(" ")}
              />
              <span
                className={[
                  "t-caption truncate text-center",
                  state === "done"
                    ? "text-success-ink"
                    : state === "active"
                      ? "text-accent font-medium"
                      : "text-muted",
                ].join(" ")}
              >
                {t(`progress.labels.${step}`)}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

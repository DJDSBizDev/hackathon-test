"use client";

import { useTranslation } from "react-i18next";
import { useFormStore } from "@/lib/store";
import { CHAR_LIMITS } from "@/lib/content";
import { ScreenShell } from "./ScreenShell";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";

/**
 * 7.7 — Final Vision. Strongly encouraged but optional. If empty on generate,
 * show a gentle one-time nudge and let the next click proceed.
 */
export function FinalVisionScreen({ onGenerate }: { onGenerate: () => void }) {
  const { t } = useTranslation();
  const finalVision = useFormStore((s) => s.finalVision);
  const displayName = useFormStore((s) => s.displayName);
  const setText = useFormStore((s) => s.setText);
  const back = useFormStore((s) => s.back);
  const nudged = useFormStore((s) => s.finalVisionNudged);
  const markNudged = useFormStore((s) => s.markFinalVisionNudged);

  const handleGenerate = () => {
    if (!finalVision.trim() && !nudged) {
      markNudged(); // show the gentle nudge once, then allow on the next click
      return;
    }
    onGenerate();
  };

  return (
    <ScreenShell heading={t("finalVision.h2")} sub={t("finalVision.sub")}>
      <p className="t-body text-ink-2">
        <strong className="font-semibold text-ink">
          {t("finalVision.promptBold")}
        </strong>
        {t("finalVision.promptRest")}
      </p>

      <Textarea
        id="final-vision"
        value={finalVision}
        onChange={(v) => setText("finalVision", v)}
        maxLength={CHAR_LIMITS.finalVision}
        placeholder={t("finalVision.placeholder")}
        ariaLabel={t("finalVision.h2")}
        rows={6}
      />

      {nudged && !finalVision.trim() && (
        <p
          role="status"
          className="rounded-[var(--radius-input)] bg-amber-bg px-4 py-2.5 t-small text-ink-2"
        >
          {t("finalVision.nudge")}
        </p>
      )}

      {/* Optional name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="display-name" className="flex items-center gap-2 t-label text-ink-2">
          {t("finalVision.nameLabel")}
          <span className="rounded-[var(--radius-pill)] bg-chip-bg px-2 py-0.5 t-caption text-muted">
            {t("finalVision.optional")}
          </span>
        </label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          maxLength={CHAR_LIMITS.displayName}
          placeholder={t("finalVision.namePlaceholder")}
          onChange={(e) =>
            setText("displayName", e.target.value.slice(0, CHAR_LIMITS.displayName))
          }
          className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-4 py-2.5 t-body text-ink placeholder:text-muted focus-visible:border-accent"
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={back}>
          {t("nav2.back")}
        </Button>
        <Button onClick={handleGenerate}>{t("finalVision.generate")}</Button>
      </div>
    </ScreenShell>
  );
}

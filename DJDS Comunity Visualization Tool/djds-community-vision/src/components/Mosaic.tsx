"use client";

import { useTranslation } from "react-i18next";
import type { ContributionSummary } from "@/lib/types";
import { VisionImage } from "./VisionImage";
import { Button } from "./ui/Button";

/**
 * Collective mosaic (BUILD-SPEC §10): responsive grid of vision cards. Each
 * shows the SVG thumbnail, name (or Anonymous), scale, and up to 3 tags, and
 * links to that vision.
 */
export function Mosaic({
  summaries,
  onAddYours,
}: {
  summaries: ContributionSummary[];
  onAddYours?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-5 py-4">
      <header className="flex flex-col gap-1">
        <h1 className="t-h1">{t("mosaic.title")}</h1>
        <p className="t-body text-ink-3">{t("mosaic.sub")}</p>
      </header>

      {summaries.length === 0 ? (
        <p className="t-body text-muted">{t("mosaic.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {summaries.map((s) => {
            const name = s.displayName || t("mosaic.anonymous");
            return (
              <a
                key={s.id}
                href={`/vision/${s.id}`}
                className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-3 transition-colors duration-150 hover:border-border-2"
              >
                <VisionImage
                  src={s.imageUrl}
                  alt={name}
                  className="aspect-[4/3] rounded-[var(--radius-input)]"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="t-label text-ink">{name}</span>
                  <span className="t-caption text-muted">
                    {t(`scale.options.${s.scale}.name`)}
                  </span>
                </div>
                {s.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[var(--radius-pill)] bg-chip-bg px-2 py-0.5 t-caption text-ink-3"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )}

      {onAddYours && (
        <Button onClick={onAddYours} className="self-start">
          {t("mosaic.addYours")}
        </Button>
      )}
    </section>
  );
}

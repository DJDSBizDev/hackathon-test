"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { readCachedVision } from "@/lib/visionCache";
import { downloadImage } from "@/lib/download";
import { useFormStore } from "@/lib/store";
import type { Scale } from "@/lib/content";
import { VisionImage } from "./VisionImage";
import { TopBar } from "./TopBar";
import { Button } from "./ui/Button";

interface VisionViewProps {
  id: string;
  initialImageUrl?: string;
  initialName?: string;
  initialScale?: Scale | null;
  /** Whether this contribution belongs to a session (shows a "saved" note). */
  hasSession?: boolean;
  /** Whether the edit affordance is shown (open session / standalone, §9.4). */
  canEdit?: boolean;
}

export function VisionView({
  id,
  initialImageUrl,
  initialName = "",
  hasSession = false,
  canEdit = true,
}: VisionViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const reset = useFormStore((s) => s.reset);

  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [name, setName] = useState(initialName);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Fall back to the client cache (standalone loop, no DB).
  useEffect(() => {
    if (imageUrl) return;
    const cached = readCachedVision(id);
    if (cached) {
      setImageUrl(cached.imageUrl);
      setName(cached.input.displayName || "");
    } else {
      setNotFound(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — non-fatal */
    }
  }

  async function download() {
    if (!imageUrl) return;
    try {
      await downloadImage(imageUrl, `djds-vision-${id.slice(0, 8)}.png`);
    } catch {
      /* download failed — non-fatal */
    }
  }

  function startOver() {
    reset();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-20 sm:px-6">
        {notFound ? (
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <p className="t-body text-ink-2">{t("errors.notFound")}</p>
            <Button onClick={startOver}>{t("vision.startOver")}</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 py-4">
            <header className="flex flex-col gap-1">
              <h1 className="t-h1">{t("vision.title")}</h1>
              {name && (
                <p className="t-small text-ink-3">
                  {t("vision.byline", { name })}
                </p>
              )}
            </header>

            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
              {imageUrl ? (
                <VisionImage src={imageUrl} alt={t("vision.title")} />
              ) : (
                <div className="aspect-[4/3] w-full animate-pulse bg-chip-bg" />
              )}
            </div>

            <p className="t-caption text-muted">{t("vision.aiNote")}</p>

            {hasSession && (
              <p className="t-small text-success-ink">{t("vision.savedToSession")}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button variant="secondary" onClick={copyLink}>
                {copied ? t("vision.copied") : t("vision.copyLink")}
              </Button>
              <Button onClick={download} disabled={!imageUrl}>
                {t("vision.downloadPng")}
              </Button>
              {canEdit && (
                <a
                  href={`/vision/${id}/edit`}
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-btn)] border border-border bg-surface px-5 t-label text-ink-2 hover:border-ink-3"
                >
                  {t("vision.edit")}
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={startOver}
              className="self-start t-small text-ink-3 underline-offset-4 hover:underline"
            >
              {t("vision.startOver")}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

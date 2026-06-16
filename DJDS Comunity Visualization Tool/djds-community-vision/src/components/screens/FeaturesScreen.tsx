"use client";

import { useTranslation } from "react-i18next";
import { useFormStore } from "@/lib/store";
import { FEATURES_CAP } from "@/lib/content";
import { ScreenShell } from "./ScreenShell";
import { TagGrid } from "../ui/TagGrid";
import { NavigationButtons } from "../NavigationButtons";

/** 7.6 — Features. Scale-specific coral tags, hard cap of 8 with a N/8 counter. */
export function FeaturesScreen() {
  const { t } = useTranslation();
  const scale = useFormStore((s) => s.scale);
  const selected = useFormStore((s) => s.features);
  const toggle = useFormStore((s) => s.toggleFeature);
  const next = useFormStore((s) => s.next);
  const back = useFormStore((s) => s.back);

  // Scale is guaranteed set by this step (it's the only hard gate).
  const tags = scale
    ? (t(`features.tags.${scale}`, { returnObjects: true }) as string[])
    : [];
  const scaleNoun = scale ? t(`scale.noun.${scale}`) : "";

  return (
    <ScreenShell
      heading={t("features.h2")}
      sub={t("features.sub", { scale: scaleNoun })}
    >
      <p className="t-label text-ink-3 tabular-nums" aria-live="polite">
        {selected.length} / {FEATURES_CAP}
      </p>
      <TagGrid
        tags={tags}
        selected={selected}
        onToggle={toggle}
        color="coral"
        cap={FEATURES_CAP}
      />
      <NavigationButtons onBack={back} onNext={next} />
    </ScreenShell>
  );
}

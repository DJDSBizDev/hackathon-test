"use client";

import { useTranslation } from "react-i18next";
import { useFormStore } from "@/lib/store";
import { FEELINGS_CAP } from "@/lib/content";
import { ScreenShell } from "./ScreenShell";
import { TagGrid } from "../ui/TagGrid";
import { NavigationButtons } from "../NavigationButtons";

/** 7.5 — Feelings. Teal tags, hard cap of 5 with a N/5 counter. */
export function FeelingsScreen() {
  const { t } = useTranslation();
  const tags = t("feelings.tags", { returnObjects: true }) as string[];
  const selected = useFormStore((s) => s.feelings);
  const toggle = useFormStore((s) => s.toggleFeeling);
  const next = useFormStore((s) => s.next);
  const back = useFormStore((s) => s.back);

  return (
    <ScreenShell heading={t("feelings.h2")} sub={t("feelings.sub")}>
      <p className="t-label text-ink-3 tabular-nums" aria-live="polite">
        {selected.length} / {FEELINGS_CAP}
      </p>
      <TagGrid
        tags={tags}
        selected={selected}
        onToggle={toggle}
        color="teal"
        cap={FEELINGS_CAP}
      />
      <NavigationButtons onBack={back} onNext={next} />
    </ScreenShell>
  );
}

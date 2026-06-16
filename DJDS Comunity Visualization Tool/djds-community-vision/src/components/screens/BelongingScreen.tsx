"use client";

import { useTranslation } from "react-i18next";
import { useFormStore } from "@/lib/store";
import { ScreenShell } from "./ScreenShell";
import { TagGrid } from "../ui/TagGrid";
import { NavigationButtons } from "../NavigationButtons";

/** 7.3 — Community & Belonging. Coral tags, no cap, with a "N selected" count. */
export function BelongingScreen() {
  const { t } = useTranslation();
  const tags = t("belonging.tags", { returnObjects: true }) as string[];
  const selected = useFormStore((s) => s.communityBelonging);
  const toggle = useFormStore((s) => s.toggleBelonging);
  const next = useFormStore((s) => s.next);
  const back = useFormStore((s) => s.back);

  return (
    <ScreenShell heading={t("belonging.h2")} sub={t("belonging.sub")}>
      <p
        className="t-label text-accent tabular-nums"
        aria-live="polite"
      >
        {t("belonging.selected", { count: selected.length })}
      </p>
      <TagGrid tags={tags} selected={selected} onToggle={toggle} color="coral" />
      <NavigationButtons onBack={back} onNext={next} />
    </ScreenShell>
  );
}

"use client";

import { useTranslation } from "react-i18next";
import { useFormStore } from "@/lib/store";
import { ScreenShell } from "./ScreenShell";
import { TagGrid } from "../ui/TagGrid";
import { NavigationButtons } from "../NavigationButtons";

/** 7.2 — Sensory & Embodied Experience. Teal tags, no cap. */
export function SensoryScreen() {
  const { t } = useTranslation();
  const tags = t("sensory.tags", { returnObjects: true }) as string[];
  const selected = useFormStore((s) => s.sensoryFeelings);
  const toggle = useFormStore((s) => s.toggleSensory);
  const next = useFormStore((s) => s.next);
  const back = useFormStore((s) => s.back);

  return (
    <ScreenShell heading={t("sensory.h2")} sub={t("sensory.sub")}>
      <TagGrid tags={tags} selected={selected} onToggle={toggle} color="teal" />
      <NavigationButtons onBack={back} onNext={next} />
    </ScreenShell>
  );
}

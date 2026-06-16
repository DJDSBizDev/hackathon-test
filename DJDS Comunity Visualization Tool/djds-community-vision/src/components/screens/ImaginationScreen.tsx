"use client";

import { useTranslation } from "react-i18next";
import { useFormStore } from "@/lib/store";
import { CHAR_LIMITS } from "@/lib/content";
import { ScreenShell } from "./ScreenShell";
import { Textarea } from "../ui/Textarea";
import { NavigationButtons } from "../NavigationButtons";

/** 7.4 — Sensory Imagination. Single open textarea, max 500 chars. */
export function ImaginationScreen() {
  const { t } = useTranslation();
  const value = useFormStore((s) => s.sensoryImagination);
  const setText = useFormStore((s) => s.setText);
  const next = useFormStore((s) => s.next);
  const back = useFormStore((s) => s.back);

  return (
    <ScreenShell heading={t("imagination.h2")} sub={t("imagination.sub")}>
      <Textarea
        id="sensory-imagination"
        value={value}
        onChange={(v) => setText("sensoryImagination", v)}
        maxLength={CHAR_LIMITS.sensoryImagination}
        placeholder={t("imagination.placeholder")}
        ariaLabel={t("imagination.h2")}
        rows={5}
      />
      <NavigationButtons onBack={back} onNext={next} />
    </ScreenShell>
  );
}

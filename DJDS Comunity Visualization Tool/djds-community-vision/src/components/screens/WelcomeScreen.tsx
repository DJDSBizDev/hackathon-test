"use client";

import { useTranslation } from "react-i18next";
import { useFormStore } from "@/lib/store";
import { CHAR_LIMITS } from "@/lib/content";
import { Button } from "../ui/Button";

/** 7.0 — Welcome. 150-year vision check-in. The Begin button is always enabled. */
export function WelcomeScreen() {
  const { t } = useTranslation();
  const myPeopleAre = useFormStore((s) => s.myPeopleAre);
  const setText = useFormStore((s) => s.setText);
  const next = useFormStore((s) => s.next);

  const pills = t("welcome.pills", { returnObjects: true }) as {
    icon: string;
    step: string;
    label: string;
  }[];
  const max = CHAR_LIMITS.myPeopleAre;

  return (
    <section className="flex flex-col gap-7">
      <header className="flex flex-col gap-3">
        <p className="t-overline text-accent">{t("welcome.overline")}</p>
        <h1 className="t-h1 text-balance">
          {t("welcome.h1Before")}
          <span className="text-accent">{t("welcome.h1Accent")}</span>
          {t("welcome.h1After")}
        </h1>
        <p className="t-body text-ink-2">{t("welcome.body")}</p>
      </header>

      {/* Green callout */}
      <div className="rounded-[var(--radius-card)] border-l-4 border-success bg-success-bg p-4">
        <p className="t-overline text-success-ink">
          {t("welcome.callout.overline")}
        </p>
        <p className="t-small mt-1.5 text-success-ink">
          {t("welcome.callout.before")}
          <strong className="font-semibold">{t("welcome.callout.bold")}</strong>
          {t("welcome.callout.after")}
        </p>
      </div>

      {/* Three process pills */}
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {pills.map((pill, i) => (
          <li
            key={i}
            className="flex flex-col items-center gap-1.5 rounded-[var(--radius-card)] border border-border bg-surface p-4 text-center"
          >
            <span aria-hidden className="text-2xl">
              {pill.icon}
            </span>
            <span className="t-overline text-muted">{pill.step}</span>
            <span className="t-small text-ink-2">{pill.label}</span>
          </li>
        ))}
      </ol>

      {/* Check-in card (dark) */}
      <div className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-ink p-5 text-bg sm:p-6">
        <p className="t-overline text-bg/60">{t("welcome.checkIn.overline")}</p>
        <p className="t-small italic text-bg/80">{t("welcome.checkIn.breath")}</p>
        <p className="t-h2 text-bg">{t("welcome.checkIn.prompt")}</p>
        <p className="t-body text-bg/90">
          {t("welcome.checkIn.finishLabel")}{" "}
          <span className="text-accent">{t("welcome.checkIn.sentenceAccent")}</span>
        </p>
        <textarea
          id="my-people-are"
          value={myPeopleAre}
          rows={3}
          maxLength={max}
          aria-label={t("welcome.checkIn.sentenceAccent")}
          placeholder={t("welcome.checkIn.placeholder")}
          onChange={(e) => setText("myPeopleAre", e.target.value.slice(0, max))}
          className="w-full resize-y rounded-[var(--radius-input)] border border-border bg-surface px-4 py-3 t-body text-ink placeholder:text-muted focus-visible:border-accent"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="t-caption text-bg/60">{t("welcome.checkIn.hint")}</span>
          <span className="t-caption text-bg/50 tabular-nums" aria-live="polite">
            {t("field.charsRemaining", { count: max - myPeopleAre.length })}
          </span>
        </div>
      </div>

      {/* CTA — always enabled (low friction, §7.0). */}
      <div className="flex flex-col items-center gap-2">
        <Button onClick={next} fullWidth>
          {t("welcome.cta")}
        </Button>
        <p className="t-caption text-muted">{t("welcome.ctaSub")}</p>
      </div>
    </section>
  );
}

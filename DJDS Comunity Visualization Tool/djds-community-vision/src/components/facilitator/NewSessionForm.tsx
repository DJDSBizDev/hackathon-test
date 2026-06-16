"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SCALES, type Scale } from "@/lib/content";
import { TopBar } from "../TopBar";
import { Button } from "../ui/Button";

interface CreatedSession {
  slug: string;
  pin: string;
  shareUrl: string;
  dashboardUrl: string;
}

export function NewSessionForm() {
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scaleChoice, setScaleChoice] = useState<"open" | "fixed">("open");
  const [fixedScale, setFixedScale] = useState<Scale>("block");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedSession | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          scaleMode: scaleChoice === "open" ? "open" : fixedScale,
          visibility,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.code === "db_unconfigured" ? "errors.generic" : "errors.generic");
        return;
      }
      setCreated(data as CreatedSession);
    } catch {
      setError("errors.generic");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-20 sm:px-6">
        {created ? (
          <CreatedView created={created} />
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-6 py-4">
            <header className="flex flex-col gap-2">
              <h1 className="t-h1">{t("facilitator.new.title")}</h1>
              <p className="t-body text-ink-3">{t("facilitator.new.sub")}</p>
            </header>

            <Field label={t("facilitator.new.fieldTitle")} htmlFor="s-title">
              <input
                id="s-title"
                type="text"
                required
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("facilitator.new.fieldTitlePlaceholder")}
                className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-4 py-2.5 t-body text-ink placeholder:text-muted focus-visible:border-accent"
              />
            </Field>

            <Field label={t("facilitator.new.fieldDescription")} htmlFor="s-desc">
              <textarea
                id="s-desc"
                value={description}
                rows={2}
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("facilitator.new.fieldDescriptionPlaceholder")}
                className="w-full resize-y rounded-[var(--radius-input)] border border-border bg-surface px-4 py-2.5 t-body text-ink placeholder:text-muted focus-visible:border-accent"
              />
            </Field>

            <fieldset className="flex flex-col gap-2">
              <legend className="t-label text-ink-2">
                {t("facilitator.new.fieldScaleMode")}
              </legend>
              <RadioRow
                name="scaleMode"
                checked={scaleChoice === "open"}
                onChange={() => setScaleChoice("open")}
                label={t("facilitator.new.scaleModeOpen")}
              />
              <div className="flex flex-wrap items-center gap-2">
                <RadioRow
                  name="scaleMode"
                  checked={scaleChoice === "fixed"}
                  onChange={() => setScaleChoice("fixed")}
                  label={t("facilitator.new.scaleModeFixed")}
                />
                <select
                  value={fixedScale}
                  disabled={scaleChoice !== "fixed"}
                  onChange={(e) => setFixedScale(e.target.value as Scale)}
                  className="rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 t-small text-ink disabled:opacity-50"
                >
                  {SCALES.map((s) => (
                    <option key={s} value={s}>
                      {t(`scale.options.${s}.name`)}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="t-label text-ink-2">
                {t("facilitator.new.fieldVisibility")}
              </legend>
              <RadioRow
                name="visibility"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
                label={t("facilitator.new.visibilityPrivate")}
              />
              <RadioRow
                name="visibility"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
                label={t("facilitator.new.visibilityPublic")}
              />
            </fieldset>

            {error && (
              <p role="alert" className="t-small text-accent-press">
                {t(error)}
              </p>
            )}

            <Button type="submit" disabled={!title.trim() || submitting}>
              {submitting ? t("facilitator.new.creating") : t("facilitator.new.submit")}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="t-label text-ink-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function RadioRow({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 t-body text-ink-2">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[var(--color-accent)]"
      />
      {label}
    </label>
  );
}

function CreatedView({ created }: { created: CreatedSession }) {
  const { t } = useTranslation();
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  async function copy(text: string, which: "pin" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "pin") {
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      /* non-fatal */
    }
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <h1 className="t-h1">{t("facilitator.created.title")}</h1>

      {/* PIN — shown once */}
      <div className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-ink p-5 text-bg">
        <p className="t-overline text-bg/60">{t("facilitator.created.pinLabel")}</p>
        <p className="font-mono text-4xl tracking-[0.2em] text-bg">{created.pin}</p>
        <Button variant="secondary" onClick={() => copy(created.pin, "pin")}>
          {copiedPin ? t("facilitator.created.copied") : t("facilitator.created.copyPin")}
        </Button>
        <p className="t-small text-amber-bg">{t("facilitator.created.pinWarning")}</p>
      </div>

      {/* Share link */}
      <div className="flex flex-col gap-2">
        <p className="t-label text-ink-2">{t("facilitator.created.shareLabel")}</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2.5 t-small text-ink-2">
            {created.shareUrl}
          </code>
          <Button variant="secondary" onClick={() => copy(created.shareUrl, "link")}>
            {copiedLink ? t("facilitator.created.copied") : t("facilitator.created.copyLink")}
          </Button>
        </div>
      </div>

      <a
        href={created.dashboardUrl}
        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-btn)] bg-accent px-5 t-label text-surface hover:bg-accent-press"
      >
        {t("facilitator.created.openDashboard")}
      </a>
    </div>
  );
}

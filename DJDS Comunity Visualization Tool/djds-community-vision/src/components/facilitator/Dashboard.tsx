"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SessionAggregates } from "@/lib/db";
import type {
  Contribution,
  ScaleMode,
  SessionStatus,
  Visibility,
} from "@/lib/types";
import { TopBar } from "../TopBar";
import { VisionImage } from "../VisionImage";
import { Button } from "../ui/Button";

interface DashData {
  session: {
    title: string;
    slug: string;
    visibility: Visibility;
    status: SessionStatus;
    scaleMode: ScaleMode;
  };
  aggregates: SessionAggregates;
  contributions: Contribution[];
}

/** /facilitator/[slug] entry: PIN gate, then the dashboard. */
export function DashboardGate({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashData | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${slug}/dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.code === "locked" ? "facilitator.gate.locked" : "facilitator.gate.wrong");
        return;
      }
      setData(json as DashData);
    } catch {
      setError("facilitator.gate.wrong");
    } finally {
      setChecking(false);
    }
  }

  if (data) {
    return <Dashboard slug={slug} pin={pin} initial={data} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-md flex-1 px-5 sm:px-6">
        <form onSubmit={submit} className="mt-10 flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <h1 className="t-h1">{t("facilitator.gate.title")}</h1>
            <p className="t-body text-ink-3">{t("facilitator.gate.sub")}</p>
          </header>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={t("facilitator.gate.pinPlaceholder")}
            aria-label={t("facilitator.gate.pinPlaceholder")}
            className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-4 py-3 font-mono text-xl tracking-[0.2em] text-ink focus-visible:border-accent"
          />
          {error && (
            <p role="alert" className="t-small text-accent-press">
              {t(error)}
            </p>
          )}
          <Button type="submit" disabled={checking || !pin}>
            {checking ? t("facilitator.gate.checking") : t("facilitator.gate.submit")}
          </Button>
        </form>
      </main>
    </div>
  );
}

function Dashboard({
  slug,
  pin,
  initial,
}: {
  slug: string;
  pin: string;
  initial: DashData;
}) {
  const { t } = useTranslation();
  const [visibility, setVisibility] = useState<Visibility>(initial.session.visibility);
  const [status, setStatus] = useState<SessionStatus>(initial.session.status);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const { aggregates, contributions } = initial;

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/s/${slug}` : `/s/${slug}`;

  async function toggle(patch: { visibility?: Visibility; status?: SessionStatus }) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/sessions/${slug}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, ...patch }),
      });
      const json = await res.json();
      if (json.success) {
        setVisibility(json.visibility);
        setStatus(json.status);
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* non-fatal */
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-20 sm:px-6">
        <div className="flex flex-col gap-6 py-4">
          <header className="flex flex-col gap-1">
            <h1 className="t-h1">{initial.session.title}</h1>
          </header>

          {/* Standing-configuration controls — current state always visible. */}
          <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4">
            <ControlRow
              label={t("facilitator.dashboard.status")}
              state={
                status === "open"
                  ? t("facilitator.dashboard.statusOpen")
                  : t("facilitator.dashboard.statusClosed")
              }
              actionLabel={
                status === "open"
                  ? t("facilitator.dashboard.closeSession")
                  : t("facilitator.dashboard.reopenSession")
              }
              onAction={() => toggle({ status: status === "open" ? "closed" : "open" })}
              busy={busy}
            />
            <ControlRow
              label={t("facilitator.dashboard.visibility")}
              state={
                visibility === "public"
                  ? t("facilitator.dashboard.visibilityPublic")
                  : t("facilitator.dashboard.visibilityPrivate")
              }
              actionLabel={
                visibility === "public"
                  ? t("facilitator.dashboard.makePrivate")
                  : t("facilitator.dashboard.makePublic")
              }
              onAction={() =>
                toggle({ visibility: visibility === "public" ? "private" : "public" })
              }
              busy={busy}
            />
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <code className="flex-1 truncate t-small text-ink-3">{shareUrl}</code>
              <Button variant="secondary" onClick={copyShare}>
                {copied
                  ? t("facilitator.dashboard.copied")
                  : t("facilitator.dashboard.copyLink")}
              </Button>
            </div>
          </div>

          {/* Headline count + scale breakdown */}
          <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-4">
            <p className="t-overline text-muted">{t("facilitator.dashboard.contributions")}</p>
            <p className="t-h1 text-accent tabular-nums">{aggregates.total}</p>
            {aggregates.total > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(aggregates.byScale).map(([scale, n]) => (
                  <span
                    key={scale}
                    className="rounded-[var(--radius-pill)] bg-chip-bg px-3 py-1 t-small text-ink-2"
                  >
                    {t(`scale.options.${scale}.name`)} · {n}
                  </span>
                ))}
              </div>
            )}
          </div>

          {aggregates.total === 0 ? (
            <p className="t-body text-muted">{t("facilitator.dashboard.empty")}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TopList title={t("facilitator.dashboard.topSensory")} items={aggregates.topSensory} />
                <TopList title={t("facilitator.dashboard.topBelonging")} items={aggregates.topBelonging} />
                <TopList title={t("facilitator.dashboard.topFeelings")} items={aggregates.topFeelings} />
                <TopList title={t("facilitator.dashboard.topFeatures")} items={aggregates.topFeatures} />
              </div>

              <section className="flex flex-col gap-3">
                <h2 className="t-h2">{t("facilitator.dashboard.allVisions")}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {contributions.map((c) => (
                    <a
                      key={c.id}
                      href={`/vision/${c.id}`}
                      className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-3 transition-colors duration-150 hover:border-border-2"
                    >
                      <VisionImage
                        src={c.imageUrl}
                        alt={c.displayName || t("vision.anonymous")}
                        className="aspect-[4/3] rounded-[var(--radius-input)]"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="t-label text-ink">
                          {c.displayName || t("vision.anonymous")}
                        </span>
                        <span className="t-caption text-muted">
                          {t(`scale.options.${c.scale}.name`)}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function ControlRow({
  label,
  state,
  actionLabel,
  onAction,
  busy,
}: {
  label: string;
  state: string;
  actionLabel: string;
  onAction: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="t-overline text-muted">{label}</span>
        <span className="t-label text-ink">{state}</span>
      </div>
      <Button variant="secondary" onClick={onAction} disabled={busy}>
        {actionLabel}
      </Button>
    </div>
  );
}

function TopList({ title, items }: { title: string; items: [string, number][] }) {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <p className="t-overline text-muted">{title}</p>
      {items.length === 0 ? (
        <p className="t-small text-muted">—</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.slice(0, 8).map(([label, count]) => (
            <li key={label} className="flex items-center justify-between gap-3 t-small">
              <span className="text-ink-2">{label}</span>
              <span className="text-muted tabular-nums">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

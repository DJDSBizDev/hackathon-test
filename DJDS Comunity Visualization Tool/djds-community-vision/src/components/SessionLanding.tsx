"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Scale } from "@/lib/content";
import type { ContributionSummary, ScaleMode, SessionStatus, Visibility } from "@/lib/types";
import { TopBar } from "./TopBar";
import { Mosaic } from "./Mosaic";
import { VisioningFlow } from "./VisioningFlow";

interface SessionLandingProps {
  sessionId: string;
  scaleMode: ScaleMode;
  visibility: Visibility;
  status: SessionStatus;
  summaries: ContributionSummary[];
}

/**
 * Entry for /s/[slug] (BUILD-SPEC §5.2 / §5.3 / §9.2):
 *  - open + private  → run the flow directly
 *  - open + public   → show the mosaic with an "Add your vision" CTA → flow
 *  - closed          → gentle closed state (+ mosaic if public)
 */
export function SessionLanding({
  sessionId,
  scaleMode,
  visibility,
  status,
  summaries,
}: SessionLandingProps) {
  const { t } = useTranslation();
  const [inFlow, setInFlow] = useState(false);
  const fixedScale: Scale | null = scaleMode === "open" ? null : scaleMode;

  // Private + open jumps straight into the flow.
  if (status === "open" && visibility === "private" && !inFlow) {
    return <VisioningFlow sessionId={sessionId} fixedScale={fixedScale} />;
  }

  if (inFlow) {
    return <VisioningFlow sessionId={sessionId} fixedScale={fixedScale} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-20 sm:px-6">
        {status === "closed" && (
          <div className="mt-8 flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center">
            <h1 className="t-h2">{t("session.closedTitle")}</h1>
            <p className="t-body text-ink-3">{t("session.closedBody")}</p>
          </div>
        )}

        {visibility === "public" ? (
          <Mosaic
            summaries={summaries}
            onAddYours={status === "open" ? () => setInFlow(true) : undefined}
          />
        ) : (
          status === "closed" && null
        )}
      </main>
    </div>
  );
}

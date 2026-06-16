"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useFormStore, visibleScreens } from "@/lib/store";
import type { Scale, ScreenKey } from "@/lib/content";
import type { ContributionInput, GenerateResponse } from "@/lib/types";
import { cacheVision } from "@/lib/visionCache";
import { TopBar } from "./TopBar";
import { ProgressBar } from "./ProgressBar";
import { LoadingVision } from "./LoadingVision";
import { Button } from "./ui/Button";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { ScaleScreen } from "./screens/ScaleScreen";
import { SensoryScreen } from "./screens/SensoryScreen";
import { BelongingScreen } from "./screens/BelongingScreen";
import { ImaginationScreen } from "./screens/ImaginationScreen";
import { FeelingsScreen } from "./screens/FeelingsScreen";
import { FeaturesScreen } from "./screens/FeaturesScreen";
import { FinalVisionScreen } from "./screens/FinalVisionScreen";

type Status = "idle" | "loading" | "error";

interface VisioningFlowProps {
  sessionId?: string | null;
  fixedScale?: Scale | null;
  /** Pre-fill answers (edit flow, §9.4). When set, the store is hydrated instead of reset. */
  initialData?: Partial<ContributionInput>;
  /** When editing an existing vision, its id — generation updates in place (§9.4). */
  editId?: string;
}

export function VisioningFlow({
  sessionId = null,
  fixedScale = null,
  initialData,
  editId,
}: VisioningFlowProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const initContext = useFormStore((s) => s.initContext);
  const reset = useFormStore((s) => s.reset);
  const hydrate = useFormStore((s) => s.hydrate);
  const screenIndex = useFormStore((s) => s.screenIndex);
  const storeFixedScale = useFormStore((s) => s.fixedScale);
  const toInput = useFormStore((s) => s.toInput);

  const [status, setStatus] = useState<Status>("idle");

  // Establish session context and either prefill (edit) or start clean.
  useEffect(() => {
    initContext({ sessionId, fixedScale });
    if (initialData) hydrate(initialData);
    else reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const order = visibleScreens(storeFixedScale ?? fixedScale ?? null);
  const currentKey: ScreenKey = order[Math.min(screenIndex, order.length - 1)];

  async function handleGenerate() {
    const input = toInput(i18n.language);
    if (!input) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { ...input, editId } : input),
      });
      const data: GenerateResponse = await res.json();
      if (!data.success) {
        setStatus("error");
        return;
      }
      cacheVision({ id: data.id, imageUrl: data.imageUrl, input });
      router.push(data.url || `/vision/${data.id}`);
    } catch {
      setStatus("error");
    }
  }

  function renderScreen() {
    switch (currentKey) {
      case "welcome":
        return <WelcomeScreen />;
      case "scale":
        return <ScaleScreen />;
      case "sensory":
        return <SensoryScreen />;
      case "belonging":
        return <BelongingScreen />;
      case "imagination":
        return <ImaginationScreen />;
      case "feelings":
        return <FeelingsScreen />;
      case "features":
        return <FeaturesScreen />;
      case "finalVision":
        return <FinalVisionScreen onGenerate={handleGenerate} />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-20 sm:px-6">
        {status === "loading" ? (
          <LoadingVision />
        ) : status === "error" ? (
          <div
            role="alert"
            className="mt-8 flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center"
          >
            <p className="t-body text-ink-2">{t("errors.generate")}</p>
            <Button onClick={handleGenerate}>{t("errors.retry")}</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-7 py-2">
            {currentKey !== "welcome" && <ProgressBar currentScreen={currentKey} />}
            {renderScreen()}
          </div>
        )}
      </main>
    </div>
  );
}

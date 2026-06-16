"use client";

import { useEffect, useState } from "react";
import type { Scale } from "@/lib/content";
import type { ContributionInput } from "@/lib/types";
import { readCachedVision } from "@/lib/visionCache";
import { VisioningFlow } from "./VisioningFlow";

interface EditVisionFlowProps {
  id: string;
  /** Inputs from the DB. If absent (standalone / no DB), read the client cache. */
  initialData?: Partial<ContributionInput>;
  sessionId?: string | null;
  fixedScale?: Scale | null;
}

/**
 * Edit window (BUILD-SPEC §9.4): re-open the form pre-filled and re-generate.
 * Generation updates the existing row in place via `editId`.
 */
export function EditVisionFlow({
  id,
  initialData,
  sessionId = null,
  fixedScale = null,
}: EditVisionFlowProps) {
  const [data, setData] = useState<Partial<ContributionInput> | undefined>(initialData);
  const [ready, setReady] = useState(Boolean(initialData));

  useEffect(() => {
    if (initialData) return;
    const cached = readCachedVision(id);
    if (cached) setData(cached.input);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  return (
    <VisioningFlow
      editId={id}
      initialData={data}
      sessionId={sessionId ?? data?.sessionId ?? null}
      fixedScale={fixedScale}
    />
  );
}

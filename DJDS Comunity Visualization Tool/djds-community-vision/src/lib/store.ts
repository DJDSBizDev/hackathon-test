"use client";

import { create } from "zustand";
import {
  type Scale,
  type ScreenKey,
  SCREENS,
  FEELINGS_CAP,
  FEATURES_CAP,
} from "./content";
import type { ContributionInput } from "./types";

/**
 * Returns the ordered screen keys for the current flow. When a session fixes
 * the scale, the Scale step (7.1) is skipped entirely (BUILD-SPEC §9.2).
 */
export function visibleScreens(fixedScale: Scale | null): ScreenKey[] {
  return SCREENS.map((s) => s.key).filter(
    (k) => !(fixedScale && k === "scale"),
  );
}

interface FormState {
  // ---- context (set when entering a session) ----
  sessionId: string | null;
  fixedScale: Scale | null;

  // ---- navigation ----
  screenIndex: number; // index into visibleScreens(fixedScale)

  // ---- answers ----
  scale: Scale | null;
  myPeopleAre: string;
  sensoryFeelings: string[];
  communityBelonging: string[];
  sensoryImagination: string;
  feelings: string[];
  features: string[];
  finalVision: string;
  displayName: string;

  // ---- gentle one-time nudge state (7.7) ----
  finalVisionNudged: boolean;

  // ---- actions ----
  initContext: (ctx: { sessionId?: string | null; fixedScale?: Scale | null }) => void;
  setScale: (scale: Scale) => void;
  setText: (
    field:
      | "myPeopleAre"
      | "sensoryImagination"
      | "finalVision"
      | "displayName",
    value: string,
  ) => void;
  toggleSensory: (tag: string) => void;
  toggleBelonging: (tag: string) => void;
  toggleFeeling: (tag: string) => void;
  toggleFeature: (tag: string) => void;
  markFinalVisionNudged: () => void;

  next: () => void;
  back: () => void;
  goToScreen: (key: ScreenKey) => void;
  currentScreen: () => ScreenKey;

  reset: () => void;
  hydrate: (data: Partial<ContributionInput>) => void;

  toInput: (language: string) => ContributionInput | null;
}

const initialAnswers = {
  scale: null as Scale | null,
  myPeopleAre: "",
  sensoryFeelings: [] as string[],
  communityBelonging: [] as string[],
  sensoryImagination: "",
  feelings: [] as string[],
  features: [] as string[],
  finalVision: "",
  displayName: "",
  finalVisionNudged: false,
};

/** Toggle membership of `tag` in `list`, respecting an optional hard cap. */
function toggle(list: string[], tag: string, cap?: number): string[] {
  if (list.includes(tag)) return list.filter((t) => t !== tag);
  if (cap !== undefined && list.length >= cap) return list; // hard cap — ignore
  return [...list, tag];
}

export const useFormStore = create<FormState>((set, get) => ({
  sessionId: null,
  fixedScale: null,
  screenIndex: 0,
  ...initialAnswers,

  initContext: ({ sessionId = null, fixedScale = null }) =>
    set({
      sessionId,
      fixedScale,
      scale: fixedScale ?? get().scale,
    }),

  setScale: (scale) => {
    set({ scale });
    // Selecting a scale auto-advances to Step 2a (BUILD-SPEC §7.1).
    const order = visibleScreens(get().fixedScale);
    const idx = order.indexOf("scale");
    if (idx >= 0 && idx < order.length - 1) set({ screenIndex: idx + 1 });
  },

  setText: (field, value) => set({ [field]: value } as Partial<FormState>),

  toggleSensory: (tag) =>
    set((s) => ({ sensoryFeelings: toggle(s.sensoryFeelings, tag) })),
  toggleBelonging: (tag) =>
    set((s) => ({ communityBelonging: toggle(s.communityBelonging, tag) })),
  toggleFeeling: (tag) =>
    set((s) => ({ feelings: toggle(s.feelings, tag, FEELINGS_CAP) })),
  toggleFeature: (tag) =>
    set((s) => ({ features: toggle(s.features, tag, FEATURES_CAP) })),

  markFinalVisionNudged: () => set({ finalVisionNudged: true }),

  next: () => {
    const order = visibleScreens(get().fixedScale);
    set((s) => ({ screenIndex: Math.min(s.screenIndex + 1, order.length - 1) }));
  },
  back: () => set((s) => ({ screenIndex: Math.max(s.screenIndex - 1, 0) })),
  goToScreen: (key) => {
    const order = visibleScreens(get().fixedScale);
    const idx = order.indexOf(key);
    if (idx >= 0) set({ screenIndex: idx });
  },
  currentScreen: () => {
    const order = visibleScreens(get().fixedScale);
    return order[Math.min(get().screenIndex, order.length - 1)];
  },

  reset: () =>
    set({
      screenIndex: 0,
      ...initialAnswers,
      // keep session context across a reset within the same session
      scale: get().fixedScale ?? null,
    }),

  hydrate: (data) =>
    set((s) => ({
      scale: data.scale ?? s.scale,
      myPeopleAre: data.myPeopleAre ?? s.myPeopleAre,
      sensoryFeelings: data.sensoryFeelings ?? s.sensoryFeelings,
      communityBelonging: data.communityBelonging ?? s.communityBelonging,
      sensoryImagination: data.sensoryImagination ?? s.sensoryImagination,
      feelings: data.feelings ?? s.feelings,
      features: data.features ?? s.features,
      finalVision: data.finalVision ?? s.finalVision,
      displayName: data.displayName ?? s.displayName,
    })),

  toInput: (language) => {
    const s = get();
    if (!s.scale) return null; // scale is the only hard requirement
    return {
      scale: s.scale,
      myPeopleAre: s.myPeopleAre.trim(),
      sensoryFeelings: s.sensoryFeelings,
      communityBelonging: s.communityBelonging,
      sensoryImagination: s.sensoryImagination.trim(),
      feelings: s.feelings,
      features: s.features,
      finalVision: s.finalVision.trim(),
      displayName: s.displayName.trim(),
      language,
      sessionId: s.sessionId,
    };
  },
}));

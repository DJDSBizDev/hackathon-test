/**
 * Structural, non-text configuration for the visioning form.
 *
 * Human-readable copy lives in the i18n resource (`src/i18n/en.ts`) per
 * BUILD-SPEC §11. This module holds the data/logic that drives the form:
 * the canonical scale values, accent mapping, hard caps, and char limits.
 *
 * The option *values* (scales, feelings, belonging tags, features) are the
 * canonical English strings stored in the DB and sent to Claude. For English
 * (the only language this scope ships) those strings equal their display
 * labels, which is why the labels are sourced from i18n by the same key.
 */

export type Scale = "room" | "building" | "block" | "city" | "planet";

/** Display order of the five scales (BUILD-SPEC §7.1). */
export const SCALES: Scale[] = ["room", "building", "block", "city", "planet"];

/** Semantic accent token per scale (drives card highlight color, §7.1). */
export type AccentName = "teal" | "amber" | "accent" | "blue" | "success";

export const SCALE_ACCENT: Record<Scale, AccentName> = {
  room: "teal",
  building: "amber",
  block: "accent", // coral — default highlight
  city: "blue",
  planet: "success",
};

/** Whether a scale card shows an optional "size" label (§7.1). */
export const SCALE_SIZE_LABEL: Partial<Record<Scale, "smallest" | "largest">> = {
  room: "smallest",
  planet: "largest",
};

/** Hard selection caps (enforced in the store, BUILD-SPEC §7.5 / §7.6). */
export const FEELINGS_CAP = 5;
export const FEATURES_CAP = 8;

/** Hard character limits (enforced at input, BUILD-SPEC §7). */
export const CHAR_LIMITS = {
  myPeopleAre: 500,
  sensoryImagination: 500,
  finalVision: 800,
  displayName: 100,
} as const;

/** The five labeled steps shown on the progress bar (BUILD-SPEC §5.4). */
export const PROGRESS_STEPS = [
  "scale",
  "values",
  "feelings",
  "features",
  "vision",
] as const;
export type ProgressStep = (typeof PROGRESS_STEPS)[number];

/**
 * The 8 form screens. Steps 2a/2b/2c all map to the "values" progress step
 * (the bar does NOT advance across them, §5.4).
 */
export const SCREENS = [
  { key: "welcome", progress: null, stepLabel: null },
  { key: "scale", progress: "scale", stepLabel: "1" },
  { key: "sensory", progress: "values", stepLabel: "2a" },
  { key: "belonging", progress: "values", stepLabel: "2b" },
  { key: "imagination", progress: "values", stepLabel: "2c" },
  { key: "feelings", progress: "feelings", stepLabel: "3" },
  { key: "features", progress: "features", stepLabel: "4" },
  { key: "finalVision", progress: "vision", stepLabel: "5" },
] as const;

export type ScreenKey = (typeof SCREENS)[number]["key"];

/** Index of the first real form screen (Scale) — Welcome sits before it. */
export const FIRST_FORM_SCREEN_INDEX = 1;

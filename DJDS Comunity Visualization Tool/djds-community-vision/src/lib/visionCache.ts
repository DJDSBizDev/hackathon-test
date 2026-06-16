"use client";

import type { ContributionInput } from "./types";

/**
 * Client-side cache of a freshly generated vision, keyed by id. Lets the
 * standalone loop (no database) render the vision page immediately after
 * generation. Once Supabase is configured the vision page fetches from the DB
 * instead, and this is just a fast path / offline fallback.
 */
export interface CachedVision {
  id: string;
  imageUrl: string;
  input: ContributionInput;
}

const key = (id: string) => `vision:${id}`;

export function cacheVision(v: CachedVision): void {
  try {
    sessionStorage.setItem(key(v.id), JSON.stringify(v));
  } catch {
    // sessionStorage unavailable (e.g. private mode) — non-fatal.
  }
}

export function readCachedVision(id: string): CachedVision | null {
  try {
    const raw = sessionStorage.getItem(key(id));
    return raw ? (JSON.parse(raw) as CachedVision) : null;
  } catch {
    return null;
  }
}

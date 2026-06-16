/**
 * Server-only data layer (BUILD-SPEC §12). All DB access goes through here
 * using the Supabase SERVICE ROLE key, which must never reach the browser.
 *
 * Everything degrades gracefully when Supabase isn't configured: reads return
 * null/empty and writes no-op, so the standalone generate→vision loop works
 * with no database (BUILD-SPEC §13: "Ship 1–5 as a satisfying standalone loop").
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Scale } from "./content";
import type {
  Contribution,
  ContributionInput,
  ContributionSummary,
  ScaleMode,
  Session,
  SessionStatus,
  Visibility,
} from "./types";
import { slugify, randomToken } from "./slug";
import { hashPin, verifyPinHash } from "./pin";

let _client: SupabaseClient | null = null;

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function db(): SupabaseClient | null {
  if (!isDbConfigured()) return null;
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return _client;
}

// ---- row mapping ------------------------------------------------------------

interface ContributionRow {
  id: string;
  session_id: string | null;
  display_name: string | null;
  language: string;
  scale: Scale;
  my_people_are: string | null;
  sensory_feelings: string[];
  community_belonging: string[];
  sensory_imagination: string | null;
  feelings: string[];
  features: string[];
  final_vision: string | null;
  image_url: string;
  created_at: string;
  updated_at: string;
}

function toContribution(r: ContributionRow): Contribution {
  return {
    id: r.id,
    sessionId: r.session_id,
    displayName: r.display_name ?? "",
    language: r.language,
    scale: r.scale,
    myPeopleAre: r.my_people_are ?? "",
    sensoryFeelings: r.sensory_feelings ?? [],
    communityBelonging: r.community_belonging ?? [],
    sensoryImagination: r.sensory_imagination ?? "",
    feelings: r.feelings ?? [],
    features: r.features ?? [],
    finalVision: r.final_vision ?? "",
    imageUrl: r.image_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toRow(input: ContributionInput, imageUrl: string) {
  return {
    session_id: input.sessionId ?? null,
    display_name: input.displayName?.trim() || null,
    language: input.language || "en",
    scale: input.scale,
    my_people_are: input.myPeopleAre?.trim() || null,
    sensory_feelings: input.sensoryFeelings ?? [],
    community_belonging: input.communityBelonging ?? [],
    sensory_imagination: input.sensoryImagination?.trim() || null,
    feelings: input.feelings ?? [],
    features: input.features ?? [],
    final_vision: input.finalVision?.trim() || null,
    image_url: imageUrl,
  };
}

/** Storage bucket for generated images (created in supabase/schema.sql). */
const VISION_BUCKET = "visions";

/**
 * Upload a generated PNG to Supabase Storage and return its public URL.
 * Returns null if Storage isn't configured or the upload fails — callers fall
 * back to an inline data: URL.
 */
export async function uploadVisionImage(
  id: string,
  base64: string,
  mimeType: string,
): Promise<string | null> {
  const client = db();
  if (!client) return null;
  const ext = mimeType.includes("jpeg") ? "jpg" : "png";
  const path = `${id}.${ext}`;
  const bytes = Buffer.from(base64, "base64");
  const { error } = await client.storage
    .from(VISION_BUCKET)
    .upload(path, bytes, { contentType: mimeType, upsert: true });
  if (error) {
    console.error("[db] uploadVisionImage failed:", error.message);
    return null;
  }
  const { data } = client.storage.from(VISION_BUCKET).getPublicUrl(path);
  return data.publicUrl ?? null;
}

// ---- contributions ----------------------------------------------------------

/** Insert a contribution. Returns the saved row, or null if DB not configured. */
export async function insertContribution(
  input: ContributionInput,
  imageUrl: string,
  id?: string,
): Promise<Contribution | null> {
  const client = db();
  if (!client) return null;
  const row = id ? { id, ...toRow(input, imageUrl) } : toRow(input, imageUrl);
  const { data, error } = await client
    .from("contributions")
    .insert(row)
    .select()
    .single();
  if (error || !data) {
    console.error("[db] insertContribution failed:", error?.message);
    return null;
  }
  return toContribution(data as ContributionRow);
}

/** Update an existing contribution (edit window, §9.4). */
export async function updateContribution(
  id: string,
  input: ContributionInput,
  imageUrl: string,
): Promise<Contribution | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("contributions")
    .update({ ...toRow(input, imageUrl), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) {
    console.error("[db] updateContribution failed:", error?.message);
    return null;
  }
  return toContribution(data as ContributionRow);
}

export async function getContributionById(
  id: string,
): Promise<Contribution | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("contributions")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[db] getContributionById failed:", error.message);
    return null;
  }
  return data ? toContribution(data as ContributionRow) : null;
}

/** Contributions for a session, newest first. */
export async function listContributionsBySession(
  sessionId: string,
): Promise<Contribution[]> {
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("contributions")
    .select()
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });
  if (error || !data) {
    console.error("[db] listContributionsBySession failed:", error?.message);
    return [];
  }
  return (data as ContributionRow[]).map(toContribution);
}

// ---- sessions ---------------------------------------------------------------

interface SessionRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  scale_mode: ScaleMode;
  visibility: Visibility;
  status: SessionStatus;
  facilitator_pin_hash: string;
  created_at: string;
  updated_at: string;
}

function toSession(r: SessionRow): Session {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    scaleMode: r.scale_mode,
    visibility: r.visibility,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export interface CreateSessionInput {
  title: string;
  description?: string;
  scaleMode: ScaleMode;
  visibility: Visibility;
}

/**
 * Create a session with a collision-safe slug and a bcrypt-hashed PIN. Returns
 * the session plus the PLAINTEXT pin (shown to the facilitator exactly once,
 * §9.1) — the plaintext is never stored. Returns null if DB not configured.
 */
export async function createSession(
  input: CreateSessionInput,
  pin: string,
): Promise<{ session: Session; pin: string } | null> {
  const client = db();
  if (!client) return null;

  const pinHash = await hashPin(pin);
  const base = slugify(input.title);

  // Retry on slug collision a few times before giving up.
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? `${base}-${randomToken(3)}` : `${base}-${randomToken(5)}`;
    const { data, error } = await client
      .from("sessions")
      .insert({
        slug,
        title: input.title,
        description: input.description?.trim() || null,
        scale_mode: input.scaleMode,
        visibility: input.visibility,
        status: "open",
        facilitator_pin_hash: pinHash,
      })
      .select()
      .single();
    if (!error && data) {
      return { session: toSession(data as SessionRow), pin };
    }
    if (error && error.code !== "23505") {
      // 23505 = unique_violation (slug taken) — anything else is fatal.
      console.error("[db] createSession failed:", error.message);
      return null;
    }
  }
  console.error("[db] createSession: exhausted slug attempts");
  return null;
}

export async function getSessionById(id: string): Promise<Session | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("sessions")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[db] getSessionById failed:", error.message);
    return null;
  }
  return data ? toSession(data as SessionRow) : null;
}

export async function getSessionBySlug(slug: string): Promise<Session | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("sessions")
    .select()
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[db] getSessionBySlug failed:", error.message);
    return null;
  }
  return data ? toSession(data as SessionRow) : null;
}

/** Verify a facilitator PIN against the stored hash for a session (§9.3). */
export async function verifySessionPin(
  slug: string,
  pin: string,
): Promise<boolean> {
  const client = db();
  if (!client) return false;
  const { data, error } = await client
    .from("sessions")
    .select("facilitator_pin_hash")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return false;
  return verifyPinHash(pin, (data as SessionRow).facilitator_pin_hash);
}

/** Update a session's visibility and/or status (dashboard toggles, §9.3). */
export async function updateSession(
  slug: string,
  patch: Partial<Pick<Session, "visibility" | "status">>,
): Promise<Session | null> {
  const client = db();
  if (!client) return null;
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.visibility) update.visibility = patch.visibility;
  if (patch.status) update.status = patch.status;
  const { data, error } = await client
    .from("sessions")
    .update(update)
    .eq("slug", slug)
    .select()
    .single();
  if (error || !data) {
    console.error("[db] updateSession failed:", error?.message);
    return null;
  }
  return toSession(data as SessionRow);
}

// ---- aggregates & mosaic ----------------------------------------------------

export interface SessionAggregates {
  total: number;
  byScale: Record<string, number>;
  topSensory: [string, number][];
  topBelonging: [string, number][];
  topFeelings: [string, number][];
  topFeatures: [string, number][];
}

function countTop(rows: Contribution[], field: keyof Contribution): [string, number][] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const arr = r[field] as unknown as string[];
    for (const v of arr ?? []) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** Frequency breakdowns for the facilitator dashboard (§9.3). */
export function computeAggregates(rows: Contribution[]): SessionAggregates {
  const byScale: Record<string, number> = {};
  for (const r of rows) byScale[r.scale] = (byScale[r.scale] ?? 0) + 1;
  return {
    total: rows.length,
    byScale,
    topSensory: countTop(rows, "sensoryFeelings"),
    topBelonging: countTop(rows, "communityBelonging"),
    topFeelings: countTop(rows, "feelings"),
    topFeatures: countTop(rows, "features"),
  };
}

/** Compact cards for the public mosaic (§10): svg + name + scale + up to 3 tags. */
export function toMosaicSummaries(rows: Contribution[]): ContributionSummary[] {
  return rows.map((r) => ({
    id: r.id,
    displayName: r.displayName || null,
    scale: r.scale,
    imageUrl: r.imageUrl,
    tags: [...r.communityBelonging, ...r.feelings].slice(0, 3),
    createdAt: r.createdAt,
  }));
}

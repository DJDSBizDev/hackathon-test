/**
 * POST /api/generate — generate a photorealistic vision image.
 * Validate input → call the Gemini image model → store the PNG (Supabase
 * Storage if configured, else an inline data: URL) → persist the contribution
 * → return the image URL. Runs only on the server; the image + DB keys never
 * reach the client.
 */
import { SCALES, CHAR_LIMITS, type Scale } from "@/lib/content";
import { generateImage } from "@/lib/imagen";
import {
  insertContribution,
  updateContribution,
  getContributionById,
  getSessionById,
  uploadVisionImage,
} from "@/lib/db";
import type { ContributionInput, GenerateResponse } from "@/lib/types";

export const runtime = "nodejs";
// Image generation is fast (~5–30s), but leave headroom for Storage upload.
export const maxDuration = 60;

function fail(code: string, status = 400): Response {
  const body: GenerateResponse = { success: false, error: code, code };
  return Response.json(body, { status });
}

/** Defensively validate + clamp the incoming payload. Returns null if invalid. */
function validate(body: unknown): ContributionInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.scale !== "string" || !SCALES.includes(b.scale as Scale)) {
    return null; // scale is the only hard requirement
  }
  const strArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  const str = (v: unknown, max: number): string =>
    typeof v === "string" ? v.slice(0, max) : "";

  return {
    scale: b.scale as Scale,
    myPeopleAre: str(b.myPeopleAre, CHAR_LIMITS.myPeopleAre),
    sensoryFeelings: strArray(b.sensoryFeelings),
    communityBelonging: strArray(b.communityBelonging),
    sensoryImagination: str(b.sensoryImagination, CHAR_LIMITS.sensoryImagination),
    feelings: strArray(b.feelings).slice(0, 5),
    features: strArray(b.features).slice(0, 8),
    finalVision: str(b.finalVision, CHAR_LIMITS.finalVision),
    displayName: str(b.displayName, CHAR_LIMITS.displayName),
    language: typeof b.language === "string" ? b.language.slice(0, 8) : "en",
    sessionId: typeof b.sessionId === "string" ? b.sessionId : null,
  };
}

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("invalid_json");
  }

  const input = validate(raw);
  if (!input) return fail("invalid_input");

  const editId =
    raw && typeof raw === "object" && typeof (raw as Record<string, unknown>).editId === "string"
      ? ((raw as Record<string, unknown>).editId as string)
      : null;

  let image: Awaited<ReturnType<typeof generateImage>>;
  try {
    image = await generateImage(input);
  } catch (err) {
    console.error("[generate] image generation failed:", err);
    return fail("generation_failed", 502);
  }
  if (!image) return fail("generation_failed", 502);

  const id = editId ?? crypto.randomUUID();

  // Prefer Supabase Storage; fall back to an inline data: URL (standalone loop).
  let imageUrl: string;
  try {
    const stored = await uploadVisionImage(id, image.base64, image.mimeType);
    imageUrl = stored ?? `data:${image.mimeType};base64,${image.base64}`;
  } catch (err) {
    console.error("[generate] storage upload failed (non-fatal):", err);
    imageUrl = `data:${image.mimeType};base64,${image.base64}`;
  }

  // Persist if Supabase is configured.
  try {
    if (editId) {
      // Edit window (§9.4): update in place, enforcing the open-session rule.
      const existing = await getContributionById(editId);
      if (existing) {
        if (existing.sessionId) {
          const session = await getSessionById(existing.sessionId);
          if (session && session.status === "closed") {
            return fail("edit_not_allowed", 403);
          }
        }
        await updateContribution(
          editId,
          { ...input, sessionId: existing.sessionId },
          imageUrl,
        );
      }
      // else: not in the DB (standalone) — keep editId, cache updates in place.
    } else {
      await insertContribution(input, imageUrl, id);
    }
  } catch (err) {
    console.error("[generate] persist failed (non-fatal):", err);
  }

  const origin = new URL(req.url).origin;
  const body: GenerateResponse = {
    success: true,
    id,
    imageUrl,
    url: `${origin}/vision/${id}`,
  };
  return Response.json(body);
}

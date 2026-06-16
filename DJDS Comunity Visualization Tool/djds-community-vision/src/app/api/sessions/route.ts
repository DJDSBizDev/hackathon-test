/**
 * POST /api/sessions — create a facilitator session (BUILD-SPEC §9.1).
 * Returns the slug + the PLAINTEXT pin (shown once on the client) and the
 * share / dashboard URLs. The pin is only ever stored as a bcrypt hash.
 */
import { SCALES, type Scale } from "@/lib/content";
import { createSession, isDbConfigured } from "@/lib/db";
import { generatePin } from "@/lib/pin";
import type { ScaleMode, Visibility } from "@/lib/types";

export const runtime = "nodejs";

function err(code: string, status: number): Response {
  return Response.json({ success: false, code }, { status });
}

export async function POST(req: Request): Promise<Response> {
  if (!isDbConfigured()) return err("db_unconfigured", 503);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return err("invalid_json", 400);
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return err("title_required", 400);

  const scaleMode: ScaleMode =
    body.scaleMode === "open" || SCALES.includes(body.scaleMode as Scale)
      ? (body.scaleMode as ScaleMode)
      : "open";
  const visibility: Visibility = body.visibility === "public" ? "public" : "private";
  const description =
    typeof body.description === "string" ? body.description.slice(0, 500) : "";

  const pin = generatePin();
  const result = await createSession(
    { title: title.slice(0, 120), description, scaleMode, visibility },
    pin,
  );
  if (!result) return err("create_failed", 500);

  const origin = new URL(req.url).origin;
  return Response.json({
    success: true,
    slug: result.session.slug,
    pin: result.pin,
    shareUrl: `${origin}/s/${result.session.slug}`,
    dashboardUrl: `${origin}/facilitator/${result.session.slug}`,
  });
}

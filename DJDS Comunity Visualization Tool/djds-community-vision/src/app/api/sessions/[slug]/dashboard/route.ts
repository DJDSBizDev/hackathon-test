/**
 * POST /api/sessions/[slug]/dashboard — PIN-gated dashboard data (BUILD-SPEC §9.3).
 * Verifies the PIN against the stored hash (rate-limited) and, on success,
 * returns aggregates + every contribution for the session.
 */
import {
  verifySessionPin,
  getSessionBySlug,
  listContributionsBySession,
  computeAggregates,
} from "@/lib/db";

export const runtime = "nodejs";

// Simple in-memory attempt limiter (per session, per server process).
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 5 * 60 * 1000;

function isLocked(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now > rec.resetAt) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}
function bump(key: string): void {
  const rec = attempts.get(key);
  if (rec) rec.count += 1;
}

function err(code: string, status: number): Response {
  return Response.json({ success: false, code }, { status });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await ctx.params;

  let body: { pin?: unknown };
  try {
    body = (await req.json()) as { pin?: unknown };
  } catch {
    return err("invalid_json", 400);
  }
  const pin = typeof body.pin === "string" ? body.pin : "";

  if (isLocked(slug)) return err("locked", 429);

  const ok = await verifySessionPin(slug, pin);
  if (!ok) {
    bump(slug);
    return err("wrong_pin", 401);
  }
  attempts.delete(slug); // reset limiter on success

  const session = await getSessionBySlug(slug);
  if (!session) return err("not_found", 404);

  const rows = await listContributionsBySession(session.id);
  return Response.json({
    success: true,
    session: {
      title: session.title,
      slug: session.slug,
      visibility: session.visibility,
      status: session.status,
      scaleMode: session.scaleMode,
    },
    aggregates: computeAggregates(rows),
    contributions: rows,
  });
}

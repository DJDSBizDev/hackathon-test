/**
 * POST /api/sessions/[slug]/update — toggle visibility / status (BUILD-SPEC §9.3).
 * PIN-authorized: the same PIN that opens the dashboard must accompany the change.
 */
import { verifySessionPin, updateSession } from "@/lib/db";

export const runtime = "nodejs";

function err(code: string, status: number): Response {
  return Response.json({ success: false, code }, { status });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await ctx.params;

  let body: { pin?: unknown; visibility?: unknown; status?: unknown };
  try {
    body = await req.json();
  } catch {
    return err("invalid_json", 400);
  }

  const pin = typeof body.pin === "string" ? body.pin : "";
  const ok = await verifySessionPin(slug, pin);
  if (!ok) return err("wrong_pin", 401);

  const patch: { visibility?: "private" | "public"; status?: "open" | "closed" } = {};
  if (body.visibility === "private" || body.visibility === "public") {
    patch.visibility = body.visibility;
  }
  if (body.status === "open" || body.status === "closed") {
    patch.status = body.status;
  }
  if (!patch.visibility && !patch.status) return err("nothing_to_update", 400);

  const session = await updateSession(slug, patch);
  if (!session) return err("update_failed", 500);

  return Response.json({
    success: true,
    visibility: session.visibility,
    status: session.status,
  });
}

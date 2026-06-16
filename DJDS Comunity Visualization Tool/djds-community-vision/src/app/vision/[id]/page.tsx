import { getContributionById, getSessionById } from "@/lib/db";
import { VisionView } from "@/components/VisionView";

/**
 * Vision page (BUILD-SPEC §5.1 step 11). Tries the DB first; if Supabase isn't
 * configured or the id is unknown, VisionView falls back to the client cache so
 * the standalone loop still renders the freshly generated vision.
 */
export default async function VisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contribution = await getContributionById(id);

  // Editable while the parent session is open; standalone visions stay editable.
  let canEdit = true;
  if (contribution?.sessionId) {
    const session = await getSessionById(contribution.sessionId);
    canEdit = !session || session.status === "open";
  }

  return (
    <VisionView
      id={id}
      initialImageUrl={contribution?.imageUrl}
      initialName={contribution?.displayName ?? ""}
      initialScale={contribution?.scale ?? null}
      hasSession={Boolean(contribution?.sessionId)}
      canEdit={canEdit}
    />
  );
}

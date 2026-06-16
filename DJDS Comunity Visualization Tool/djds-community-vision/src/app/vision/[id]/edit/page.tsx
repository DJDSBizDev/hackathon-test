import { redirect } from "next/navigation";
import { getContributionById, getSessionById } from "@/lib/db";
import type { Scale } from "@/lib/content";
import { EditVisionFlow } from "@/components/EditVisionFlow";

/**
 * /vision/[id]/edit — re-open a vision for editing (BUILD-SPEC §9.4).
 * Editable only while the parent session is open; standalone visions are
 * editable while the link exists.
 */
export default async function EditVisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contribution = await getContributionById(id);

  if (contribution) {
    let fixedScale: Scale | null = null;
    if (contribution.sessionId) {
      const session = await getSessionById(contribution.sessionId);
      if (session) {
        if (session.status === "closed") redirect(`/vision/${id}`); // read-only
        if (session.scaleMode !== "open") fixedScale = session.scaleMode;
      }
    }
    return (
      <EditVisionFlow
        id={id}
        sessionId={contribution.sessionId}
        fixedScale={fixedScale}
        initialData={{
          scale: contribution.scale,
          myPeopleAre: contribution.myPeopleAre,
          sensoryFeelings: contribution.sensoryFeelings,
          communityBelonging: contribution.communityBelonging,
          sensoryImagination: contribution.sensoryImagination,
          feelings: contribution.feelings,
          features: contribution.features,
          finalVision: contribution.finalVision,
          displayName: contribution.displayName,
          sessionId: contribution.sessionId,
        }}
      />
    );
  }

  // Standalone / DB-unconfigured: the client reads the cached inputs.
  return <EditVisionFlow id={id} />;
}

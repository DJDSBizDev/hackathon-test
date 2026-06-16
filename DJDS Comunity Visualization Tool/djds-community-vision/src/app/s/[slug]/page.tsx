import {
  getSessionBySlug,
  listContributionsBySession,
  toMosaicSummaries,
} from "@/lib/db";
import { en } from "@/i18n/en";
import { TopBar } from "@/components/TopBar";
import { SessionLanding } from "@/components/SessionLanding";

/** /s/[slug] — community entry to a session (BUILD-SPEC §5.2 / §5.3). */
export default async function SessionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSessionBySlug(slug);

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 sm:px-6">
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <p className="t-body text-ink-2">{en.errors.notFound}</p>
            <a href="/" className="t-small text-accent underline-offset-4 hover:underline">
              {en.vision.startOver}
            </a>
          </div>
        </main>
      </div>
    );
  }

  // Contributions are only fetched (for the mosaic) when the session is public.
  const summaries =
    session.visibility === "public"
      ? toMosaicSummaries(await listContributionsBySession(session.id))
      : [];

  return (
    <SessionLanding
      sessionId={session.id}
      scaleMode={session.scaleMode}
      visibility={session.visibility}
      status={session.status}
      summaries={summaries}
    />
  );
}

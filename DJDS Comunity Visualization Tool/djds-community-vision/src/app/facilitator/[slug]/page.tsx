import { DashboardGate } from "@/components/facilitator/Dashboard";

/** /facilitator/[slug] — PIN-gated facilitator dashboard (BUILD-SPEC §9.3). */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <DashboardGate slug={slug} />;
}

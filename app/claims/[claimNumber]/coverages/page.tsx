import { notFound } from 'next/navigation';
import { CoverageAgentView } from '@/components/workbench/coverage-agent-view';
import { CLAIM } from '@/lib/scenario/claim';

export default async function CoveragesPage({
  params,
}: {
  params: Promise<{ claimNumber: string }>;
}) {
  const { claimNumber } = await params;
  if (claimNumber !== CLAIM.claim_number) notFound();
  return <CoverageAgentView />;
}

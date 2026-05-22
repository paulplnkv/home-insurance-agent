import { notFound } from 'next/navigation';
import { DamageAgentView } from '@/components/workbench/damage-agent-view';
import { CLAIM } from '@/lib/scenario/claim';

export default async function DamagesPage({
  params,
}: {
  params: Promise<{ claimNumber: string }>;
}) {
  const { claimNumber } = await params;
  if (claimNumber !== CLAIM.claim_number) notFound();
  return <DamageAgentView />;
}

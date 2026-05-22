import { notFound } from 'next/navigation';
import { DocumentsAgentView } from '@/components/workbench/documents-agent-view';
import { CLAIM } from '@/lib/scenario/claim';

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ claimNumber: string }>;
}) {
  const { claimNumber } = await params;
  if (claimNumber !== CLAIM.claim_number) notFound();
  return <DocumentsAgentView />;
}

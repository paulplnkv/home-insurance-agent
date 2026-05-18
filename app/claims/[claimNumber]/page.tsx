import { notFound } from 'next/navigation';
import { AppBar } from '@/components/workbench/app-bar';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimFile } from '@/components/workbench/claim-file';
import { ClaimHeader } from '@/components/workbench/claim-header';
import { ClaimSubTabs } from '@/components/workbench/claim-sub-tabs';
import { CLAIM } from '@/lib/scenario/claim';

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ claimNumber: string }>;
}) {
  const { claimNumber } = await params;
  if (claimNumber !== CLAIM.claim_number) notFound();

  return (
    <div className="min-h-screen bg-background">
      <AppBar />
      <ClaimSubTabs />
      <Breadcrumb />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-4">
        <ClaimHeader />
        <ClaimFile />
      </main>
    </div>
  );
}

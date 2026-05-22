import { notFound } from 'next/navigation';
import { AppBar } from '@/components/workbench/app-bar';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimFile } from '@/components/workbench/claim-file';
import { ClaimHeader, ClaimStatsBar } from '@/components/workbench/claim-header';
import { ClaimInsuredLoss } from '@/components/workbench/claim-insured-loss';
import { ClaimPolicySnapshot } from '@/components/workbench/claim-policy-snapshot';
import { ClaimSidebar } from '@/components/workbench/claim-sidebar';
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
    <div className="min-h-screen bg-white">
      <AppBar />
      <ClaimSubTabs />
      <main className="mx-auto w-full max-w-[1600px] px-10 pt-8 pb-12">
        <Breadcrumb />
        <ClaimHeader />
        <div className="mt-6">
          <ClaimStatsBar />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1.42fr] lg:items-start">
          <div className="flex flex-col gap-4">
            <ClaimInsuredLoss />
            <ClaimPolicySnapshot />
            <ClaimFile />
          </div>
          <ClaimSidebar />
        </div>
      </main>
    </div>
  );
}

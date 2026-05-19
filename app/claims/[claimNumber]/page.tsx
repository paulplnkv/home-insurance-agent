import { notFound } from 'next/navigation';
import { AppBar } from '@/components/workbench/app-bar';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimFile } from '@/components/workbench/claim-file';
import { ClaimHeader } from '@/components/workbench/claim-header';
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
    <div className="min-h-screen bg-background">
      <AppBar />
      <ClaimSubTabs />
      <Breadcrumb />
      <main className="mx-auto w-full max-w-[1440px] px-6 py-4">
        <ClaimHeader />
        <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
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

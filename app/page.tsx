import { AppBar } from '@/components/workbench/app-bar';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimFile } from '@/components/workbench/claim-file';
import { ClaimHeader } from '@/components/workbench/claim-header';
import { ClaimSubTabs } from '@/components/workbench/claim-sub-tabs';

export default function WorkbenchPage() {
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

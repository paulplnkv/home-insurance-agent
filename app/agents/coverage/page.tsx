'use client';

import { AppBar } from '@/components/workbench/app-bar';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimHeader } from '@/components/workbench/claim-header';
import { ClaimSubTabs } from '@/components/workbench/claim-sub-tabs';
import { AgentPageBody } from '@/components/workbench/agent-page';
import { coverageAgentConfig } from '@/components/workbench/coverage-agent-panel';
import { CoverageOutput } from '@/components/workbench/coverage-output';
import { usePersistedAgent } from '@/hooks/use-persisted-agent';

export default function CoverageAgentPage() {
  const agent = usePersistedAgent({
    api: coverageAgentConfig.api,
    schema: coverageAgentConfig.schema,
    storageKey: coverageAgentConfig.storageKey,
  });

  return (
    <div className="min-h-screen bg-background">
      <AppBar />
      <ClaimSubTabs />
      <Breadcrumb />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-4">
        <ClaimHeader />
        <AgentPageBody
          title={coverageAgentConfig.title}
          description={coverageAgentConfig.description}
          idlePlaceholder={coverageAgentConfig.idlePlaceholder}
          state={agent.state}
          startedAt={agent.startedAt}
          endedAt={agent.endedAt}
          error={agent.error}
          onRun={agent.submit}
          onStop={agent.stop}
          onReset={agent.reset}
        >
          <CoverageOutput key={agent.resetKey} object={agent.object} />
        </AgentPageBody>
      </main>
    </div>
  );
}

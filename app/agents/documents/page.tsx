'use client';

import { AppBar } from '@/components/workbench/app-bar';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimHeader } from '@/components/workbench/claim-header';
import { ClaimSubTabs } from '@/components/workbench/claim-sub-tabs';
import { AgentPageBody } from '@/components/workbench/agent-page';
import { documentsAgentConfig } from '@/components/workbench/documents-agent-panel';
import { DocumentsOutput } from '@/components/workbench/documents-output';
import { usePersistedAgent } from '@/hooks/use-persisted-agent';

export default function DocumentsAgentPage() {
  const agent = usePersistedAgent({
    api: documentsAgentConfig.api,
    schema: documentsAgentConfig.schema,
    storageKey: documentsAgentConfig.storageKey,
  });

  return (
    <div className="min-h-screen bg-background">
      <AppBar />
      <ClaimSubTabs />
      <Breadcrumb />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-4">
        <ClaimHeader />
        <AgentPageBody
          title={documentsAgentConfig.title}
          description={documentsAgentConfig.description}
          idlePlaceholder={documentsAgentConfig.idlePlaceholder}
          state={agent.state}
          startedAt={agent.startedAt}
          endedAt={agent.endedAt}
          error={agent.error}
          onRun={agent.submit}
          onStop={agent.stop}
          onReset={agent.reset}
        >
          <DocumentsOutput
            key={agent.resetKey}
            object={agent.object}
            isStreaming={agent.state === 'running'}
          />
        </AgentPageBody>
      </main>
    </div>
  );
}

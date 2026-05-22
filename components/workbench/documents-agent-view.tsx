'use client';

import { AppBar } from '@/components/workbench/app-bar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimSubTabs } from '@/components/workbench/claim-sub-tabs';
import { ActivityFeed } from '@/components/workbench/activity-feed';
import { AgentPageBody } from '@/components/workbench/agent-page';
import { AgentPreRunContext } from '@/components/workbench/agent-pre-run-context';
import { documentsAgentConfig } from '@/components/workbench/documents-agent-panel';
import { DocumentsOutput } from '@/components/workbench/documents-output';
import { useAgentChat } from '@/hooks/use-agent-chat';

const DOCUMENTS_PRE_RUN_CONTEXT = [
  '6 documents in scope · 1 cross-reference matrix pending',
  'M6e will check: Consistency · Missing docs · Routing',
] as const;

export function DocumentsAgentView() {
  const agent = useAgentChat({
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
        <AgentPageBody
          title={documentsAgentConfig.title}
          description={documentsAgentConfig.description}
          identityBadge={
            <Badge variant="secondary" className="font-normal">
              M6e · Cross-Document Consistency Engine · Tier 2 — Findings require adjuster review
            </Badge>
          }
          idlePlaceholder={documentsAgentConfig.idlePlaceholder}
          preRunContext={<AgentPreRunContext rows={DOCUMENTS_PRE_RUN_CONTEXT} />}
          state={agent.state}
          startedAt={agent.startedAt}
          endedAt={agent.endedAt}
          error={agent.error}
          onRun={agent.submit}
          onStop={agent.stop}
          onReset={agent.reset}
          activity={
            <ActivityFeed
              events={agent.events}
              isStreaming={agent.state === 'running'}
              pendingCopy="Listing the claim file…"
            />
          }
        >
          <DocumentsOutput
            key={agent.resetKey}
            object={agent.object}
            isStreaming={agent.state === 'running'}
            endedAt={agent.endedAt}
          />
        </AgentPageBody>
      </main>
    </div>
  );
}

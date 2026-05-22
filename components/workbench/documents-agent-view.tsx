'use client';

import { AppBar } from '@/components/workbench/app-bar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimSubTabs } from '@/components/workbench/claim-sub-tabs';
import { ActivityFeed } from '@/components/workbench/activity-feed';
import { AgentPageBody } from '@/components/workbench/agent-page';
import { AgentPreRunContext } from '@/components/workbench/agent-pre-run-context';
import { DocumentInventoryCard } from '@/components/workbench/document-inventory-card';
import { documentsAgentConfig } from '@/components/workbench/documents-agent-panel';
import { DocumentsOutput } from '@/components/workbench/documents-output';
import { FileSummaryCard } from '@/components/workbench/file-summary-card';
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
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-10 pt-8 pb-12">
        <Breadcrumb />
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
          leftAside={
            <DocumentInventoryCard
              items={agent.object?.document_inventory ?? []}
              streaming={agent.state === 'running'}
            />
          }
          rightFooter={
            <FileSummaryCard
              markdown={agent.object?.summary_markdown}
              streaming={agent.state === 'running'}
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

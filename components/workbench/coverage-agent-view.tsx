'use client';

import { AppBar } from '@/components/workbench/app-bar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimSubTabs } from '@/components/workbench/claim-sub-tabs';
import { ActivityFeed } from '@/components/workbench/activity-feed';
import { AgentPageBody } from '@/components/workbench/agent-page';
import { AgentPreRunContext } from '@/components/workbench/agent-pre-run-context';
import { coverageAgentConfig } from '@/components/workbench/coverage-agent-panel';
import {
  CoverageOutput,
  QueuedDocuments,
  shouldShowQueuedDocuments,
} from '@/components/workbench/coverage-output';
import { CoverageScaffold } from '@/components/workbench/coverage-scaffold';
import { useAgentChat } from '@/hooks/use-agent-chat';

const COVERAGE_PRE_RUN_CONTEXT = [
  'Policy in scope: PSM-HO-7842113 · HO-3 · $480,000 Coverage A',
  'Peril: Hailstorm · Date of Loss: May 25, 2026',
  'M2 will evaluate: Coverage A, B, C, D + 3 endorsements',
  'RAG source: HO-3 Policy PDF (18 pages) loaded',
] as const;

export function CoverageAgentView() {
  const agent = useAgentChat({
    api: coverageAgentConfig.api,
    schema: coverageAgentConfig.schema,
    storageKey: coverageAgentConfig.storageKey,
  });

  return (
    <div className="min-h-screen bg-background">
      <AppBar />
      <ClaimSubTabs />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-10 pt-8 pb-12">
        <Breadcrumb />
        <AgentPageBody
          title={coverageAgentConfig.title}
          description={coverageAgentConfig.description}
          ownsRightColumnCards
          identityBadge={
            <Badge variant="secondary" className="font-normal">
              M2 · Coverage Agent · Tier 3 — Adjuster confirmation required
            </Badge>
          }
          idlePlaceholder={<CoverageScaffold />}
          preRunContext={<AgentPreRunContext rows={COVERAGE_PRE_RUN_CONTEXT} />}
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
              pendingCopy="Reaching for the policy…"
            />
          }
          leftAside={
            shouldShowQueuedDocuments(agent.object) ? <QueuedDocuments /> : null
          }
        >
          <CoverageOutput
            key={agent.resetKey}
            object={agent.object}
            endedAt={agent.endedAt}
          />
        </AgentPageBody>
      </main>
    </div>
  );
}

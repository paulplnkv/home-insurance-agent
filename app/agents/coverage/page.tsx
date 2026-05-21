'use client';

import { AppBar } from '@/components/workbench/app-bar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimSubTabs } from '@/components/workbench/claim-sub-tabs';
import { ActivityFeed } from '@/components/workbench/activity-feed';
import { AgentPageBody } from '@/components/workbench/agent-page';
import { coverageAgentConfig } from '@/components/workbench/coverage-agent-panel';
import { CoverageOutput } from '@/components/workbench/coverage-output';
import { CoverageScaffold } from '@/components/workbench/coverage-scaffold';
import { useAgentChat } from '@/hooks/use-agent-chat';

export default function CoverageAgentPage() {
  const agent = useAgentChat({
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
        <AgentPageBody
          title={coverageAgentConfig.title}
          description={coverageAgentConfig.description}
          identityBadge={
            <Badge variant="secondary" className="font-normal">
              M2 · Coverage Agent · Tier 3 — Adjuster confirmation required
            </Badge>
          }
          idlePlaceholder={<CoverageScaffold />}
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
        >
          <CoverageOutput key={agent.resetKey} object={agent.object} />
        </AgentPageBody>
      </main>
    </div>
  );
}

'use client';

import { AppBar } from '@/components/workbench/app-bar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimSubTabs } from '@/components/workbench/claim-sub-tabs';
import { ActivityFeed } from '@/components/workbench/activity-feed';
import { AgentPageBody } from '@/components/workbench/agent-page';
import { AgentPreRunContext } from '@/components/workbench/agent-pre-run-context';
import { damageAgentConfig } from '@/components/workbench/damage-agent-panel';
import { DamageOutput } from '@/components/workbench/damage-output';
import { DamageScaffold } from '@/components/workbench/damage-scaffold';
import { useAgentChat } from '@/hooks/use-agent-chat';

const DAMAGE_PRE_RUN_CONTEXT = [
  '60 photos staged · 4 classification categories',
  'M6b will apply: Relevant / Duplicate / Out of scope / Scale reference',
  'Output: Zone manifest + Xactimate line items + contractor variance',
] as const;

export function DamageAgentView() {
  const agent = useAgentChat({
    api: damageAgentConfig.api,
    schema: damageAgentConfig.schema,
    storageKey: damageAgentConfig.storageKey,
  });

  return (
    <div className="min-h-screen bg-background">
      <AppBar />
      <ClaimSubTabs />
      <Breadcrumb />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-4">
        <AgentPageBody
          title={damageAgentConfig.title}
          description={damageAgentConfig.description}
          identityBadge={
            <Badge variant="secondary" className="font-normal">
              M6b · Photo Intel Agent · Tier 2 — Draft output, adjuster review required
            </Badge>
          }
          idlePlaceholder={<DamageScaffold />}
          preRunContext={<AgentPreRunContext rows={DAMAGE_PRE_RUN_CONTEXT} />}
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
              pendingCopy="Pulling the photo manifest…"
            />
          }
        >
          <DamageOutput
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

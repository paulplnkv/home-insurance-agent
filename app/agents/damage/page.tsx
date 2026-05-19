'use client';

import { AppBar } from '@/components/workbench/app-bar';
import { Breadcrumb } from '@/components/workbench/breadcrumb';
import { ClaimSubTabs } from '@/components/workbench/claim-sub-tabs';
import { ActivityFeed } from '@/components/workbench/activity-feed';
import { AgentPageBody } from '@/components/workbench/agent-page';
import { damageAgentConfig } from '@/components/workbench/damage-agent-panel';
import { DamageOutput } from '@/components/workbench/damage-output';
import { useAgentChat } from '@/hooks/use-agent-chat';

export default function DamageAgentPage() {
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
          idlePlaceholder={damageAgentConfig.idlePlaceholder}
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
          />
        </AgentPageBody>
      </main>
    </div>
  );
}

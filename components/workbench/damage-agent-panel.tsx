'use client';

import { useAgentChat } from '@/hooks/use-agent-chat';
import { damageAgentOutputSchema } from '@/lib/agents/photos/schema';
import { ActivityFeed } from './activity-feed';
import { AgentPanel } from './agent-panel';
import { DamageOutput } from './damage-output';

export const damageAgentConfig = {
  api: '/api/agents/photos',
  schema: damageAgentOutputSchema,
  // v4 — event shape changed (tool calls now grouped + narration rows).
  storageKey: 'home-ins:damage:v4',
  title: 'Damage Assessment',
  description:
    'Photo classification · zone manifest · Xactimate estimate',
  idlePlaceholder: 'Damage manifest will populate when the analysis runs.',
} as const;

export function DamageAgentPanel() {
  const agent = useAgentChat({
    api: damageAgentConfig.api,
    schema: damageAgentConfig.schema,
    storageKey: damageAgentConfig.storageKey,
  });

  return (
    <AgentPanel
      title={damageAgentConfig.title}
      description={damageAgentConfig.description}
      state={agent.state}
      startedAt={agent.startedAt}
      endedAt={agent.endedAt}
      error={agent.error}
      idlePlaceholder={damageAgentConfig.idlePlaceholder}
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
    </AgentPanel>
  );
}

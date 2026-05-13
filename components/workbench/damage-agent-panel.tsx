'use client';

import { usePersistedAgent } from '@/hooks/use-persisted-agent';
import { damageAgentOutputSchema } from '@/lib/agents/photos/schema';
import { AgentPanel } from './agent-panel';
import { DamageOutput } from './damage-output';

export const damageAgentConfig = {
  api: '/api/agents/photos',
  schema: damageAgentOutputSchema,
  storageKey: 'home-ins:damage:v2',
  title: 'Damage Assessment',
  description:
    'Photo classification · zone manifest · Xactimate estimate',
  idlePlaceholder: 'Damage manifest will populate when the analysis runs.',
} as const;

export function DamageAgentPanel() {
  const agent = usePersistedAgent({
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
    >
      <DamageOutput
        key={agent.resetKey}
        object={agent.object}
        isStreaming={agent.state === 'running'}
      />
    </AgentPanel>
  );
}

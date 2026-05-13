'use client';

import { usePersistedAgent } from '@/hooks/use-persisted-agent';
import { coveragePositionSchema } from '@/lib/agents/coverage/schema';
import { AgentPanel } from './agent-panel';
import { CoverageOutput } from './coverage-output';

export const coverageAgentConfig = {
  api: '/api/agents/coverage',
  schema: coveragePositionSchema,
  storageKey: 'home-ins:coverage:v1',
  title: 'Coverage Verification',
  description:
    'HO-3 policy review · applicable deductible · cited clauses · streaming memo',
  idlePlaceholder:
    'Coverage position will populate when the analysis runs.',
} as const;

export function CoverageAgentPanel() {
  const agent = usePersistedAgent({
    api: coverageAgentConfig.api,
    schema: coverageAgentConfig.schema,
    storageKey: coverageAgentConfig.storageKey,
  });

  return (
    <AgentPanel
      title={coverageAgentConfig.title}
      description={coverageAgentConfig.description}
      state={agent.state}
      startedAt={agent.startedAt}
      endedAt={agent.endedAt}
      error={agent.error}
      idlePlaceholder={coverageAgentConfig.idlePlaceholder}
      onRun={agent.submit}
      onStop={agent.stop}
      onReset={agent.reset}
    >
      <CoverageOutput key={agent.resetKey} object={agent.object} />
    </AgentPanel>
  );
}

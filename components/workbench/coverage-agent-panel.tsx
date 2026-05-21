'use client';

import { useAgentChat } from '@/hooks/use-agent-chat';
import { coveragePositionSchema } from '@/lib/agents/coverage/schema';
import { ActivityFeed } from './activity-feed';
import { AgentPanel } from './agent-panel';
import { CoverageOutput } from './coverage-output';

export const coverageAgentConfig = {
  api: '/api/agents/coverage',
  schema: coveragePositionSchema,
  // v3 — event shape changed (tool calls now grouped + narration rows).
  storageKey: 'home-ins:coverage:v3',
  title: 'Coverage Verification',
  description:
    'HO-3 policy review · applicable deductible · cited clauses · streaming memo',
  idlePlaceholder:
    'Coverage position will populate when the analysis runs.',
} as const;

export function CoverageAgentPanel() {
  const agent = useAgentChat({
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
      activity={
        <ActivityFeed
          events={agent.events}
          isStreaming={agent.state === 'running'}
          pendingCopy="Reaching for the policy…"
        />
      }
    >
      <CoverageOutput
        key={agent.resetKey}
        object={agent.object}
        endedAt={agent.endedAt}
      />
    </AgentPanel>
  );
}

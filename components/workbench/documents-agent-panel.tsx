'use client';

import { useAgentChat } from '@/hooks/use-agent-chat';
import { crossDocFindingsSchema } from '@/lib/agents/documents/schema';
import { ActivityFeed } from './activity-feed';
import { AgentPanel } from './agent-panel';
import { DocumentsOutput } from './documents-output';

export const documentsAgentConfig = {
  api: '/api/agents/documents',
  schema: crossDocFindingsSchema,
  // v3 — event shape changed (tool calls now grouped + narration rows).
  storageKey: 'home-ins:documents:v3',
  title: 'Document Review',
  description: 'Cross-document consistency · Missing documents · Routing',
  idlePlaceholder: 'Document review will populate when the analysis runs.',
} as const;

export function DocumentsAgentPanel() {
  const agent = useAgentChat({
    api: documentsAgentConfig.api,
    schema: documentsAgentConfig.schema,
    storageKey: documentsAgentConfig.storageKey,
  });

  return (
    <AgentPanel
      title={documentsAgentConfig.title}
      description={documentsAgentConfig.description}
      state={agent.state}
      startedAt={agent.startedAt}
      endedAt={agent.endedAt}
      error={agent.error}
      idlePlaceholder={documentsAgentConfig.idlePlaceholder}
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
    </AgentPanel>
  );
}

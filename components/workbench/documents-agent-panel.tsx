'use client';

import { usePersistedAgent } from '@/hooks/use-persisted-agent';
import { crossDocFindingsSchema } from '@/lib/agents/documents/schema';
import { AgentPanel } from './agent-panel';
import { DocumentsOutput } from './documents-output';

export const documentsAgentConfig = {
  api: '/api/agents/documents',
  schema: crossDocFindingsSchema,
  storageKey: 'home-ins:documents:v1',
  title: 'Document Review',
  description: 'Cross-document consistency · missing documents · routing',
  idlePlaceholder: 'Document review will populate when the analysis runs.',
} as const;

export function DocumentsAgentPanel() {
  const agent = usePersistedAgent({
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
    >
      <DocumentsOutput
        key={agent.resetKey}
        object={agent.object}
        isStreaming={agent.state === 'running'}
      />
    </AgentPanel>
  );
}

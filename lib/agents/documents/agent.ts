// Cross-Document Consistency agent. Per PRD §Modules: a deep module
// wrapping prompt construction, the AI SDK call, and schema validation.
// The route handler is a thin streaming adapter on top.
import { Output, streamText } from 'ai';
import { SONNET_MODEL } from '@/lib/ai/models';
import { SCENARIO_DOCUMENTS } from '@/lib/scenario/documents';
import { buildUserPrompt, CROSS_DOC_SYSTEM_PROMPT } from './prompt';
import { crossDocFindingsSchema } from './schema';

export async function streamDocumentsAgent() {
  const prompt = buildUserPrompt(SCENARIO_DOCUMENTS);

  return streamText({
    model: SONNET_MODEL,
    system: CROSS_DOC_SYSTEM_PROMPT,
    temperature: 0.2,
    output: Output.object({ schema: crossDocFindingsSchema }),
    prompt,
  });
}

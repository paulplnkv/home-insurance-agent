// Cross-Document Consistency agent. Per PRD §Modules: a deep module
// wrapping prompt construction, the AI SDK call, and schema validation.
// The route handler is a thin streaming adapter on top.
//
// Tool-using variant — the model calls list_documents / read_document
// to fetch evidence on demand, then calls report_findings with the
// final structured answer. Tool-call events stream to the UI as a
// live activity feed; the report_findings input is the same
// CrossDocFindings shape the panel renders today.
import { stepCountIs, streamText } from 'ai';
import { SONNET_MODEL } from '@/lib/ai/models';
import { buildKickoffPrompt, CROSS_DOC_SYSTEM_PROMPT } from './prompt';
import { documentsTools } from './tools';

// Cap step count so a runaway loop terminates cleanly on stage instead
// of timing out the response. 10 steps = up to 6 reads + list + report
// + slack for retries.
const MAX_STEPS = 10;

export function streamDocumentsAgent() {
  return streamText({
    model: SONNET_MODEL,
    system: CROSS_DOC_SYSTEM_PROMPT,
    temperature: 0.2,
    tools: documentsTools,
    stopWhen: stepCountIs(MAX_STEPS),
    prompt: buildKickoffPrompt(),
  });
}

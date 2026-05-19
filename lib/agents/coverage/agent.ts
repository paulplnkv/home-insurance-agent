// Coverage Verification agent. Per PRD §Modules: a deep module wrapping
// prompt construction, retrieval, the AI SDK call, and schema
// validation. The route handler is a thin streaming adapter on top.
//
// Tool-using variant — the model calls search_policy with queries it
// chooses, then calls report_position with the final structured
// memo. Tool-call events stream to the UI as a live activity feed; the
// report_position input is the same CoveragePosition shape the panel
// renders today.
import { stepCountIs, streamText } from 'ai';
import { SONNET_MODEL } from '@/lib/ai/models';
import { buildKickoffPrompt, COVERAGE_SYSTEM_PROMPT } from './prompt';
import { coverageTools } from './tools';

// 8 steps = up to 6 policy searches + report + slack.
const MAX_STEPS = 8;

export function streamCoverageAgent() {
  return streamText({
    model: SONNET_MODEL,
    system: COVERAGE_SYSTEM_PROMPT,
    temperature: 0.2,
    tools: coverageTools,
    stopWhen: stepCountIs(MAX_STEPS),
    prompt: buildKickoffPrompt(),
  });
}

// Streaming adapter for the Coverage Verification agent.
// Conventions verified against
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md.
import { streamCoverageAgent } from '@/lib/agents/coverage/agent';

export const maxDuration = 30;

export async function POST() {
  const result = await streamCoverageAgent();
  return result.toTextStreamResponse();
}

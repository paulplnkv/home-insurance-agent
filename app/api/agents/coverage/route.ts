// Streaming adapter for the Coverage Verification agent.
// Conventions verified against
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md.
import { streamCoverageAgent } from '@/lib/agents/coverage/agent';

// Tool-using agent — multiple search round-trips plus a final structured
// report. Keep a bit longer ceiling than the old text-only version.
export const maxDuration = 60;

export async function POST() {
  const result = streamCoverageAgent();
  return result.toUIMessageStreamResponse();
}

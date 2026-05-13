// Streaming adapter for the Cross-Document Consistency agent.
// Conventions verified against
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md.
import { streamDocumentsAgent } from '@/lib/agents/documents/agent';

// Six full documents in the prompt, plus a moderately-sized output, runs
// longer than the coverage agent (which is text-only and shorter).
export const maxDuration = 60;

export async function POST() {
  const result = await streamDocumentsAgent();
  return result.toTextStreamResponse();
}

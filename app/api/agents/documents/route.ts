// Streaming adapter for the Cross-Document Consistency agent.
// Conventions verified against
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md.
import { streamDocumentsAgent } from '@/lib/agents/documents/agent';

// Tool-using agent — multiple round-trips for tool calls plus a final
// structured report can take longer than the previous single-shot
// completion. Keep the 60s ceiling.
export const maxDuration = 60;

export async function POST() {
  const result = streamDocumentsAgent();
  return result.toUIMessageStreamResponse();
}

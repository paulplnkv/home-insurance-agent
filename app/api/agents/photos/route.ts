// Streaming adapter for the Damage Assessment agent.
// Conventions verified against
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md.
import { streamPhotosAgent } from '@/lib/agents/photos/agent';

// Tool-using agent with multimodal inspect_photo calls (potentially
// many) plus a final structured report. Generous duration ceiling for
// the long-tail of inspect calls during the demo.
export const maxDuration = 120;

export async function POST() {
  const result = streamPhotosAgent();
  return result.toUIMessageStreamResponse();
}

// Streaming adapter for the Damage Assessment agent.
// Conventions verified against
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md.
import { streamPhotosAgent } from '@/lib/agents/photos/agent';

// Multimodal calls with 12 photos take longer than text-only.
export const maxDuration = 60;

export async function POST() {
  const result = await streamPhotosAgent();
  return result.toTextStreamResponse();
}

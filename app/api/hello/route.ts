// Next.js 16 streaming route. Verified against
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md
// — route handlers use Web Request/Response and ai-sdk's
// `result.toTextStreamResponse()` returns a streaming Response.
import { streamText } from 'ai';
import { SONNET_MODEL } from '@/lib/ai/models';

export const maxDuration = 30;

export async function GET() {
  const result = streamText({
    model: SONNET_MODEL,
    prompt:
      'Say hello and count to five, one number per line. Keep it under 40 words.',
  });

  return result.toTextStreamResponse();
}

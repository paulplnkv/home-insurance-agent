// Damage Assessment agent. Per PRD §Modules: a deep module wrapping
// prompt construction, the AI SDK call, and schema validation. The
// route handler is a thin streaming adapter on top.
//
// Tool-using variant — the model calls list_photos, then inspect_photo
// for each image it wants to evaluate, then report_assessment with the
// final structured manifest. Tool-call events stream to the UI as a
// live activity feed; the audience sees the agent walk the photo set
// one image at a time rather than receiving an opaque blob upfront.
import { stepCountIs, streamText } from 'ai';
import { SONNET_MODEL } from '@/lib/ai/models';
import { DAMAGE_SYSTEM_PROMPT, KICKOFF_USER_PROMPT } from './prompt';
import { photosTools } from './tools';

// Generous step ceiling — the photo manifest has up to 60 entries and
// the model may inspect many of them in parallel. 30 steps is enough
// to inspect a full set serially without overshooting on stage.
const MAX_STEPS = 30;

export function streamPhotosAgent() {
  return streamText({
    model: SONNET_MODEL,
    system: DAMAGE_SYSTEM_PROMPT,
    temperature: 0.2,
    tools: photosTools,
    stopWhen: stepCountIs(MAX_STEPS),
    prompt: KICKOFF_USER_PROMPT,
  });
}

// Damage Assessment agent. Per PRD §Modules: a deep module wrapping
// prompt construction, the AI SDK call, and schema validation. The route
// handler is a thin streaming adapter on top.
import { Output, streamText } from 'ai';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { SONNET_MODEL } from '@/lib/ai/models';
import {
  PHOTO_MANIFEST,
  photoFilesystemPath,
  type ScenarioPhoto,
} from '@/lib/scenario/photos';
import { buildUserMessage, DAMAGE_SYSTEM_PROMPT } from './prompt';
import { damageAgentOutputSchema } from './schema';

// Source files in /public/photos can be multi-megabyte PNGs (gpt-image-1.5
// returns ~4MB each). 30 raw photos blow the Vercel AI Gateway request
// size limit. Downscale to a width that's still rich enough for Sonnet's
// vision to classify hail damage, then JPEG-encode — typically ~100–200KB
// per image, ~4MB total for the full set.
const MAX_IMAGE_WIDTH = 1024;
const JPEG_QUALITY = 80;

async function loadPhotoBytes(): Promise<
  { photo: ScenarioPhoto; bytes: Buffer }[]
> {
  return Promise.all(
    PHOTO_MANIFEST.map(async (photo) => {
      const raw = await readFile(photoFilesystemPath(photo));
      const bytes = await sharp(raw)
        .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toBuffer();
      return { photo, bytes };
    })
  );
}

export async function streamPhotosAgent() {
  const items = await loadPhotoBytes();
  const messages = buildUserMessage(items);

  return streamText({
    model: SONNET_MODEL,
    system: DAMAGE_SYSTEM_PROMPT,
    temperature: 0.2,
    output: Output.object({ schema: damageAgentOutputSchema }),
    messages,
  });
}

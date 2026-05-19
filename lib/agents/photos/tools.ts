// Tools for the Damage Assessment agent. The model lists photos by id,
// then calls inspect_photo to pull in image content on demand. Each
// inspect_photo call shows up live in the activity feed — viewers see
// the agent walking through the photo set rather than receiving an
// opaque blob of 60 images at the start.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { tool } from 'ai';
import { z } from 'zod';
import { getPhotoById, PHOTO_MANIFEST } from '@/lib/scenario/photos';
import { damageAgentOutputSchema } from './schema';

// Image sizing — same parameters the legacy single-shot agent used.
const MAX_IMAGE_WIDTH = 1024;
const JPEG_QUALITY = 80;

async function loadDownscaledJpeg(filename: string): Promise<Buffer> {
  const path = resolve(process.cwd(), 'public', 'photos', filename);
  const raw = await readFile(path);
  return sharp(raw)
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();
}

export const photosTools = {
  list_photos: tool({
    description:
      'List every field photo by id and filename. Returns the full manifest. Call this first; the filenames hint at what each photo depicts (e.g., roof-south-1, gutter-3, skylight-1, siding-1, garage-door-1, ac-condenser-1, interior-water-1, scale-coin-1, neighbor-fence-1) so you can plan which photos to inspect.',
    inputSchema: z.object({}),
    execute: async () => {
      return PHOTO_MANIFEST.map((p) => ({
        id: p.id,
        filename: p.filename,
      }));
    },
  }),

  inspect_photo: tool({
    description:
      'Inspect a single photo by id. The image content is added to the model context so you can classify it. Call this for every photo you need to evaluate — at minimum, every photo that could plausibly belong to the dwelling damage scope.',
    inputSchema: z.object({
      id: z
        .string()
        .describe('Photo id from list_photos. Must match exactly.'),
    }),
    // execute returns a tiny ack — the actual image bytes are attached
    // via toModelOutput, which only runs server-side when building the
    // next model round-trip. Keeps the client-side activity stream
    // small (otherwise 60 base64-encoded images flow over the wire to
    // the browser, blowing the stream past 30MB).
    execute: async ({ id }) => {
      const photo = getPhotoById(id);
      if (!photo) {
        return { ok: false as const, error: `No photo with id "${id}".` };
      }
      return { ok: true as const, id: photo.id };
    },
    toModelOutput: async ({ input }) => {
      const { id } = input as { id: string };
      const photo = getPhotoById(id);
      if (!photo) {
        return { type: 'error-text', value: `No photo with id "${id}".` };
      }
      const bytes = await loadDownscaledJpeg(photo.filename);
      return {
        type: 'content',
        value: [
          { type: 'text', text: `Photo ${photo.id}:` },
          {
            type: 'file-data',
            mediaType: 'image/jpeg',
            data: bytes.toString('base64'),
          },
        ],
      };
    },
  }),

  report_assessment: tool({
    description:
      'Submit the final DamageAgentOutput object. Call this exactly once, after you have inspected the photos you need. The input you pass IS the agent output — the UI renders it directly. Cover EVERY photo id from list_photos in the classifications array.',
    inputSchema: damageAgentOutputSchema,
    execute: async (input) => input,
  }),
} as const;

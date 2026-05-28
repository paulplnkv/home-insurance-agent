// One-shot re-encoder for the scenario photo set. Each JPG in
// public/photos/ is resized to a sane max dimension, re-encoded with
// mozjpeg at quality 80, and written back in place. EXIF tags are
// preserved so the photo-detail dialog still shows Camera / Captured /
// GPS — the metadata route at app/api/photos/[id]/metadata/route.ts
// reads them with exif-parser.
//
// Run once: `npm run optimize-photos`. Originals are camera-direct
// 3-4 MB JPGs from Lorem Picsum (see public/photos/README.md), not
// production assets — in-place replacement is intentional.
import { readdir, rename, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const PHOTOS_DIR = join(process.cwd(), 'public', 'photos');
const MAX_DIM = 1600;
const JPEG_QUALITY = 80;

async function main() {
  const entries = await readdir(PHOTOS_DIR);
  const jpgs = entries.filter((f) => /\.jpe?g$/i.test(f)).sort();

  if (jpgs.length === 0) {
    console.error(`No JPGs found in ${PHOTOS_DIR}`);
    process.exit(1);
  }

  console.log(`Optimizing ${jpgs.length} photos in ${PHOTOS_DIR}\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const filename of jpgs) {
    const src = join(PHOTOS_DIR, filename);
    const tmp = `${src}.tmp`;
    const before = (await stat(src)).size;

    try {
      await sharp(src)
        .rotate() // bake EXIF orientation into pixels
        .resize({
          width: MAX_DIM,
          height: MAX_DIM,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
        .withMetadata() // keep EXIF (camera, date, GPS, orientation)
        .toFile(tmp);

      // Atomic swap — Ctrl-C between resize and rename leaves the
      // original intact rather than half-written.
      await rename(tmp, src);
    } catch (err) {
      // Best-effort cleanup of the temp file before re-throwing.
      try {
        await unlink(tmp);
      } catch {
        /* tmp may not exist */
      }
      throw err;
    }

    const after = (await stat(src)).size;
    totalBefore += before;
    totalAfter += after;

    const pct = ((1 - after / before) * 100).toFixed(0);
    console.log(
      `  ${filename.padEnd(36)} ${fmt(before).padStart(8)} -> ${fmt(after).padStart(8)}  (-${pct}%)`,
    );
  }

  const pct = ((1 - totalAfter / totalBefore) * 100).toFixed(0);
  console.log(
    `\nTotal: ${fmt(totalBefore)} -> ${fmt(totalAfter)}  (-${pct}%)`,
  );
}

function fmt(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

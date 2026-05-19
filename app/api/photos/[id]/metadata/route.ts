// File-level metadata for a scenario photo. Read on demand the first
// time the photo-detail dialog opens for a given photo; cached for an
// hour so subsequent opens don't re-stat the file.
//
// Next.js 16 route handler convention — params is a Promise. Verified
// against node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md.
import { readFile, stat } from 'node:fs/promises';
import { imageSize } from 'image-size';
import { getPhotoById, photoFilesystemPath } from '@/lib/scenario/photos';

export interface PhotoMetadata {
  width: number | null;
  height: number | null;
  type: string | null;
  bytes: number;
  mtime: string;
  exif: {
    make: string | null;
    model: string | null;
    dateTimeOriginal: string | null;
    gps: { lat: number; lng: number } | null;
    orientation: number | null;
  } | null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const photo = getPhotoById(id);
  if (!photo) {
    return Response.json({ error: 'photo_not_found', id }, { status: 404 });
  }

  const path = photoFilesystemPath(photo);
  let buffer: Buffer;
  let stats: Awaited<ReturnType<typeof stat>>;
  try {
    [buffer, stats] = await Promise.all([readFile(path), stat(path)]);
  } catch {
    return Response.json({ error: 'file_unreadable', id }, { status: 500 });
  }

  let width: number | null = null;
  let height: number | null = null;
  let type: string | null = null;
  try {
    const probed = imageSize(new Uint8Array(buffer));
    width = probed.width ?? null;
    height = probed.height ?? null;
    type = probed.type ?? null;
  } catch {
    // Leave nulls — the file may not be a recognised image format.
  }

  const result: PhotoMetadata = {
    width,
    height,
    type,
    bytes: stats.size,
    mtime: stats.mtime.toISOString(),
    exif: await tryParseExif(buffer),
  };

  return Response.json(result, {
    headers: { 'Cache-Control': 'public, max-age=3600, immutable' },
  });
}

async function tryParseExif(buffer: Buffer): Promise<PhotoMetadata['exif']> {
  try {
    // Late-require so a missing optional EXIF parser never breaks the
    // route — image-size is the load-bearing dependency.
    const ExifParser = (await import('exif-parser')).default;
    const parsed = ExifParser.create(buffer).parse();
    const tags = parsed?.tags ?? {};

    const hasAny =
      tags.Make ||
      tags.Model ||
      tags.DateTimeOriginal ||
      (tags.GPSLatitude != null && tags.GPSLongitude != null) ||
      tags.Orientation;
    if (!hasAny) return null;

    return {
      make: tags.Make ?? null,
      model: tags.Model ?? null,
      dateTimeOriginal:
        typeof tags.DateTimeOriginal === 'number'
          ? new Date(tags.DateTimeOriginal * 1000).toISOString()
          : null,
      gps:
        tags.GPSLatitude != null && tags.GPSLongitude != null
          ? { lat: tags.GPSLatitude, lng: tags.GPSLongitude }
          : null,
      orientation:
        typeof tags.Orientation === 'number' ? tags.Orientation : null,
    };
  } catch {
    return null;
  }
}

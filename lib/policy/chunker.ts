// Plain-text chunker for the synthetic HO-3 policy file. Splits on
// ALL-CAPS headings (one per line) and, within each section, on numbered
// or lettered subsection markers like "1. **Loss Settlement.**" or
// "A. ANTI-CONCURRENT CAUSATION CLAUSE.". Each chunk carries the parent
// heading as context so the embedding can disambiguate similarly-worded
// content across sections.

export interface PolicyChunk {
  id: string;
  section: string; // top-level heading (e.g., "SECTION I — EXCLUSIONS")
  subsection: string | null; // subsection label (e.g., "COVERAGE A — DWELLING")
  text: string; // chunk body, with the heading prepended for retrieval
}

const HEADING_REGEX = /^([A-Z][A-Z0-9 \-—,/]+)$/;

const SUBHEAD_REGEX = /^(\s*)(\d+\.|[A-Z]\.)\s+\*\*[^*]+\*\*/;

const MAX_CHUNK_CHARS = 1800;

export function chunkPolicy(text: string): PolicyChunk[] {
  const lines = text.split(/\r?\n/);

  // Pass 1: split into sections by ALL-CAPS heading lines.
  const sections: { heading: string; lines: string[] }[] = [];
  let current: { heading: string; lines: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && HEADING_REGEX.test(trimmed) && trimmed.length >= 5) {
      current = { heading: trimmed, lines: [] };
      sections.push(current);
      continue;
    }
    if (current) current.lines.push(line);
  }

  // Pass 2: track parent section as we go through sub-headings, then split
  // long bodies on numbered/lettered subsection markers.
  const chunks: PolicyChunk[] = [];
  let parentSection = '(preamble)';

  for (const section of sections) {
    const isTopLevel = isSectionHeading(section.heading);
    if (isTopLevel) parentSection = section.heading;

    const subsection = isTopLevel ? null : section.heading;
    const body = section.lines.join('\n').trim();
    if (!body) {
      // Heading with no body — still emit so the heading exists in the index.
      chunks.push({
        id: makeId(parentSection, subsection, chunks.length),
        section: parentSection,
        subsection,
        text: subsection
          ? `${parentSection} — ${subsection}\n\n${section.heading}`
          : `${parentSection}\n\n${section.heading}`,
      });
      continue;
    }

    // Split bodies that exceed MAX_CHUNK_CHARS on numbered/lettered subsection
    // starts (start of line, optional indent, then "N." or "L.").
    const pieces = body.length > MAX_CHUNK_CHARS ? splitOnSubheads(body) : [body];

    for (const piece of pieces) {
      const headingPrefix = subsection
        ? `${parentSection} — ${subsection}`
        : parentSection;
      chunks.push({
        id: makeId(parentSection, subsection, chunks.length),
        section: parentSection,
        subsection,
        text: `${headingPrefix}\n\n${piece.trim()}`,
      });
    }
  }

  return chunks;
}

function isSectionHeading(heading: string): boolean {
  return (
    heading.startsWith('SECTION ') ||
    heading.startsWith('SECTIONS ') ||
    heading === 'DECLARATIONS PAGE' ||
    heading === 'DEFINITIONS' ||
    heading === 'ENDORSEMENTS'
  );
}

function splitOnSubheads(body: string): string[] {
  const lines = body.split('\n');
  const groups: string[][] = [];
  let bucket: string[] = [];

  for (const line of lines) {
    if (SUBHEAD_REGEX.test(line) && bucket.length) {
      groups.push(bucket);
      bucket = [];
    }
    bucket.push(line);
  }
  if (bucket.length) groups.push(bucket);
  return groups.map((g) => g.join('\n').trim()).filter(Boolean);
}

function makeId(section: string, subsection: string | null, ordinal: number): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
  const parts = [slug(section)];
  if (subsection) parts.push(slug(subsection));
  parts.push(String(ordinal));
  return parts.join('--');
}

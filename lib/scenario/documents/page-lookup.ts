// Resolves evidence quotes from Document Review findings to a specific
// page number in the source PDF. Mirrors the policy heading→page lookup
// the Coverage panel uses (lib/policy/page-map.json), but matches
// verbatim text against per-document text→page maps emitted by
// generate-pdfs.tsx.

import contractorEstimateMap from './page-maps/contractor-estimate.json';
import fieldInspectionMap from './page-maps/field-inspection.json';
import fnolTranscriptMap from './page-maps/fnol-transcript.json';
import mortgageStatementMap from './page-maps/mortgage-statement.json';
import noaaWeatherMap from './page-maps/noaa-weather.json';
import recordedStatementMap from './page-maps/recorded-statement.json';

const DOC_PAGE_MAPS: Record<string, Record<string, number>> = {
  'fnol-transcript': fnolTranscriptMap,
  'contractor-estimate': contractorEstimateMap,
  'field-inspection': fieldInspectionMap,
  'noaa-weather': noaaWeatherMap,
  'recorded-statement': recordedStatementMap,
  'mortgage-statement': mortgageStatementMap,
};

// Pulls the source id out of the agent-emitted evidence prefix
// "[source-id / Field]: \"...\"". Returns null if no prefix is present
// — common while the model is mid-stream.
export function parseEvidenceSourceId(evidence: string): string | null {
  const m = evidence.match(/^\s*\[\s*([^\]\s/]+)/);
  return m ? m[1] : null;
}

// Strips the "[source / field]:" prefix and surrounding quotes so the
// remaining text is the raw quote we match against the page map.
export function stripEvidencePrefix(evidence: string): string {
  return evidence
    .replace(/^\s*\[[^\]]*\]\s*:\s*/, '')
    .replace(/^["“]/, '')
    .replace(/["”]\s*$/, '')
    .trim();
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/["“”'’]/g, '')
    .split(/[\s,./—–\-:;()]+/)
    .filter((t) => t.length >= 2);
}

// Token-overlap fuzzy match against the per-document page map. Returns
// the page with the most overlap with the quote; ties broken by longer
// (more specific) keys. Returns null if no source map exists or no
// tokens overlap at all (so the UI can fall back to "page 1").
export function findEvidencePage(
  sourceId: string,
  quote: string
): number | null {
  const map = DOC_PAGE_MAPS[sourceId];
  if (!map) return null;
  const quoteTokens = new Set(tokenize(quote));
  if (quoteTokens.size === 0) return null;

  let bestPage: number | null = null;
  let bestScore = 0;
  let bestKeyLen = 0;

  for (const [key, page] of Object.entries(map)) {
    const keyTokens = tokenize(key);
    if (keyTokens.length === 0) continue;
    let overlap = 0;
    for (const t of keyTokens) if (quoteTokens.has(t)) overlap += 1;
    if (overlap === 0) continue;
    // Score blends recall (how much of the chunk we matched) with a
    // small bonus for longer chunks so a 12-token line beats a 2-token
    // line both with 100% overlap.
    const score = overlap / keyTokens.length;
    if (
      score > bestScore ||
      (score === bestScore && keyTokens.length > bestKeyLen)
    ) {
      bestScore = score;
      bestKeyLen = keyTokens.length;
      bestPage = page;
    }
  }
  return bestPage;
}

// Combined entry point used by the UI: given an evidence string in the
// agent's emitted format, return the document id and the page where the
// quote was rendered (defaults to page 1 when no match).
export function locateEvidence(
  evidence: string | undefined
): { sourceId: string; page: number } | null {
  if (!evidence) return null;
  const sourceId = parseEvidenceSourceId(evidence);
  if (!sourceId) return null;
  const quote = stripEvidencePrefix(evidence);
  const page = findEvidencePage(sourceId, quote);
  return { sourceId, page: page ?? 1 };
}

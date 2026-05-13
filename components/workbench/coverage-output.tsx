'use client';

import { ExternalLinkIcon } from 'lucide-react';
import { Streamdown } from 'streamdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { CoveragePosition } from '@/lib/agents/coverage/schema';
import POLICY_PAGE_MAP from '@/lib/policy/page-map.json';

// PDF facsimile of the HO-3 policy text — the same source the retriever
// indexes. Generated at build time by `npm run generate-pdfs`.
const POLICY_PDF_URL = '/documents/policy-ho3.pdf';

// Deep-partial mirrors what `useObject`'s streamed object looks like
// before validation completes (every nested field can be undefined).
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
type StreamingCoverage = DeepPartial<CoveragePosition>;

const POSITION_LABELS: Record<string, string> = {
  COVERED: 'Covered',
  PARTIALLY_COVERED: 'Partially covered',
  EXCLUDED: 'Excluded',
  NEEDS_REVIEW: 'Needs review',
};

const FLAG_BADGE: Record<
  'INFO' | 'REVIEW' | 'BLOCK',
  { variant: 'secondary' | 'destructive' | 'default'; label: string }
> = {
  INFO: { variant: 'secondary', label: 'Info' },
  REVIEW: { variant: 'destructive', label: 'Needs review' },
  BLOCK: { variant: 'destructive', label: 'Blocked' },
};

export function CoverageOutput({
  object,
}: {
  object: StreamingCoverage | undefined;
}) {
  const hasClauses = !!object?.cited_clauses?.length;
  const hasMemo = !!object?.memo_markdown;
  const hasFlags = !!object?.flags?.length;

  return (
    <div className="flex flex-col gap-4 text-sm">
      <HeadlineSummary memo={object?.memo_markdown} />

      <PositionRow
        position={object?.position}
        confidence={object?.confidence}
      />

      <DeductibleRow deductible={object?.applicable_deductible} />

      {hasClauses || hasMemo || hasFlags ? (
        <Accordion multiple>
          {hasClauses ? (
            <AccordionItem value="clauses">
              <AccordionTrigger className="text-xs uppercase tracking-wide text-muted-foreground">
                Cited clauses ({object!.cited_clauses!.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-1.5">
                  {object!.cited_clauses!.map((clause, i) =>
                    clause?.section ? (
                      <ClauseChip key={`${clause.section}-${i}`} section={clause.section} />
                    ) : null
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : null}

          {hasMemo ? (
            <AccordionItem value="memo">
              <AccordionTrigger className="text-xs uppercase tracking-wide text-muted-foreground">
                Coverage memo
              </AccordionTrigger>
              <AccordionContent>
                {/* Streamdown handles partial/incomplete markdown gracefully
                    (unterminated bold, half-written tables) — exactly what we
                    need while the model is mid-stream. */}
                <Streamdown className="markdown-memo" parseIncompleteMarkdown>
                  {object!.memo_markdown!}
                </Streamdown>
              </AccordionContent>
            </AccordionItem>
          ) : null}

          {hasFlags ? (
            <AccordionItem value="flags" className="border-b-0">
              <AccordionTrigger className="text-xs uppercase tracking-wide text-muted-foreground">
                Considerations ({object!.flags!.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-2">
                  {object!.flags!.map((flag, i) =>
                    flag?.title ? (
                      <li
                        key={`${flag.title}-${i}`}
                        className="rounded-md border bg-muted/40 p-3"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <Badge
                            variant={
                              FLAG_BADGE[flag.severity ?? 'INFO']?.variant ??
                              'secondary'
                            }
                          >
                            {FLAG_BADGE[flag.severity ?? 'INFO']?.label ?? 'Info'}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">
                            {flag.title}
                          </span>
                        </div>
                        {flag.rationale ? (
                          <p className="text-sm text-muted-foreground">
                            {flag.rationale}
                          </p>
                        ) : null}
                      </li>
                    ) : null
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ) : null}
        </Accordion>
      ) : null}
    </div>
  );
}

// Pulls the bolded one-sentence headline the agent is required to write
// at the top of `memo_markdown` (per the system prompt) and surfaces it
// above the structured rows. Streams in shortly after the position badge.
function HeadlineSummary({ memo }: { memo?: string }) {
  if (!memo) return null;
  const firstLine = memo
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!firstLine) return null;
  // Strip surrounding `**` (and stray trailing `*` while the token is
  // still mid-stream) so the line renders as plain prose.
  const clean = firstLine.replace(/^\*+|\*+$/g, '').trim();
  if (!clean) return null;
  return (
    <p className="text-base font-medium leading-snug text-foreground">
      {clean}
    </p>
  );
}

function PositionRow({
  position,
  confidence,
}: {
  position?: string;
  confidence?: number;
}) {
  if (!position) return null;
  const label = POSITION_LABELS[position] ?? position;
  const variant =
    position === 'COVERED'
      ? 'default'
      : position === 'EXCLUDED' || position === 'NEEDS_REVIEW'
        ? 'destructive'
        : 'secondary';
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant={variant}>{label}</Badge>
      {typeof confidence === 'number' ? (
        <span className="text-xs text-muted-foreground tabular-nums">
          Confidence: {(confidence * 100).toFixed(0)}%
        </span>
      ) : null}
    </div>
  );
}

function DeductibleRow({
  deductible,
}: {
  deductible?: {
    kind?: string;
    citation?: string;
  };
}) {
  if (!deductible?.kind) return null;
  const kindLabel =
    deductible.kind === 'WIND_HAIL_PERCENT'
      ? 'Wind/Hail percentage'
      : deductible.kind === 'AOP_STANDARD'
        ? 'AOP standard'
        : deductible.kind === 'HURRICANE_PERCENT'
          ? 'Hurricane percentage'
          : 'Other';
  return (
    <div className="rounded-md border bg-muted/40 p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        Applicable deductible
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <span className="text-base font-medium">{kindLabel}</span>
      </div>
      {deductible.citation ? (
        <a
          href={citationPdfUrl(deductible.citation)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {deductible.citation}
          <ExternalLinkIcon className="size-3" />
        </a>
      ) : null}
    </div>
  );
}

function ClauseChip({ section }: { section: string }) {
  return (
    <a
      href={citationPdfUrl(section)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {shortenSection(section)}
      <ExternalLinkIcon className="size-3 text-muted-foreground" />
    </a>
  );
}

// Build a PDF URL that opens the policy at the page containing the
// cited section. `#page=N` is the only URL fragment that works
// universally across Chrome, Firefox, and Safari. The page map is
// produced at build time by `npm run generate-pdfs`.
function citationPdfUrl(section: string): string {
  const page = findPageForCitation(section);
  return `${POLICY_PDF_URL}#page=${page}`;
}

function shortenSection(section: string): string {
  // The retriever chunks heading lines like
  // "ENDORSEMENTS — HE-7 WIND/HAIL PERCENTAGE DEDUCTIBLE". Keep the most
  // specific tail in the chip so chips don't all start with "SECTION I —".
  const parts = section.split('—').map((p) => p.trim());
  const last = parts[parts.length - 1];
  return last.length > 0 ? last : section;
}

// Tokenize a citation or page-map heading into uppercase alphanumeric
// tokens. Keeps hyphenated identifiers (HE-7, ANTI-CONCURRENT) intact,
// drops connectors split on whitespace/punctuation.
function tokenize(s: string): string[] {
  return s
    .toUpperCase()
    .split(/[\s,/—.§()]+/)
    .map((t) => t.replace(/^[^A-Z0-9]+|[^A-Z0-9-]+$/g, ''))
    .filter((t) => t.length >= 1);
}

// Fuzzy-match a citation string against the heading→page map. The agent
// emits citations in mixed formats — sometimes the chunker's exact
// heading ("SECTION I — EXCLUSIONS — A. ANTI-CONCURRENT CAUSATION
// CLAUSE"), sometimes a paraphrase ("Endorsement HE-7 — Wind/Hail
// Percentage Deductible §2"). Token overlap handles both. Tie-breaks
// prefer the longer (more specific) key, then the later occurrence.
function findPageForCitation(section: string): number {
  const citationTokens = new Set(tokenize(section));
  if (citationTokens.size === 0) return 1;

  let bestPage = 1;
  let bestScore = 0;
  let bestKeyLen = 0;

  for (const [key, page] of Object.entries(POLICY_PAGE_MAP)) {
    const keyTokens = tokenize(key);
    if (keyTokens.length === 0) continue;
    let overlap = 0;
    for (const t of keyTokens) if (citationTokens.has(t)) overlap += 1;
    if (overlap === 0) continue;
    const score = overlap / keyTokens.length;
    if (
      score > bestScore ||
      (score === bestScore && keyTokens.length >= bestKeyLen)
    ) {
      bestScore = score;
      bestKeyLen = keyTokens.length;
      bestPage = page;
    }
  }

  return bestPage;
}

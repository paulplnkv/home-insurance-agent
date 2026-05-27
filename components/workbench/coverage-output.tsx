'use client';

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CopyIcon,
  ExternalLinkIcon,
  FileTextIcon,
  MailIcon,
} from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageCard } from '@/components/workbench/agent-page';
import { CoverageScaffold } from '@/components/workbench/coverage-scaffold';
import type { CoveragePosition } from '@/lib/agents/coverage/schema';
import { CLAIM, formatDateTime } from '@/lib/scenario/claim';
import { TIER3_CONFIRMED_KEY } from '@/lib/scenario/tier3';
import POLICY_PAGE_MAP from '@/lib/policy/page-map.json';
import { buildMailto } from '@/lib/utils/mailto';

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

const ROR_DRAFT_BODY = `Hi Maria,

Just to clarify the deductible position on this claim:

Under the base HO-3 policy, the All Other Perils deductible is $1,000. Your policy also carries endorsement HE-7 (Wind/Hail Percentage Deductible §6), which applies whenever the loss is caused by wind or hail.

Because the May 25 loss is a hailstorm, HE-7 §6 controls — and the wind/hail deductible is 2% of the Coverage A dwelling limit of $480,000, which equals $9,600.

If this had been a non-wind/hail peril, the standard $1,000 deductible would have applied instead.

In short: the deductible applicable to this claim is $9,600, not $1,000, because the loss is wind/hail-driven and HE-7 §6 supersedes the base deductible.

Pacific States Mutual is continuing to investigate the claim and reserves all rights under the policy. This letter is not an admission of coverage and does not waive any policy terms, conditions, or defenses.

Let me know if you need any further clarification.

— Maria Wells
  Pacific States Mutual · Property · North TX`;

export function CoverageOutput({
  object,
  endedAt,
}: {
  object: StreamingCoverage | undefined;
  endedAt: number | null;
}) {
  const hasClauses = !!object?.cited_clauses?.length;
  const hasMemo = !!object?.memo_markdown;
  const hasFlags = !!object?.flags?.length;
  const hasDeductible = !!object?.applicable_deductible?.kind;

  return (
    <>
      <PageCard className="flex flex-col gap-4">
        <WriteBackStatusLine endedAt={endedAt} />
        <Tier3Banner />
        <CoverageScaffold lines={object?.coverage_lines} />
        <PositionSummaryParagraph memo={object?.memo_markdown} />
        <PositionRow
          position={object?.position}
          confidence={object?.confidence}
        />
      </PageCard>

      {hasDeductible ? (
        <DeductibleCard deductible={object!.applicable_deductible} />
      ) : null}

      {hasClauses ? (
        <PageCard className="flex flex-col gap-4">
          <SectionHeading>
            Cited clauses ({object!.cited_clauses!.length})
          </SectionHeading>
          <div className="flex flex-wrap gap-2">
            {object!.cited_clauses!.map((clause, i) =>
              clause?.section ? (
                <ClauseChip
                  key={`${clause.section}-${i}`}
                  section={clause.section}
                />
              ) : null,
            )}
          </div>
        </PageCard>
      ) : null}

      {hasMemo ? (
        <PageCard className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <SectionHeading>Coverage memo</SectionHeading>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                Edit
              </Button>
              <Button size="sm">Save</Button>
            </div>
          </div>
          {/* Streamdown handles partial/incomplete markdown gracefully
              (unterminated bold, half-written tables) — exactly what we
              need while the model is mid-stream. */}
          <Streamdown className="markdown-memo" parseIncompleteMarkdown>
            {object!.memo_markdown!}
          </Streamdown>
        </PageCard>
      ) : null}

      {hasFlags ? (
        <PageCard className="flex flex-col gap-4">
          <SectionHeading>
            Considerations ({object!.flags!.length})
          </SectionHeading>
          <ul className="flex flex-col gap-3">
            {object!.flags!.map((flag, i) =>
              flag?.title ? (
                <li key={`${flag.title}-${i}`}>
                  <FlagCard
                    title={flag.title}
                    severity={flag.severity ?? 'INFO'}
                    rationale={flag.rationale}
                  />
                </li>
              ) : null,
            )}
          </ul>
        </PageCard>
      ) : null}
    </>
  );
}

// Exported so the agent page can render it in the leftAside slot
// (under the activity feed) once the memo has streamed in.
export { QueuedDocuments };
export function shouldShowQueuedDocuments(
  object: StreamingCoverage | undefined,
): boolean {
  return !!object?.memo_markdown;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-xl font-semibold leading-snug text-[var(--ink)]">
      {children}
    </h2>
  );
}

function WriteBackStatusLine({ endedAt }: { endedAt: number | null }) {
  const confirmedAt = useSyncExternalStore(
    subscribeTier3,
    readTier3Confirmation,
    getServerTier3Snapshot,
  );
  if (endedAt == null) return null;
  if (!confirmedAt) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-400">
        <span aria-hidden>⏳ </span>
        Awaiting adjuster confirmation before writing to claim file.
      </p>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      <span aria-hidden>✅ </span>
      Coverage position written to claim file by M2 ·{' '}
      {formatDateTime(new Date(endedAt).toISOString())}
    </p>
  );
}

function Tier3Banner() {
  const confirmedAt = useSyncExternalStore(
    subscribeTier3,
    readTier3Confirmation,
    getServerTier3Snapshot,
  );

  if (confirmedAt) {
    return (
      <Alert>
        <CheckCircle2Icon className="text-emerald-600" />
        <AlertTitle>
          Coverage position confirmed by {CLAIM.adjuster.name} ·{' '}
          {formatConfirmTimestamp(confirmedAt)} · Written to claim file.
        </AlertTitle>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTriangleIcon />
      <AlertTitle>Tier 3 — Adjuster confirmation required</AlertTitle>
      <AlertDescription>
        This coverage position has not been written to the claim file. Review
        the analysis below and confirm to save.
      </AlertDescription>
      <div className="mt-3 flex gap-2 group-has-[>svg]/alert:col-start-2">
        <Button size="sm" onClick={confirmTier3}>
          Confirm and write to claim file
        </Button>
        <Button size="sm" variant="outline">
          Request changes
        </Button>
      </div>
    </Alert>
  );
}

const ROR_DRAFT_SUBJECT =
  'Reservation of Rights — Wind/Hail Percentage Deductible Disclosure';

function QueuedDocuments() {
  const [subject, setSubject] = useState(ROR_DRAFT_SUBJECT);
  const [body, setBody] = useState(ROR_DRAFT_BODY);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      toast.success('Draft copied to clipboard.');
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  };

  const handleOpenInMail = () => {
    window.location.href = buildMailto({
      to: CLAIM.insured.email,
      subject,
      body,
    });
  };

  return (
    <PageCard className="flex flex-col gap-4">
      <SectionHeading>Queued documents (1)</SectionHeading>
      <div className="flex items-start gap-3 rounded-md border border-[var(--line-soft)] bg-white p-3">
        <FileTextIcon className="mt-0.5 size-8 text-muted-foreground" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-medium leading-tight">
            Reservation of Rights Letter — Draft
          </span>
          <span className="text-xs text-muted-foreground">
            Wind/Hail Percentage Deductible Disclosure (HE-7 §6)
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            Required: Written disclosure to insured of percentage deductible
            before any settlement payment is issued.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger
                render={<Button size="sm" variant="outline" />}
              >
                Review Draft
              </DialogTrigger>
              <DialogContent className="grid max-h-[90vh] w-full gap-4 overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Reservation of Rights Letter — Draft
                  </DialogTitle>
                  <DialogDescription>
                    To: {CLAIM.insured.name} &lt;{CLAIM.insured.email}&gt;
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Subject
                    </span>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Body
                    </span>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={18}
                      className="min-h-[320px] text-sm leading-relaxed"
                    />
                  </label>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCopy}>
                    <CopyIcon />
                    Copy
                  </Button>
                  <Button onClick={handleOpenInMail}>
                    <MailIcon />
                    Open in mail
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              size="sm"
              onClick={() => {
                toast.success('The email sent.');
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </PageCard>
  );
}

// Tier 3 confirmation state — mirrors the pattern used in
// claim-pending-approvals.tsx so the banner and the sidebar stay in sync via
// the same localStorage key + manual StorageEvent dispatch.
function readTier3Confirmation(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TIER3_CONFIRMED_KEY);
}

function subscribeTier3(notify: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === null || event.key === TIER3_CONFIRMED_KEY) notify();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function getServerTier3Snapshot(): string | null {
  return null;
}

function confirmTier3() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TIER3_CONFIRMED_KEY, new Date().toISOString());
  // `storage` only fires across tabs — dispatch manually so same-tab
  // subscribers (this banner, the sidebar, and the dashboard AI-status cell)
  // re-render.
  window.dispatchEvent(
    new StorageEvent('storage', { key: TIER3_CONFIRMED_KEY }),
  );
}

const CONFIRM_TIMESTAMP_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function formatConfirmTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return CONFIRM_TIMESTAMP_FORMATTER.format(date);
}

// Renders the first paragraph of the streamed memo as plain prose. The
// agent is prompted to lead the memo with a single "Position: …" sentence
// that doubles as a headline + position summary, so surfacing it inside
// Card A — directly above the position badge — matches the Figma.
function PositionSummaryParagraph({ memo }: { memo?: string }) {
  if (!memo) return null;
  const firstParagraph = memo.split(/\n\s*\n/)[0]?.trim();
  if (!firstParagraph) return null;
  return (
    <Streamdown
      className="markdown-memo text-sm text-foreground"
      parseIncompleteMarkdown
    >
      {firstParagraph}
    </Streamdown>
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

function DeductibleCard({
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
    <PageCard className="flex flex-col gap-2">
      <SectionHeading>Applicable deductible</SectionHeading>
      <span className="text-base font-medium text-foreground">{kindLabel}</span>
      {deductible.citation ? (
        <a
          href={citationPdfUrl(deductible.citation)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {deductible.citation}
          <ExternalLinkIcon className="size-3.5" />
        </a>
      ) : null}
    </PageCard>
  );
}

function FlagCard({
  title,
  severity,
  rationale,
}: {
  title: string;
  severity: 'INFO' | 'REVIEW' | 'BLOCK';
  rationale?: string;
}) {
  const badge = FLAG_BADGE[severity] ?? FLAG_BADGE.INFO;
  return (
    <div className="flex flex-col gap-2 rounded-md border border-[var(--line-soft)] bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <span className="text-sm font-medium leading-snug text-foreground">
          {title}
        </span>
      </div>
      {rationale ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {rationale}
        </p>
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
      className="inline-flex items-center gap-1.5 rounded-md bg-[#edf3ff] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--ink)] transition-colors hover:bg-[#dde6fb]"
    >
      {shortenSection(section)}
      <ExternalLinkIcon className="size-3.5" />
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

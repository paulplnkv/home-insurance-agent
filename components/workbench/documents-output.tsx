'use client';

import {
  ExternalLinkIcon,
  FileQuestionIcon,
  FileTextIcon,
} from 'lucide-react';
import { Streamdown } from 'streamdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Shimmer } from '@/components/ai-elements/shimmer';
import type { CrossDocFindings } from '@/lib/agents/documents/schema';
import { formatDateTime } from '@/lib/scenario/claim';
import {
  DOCUMENT_KIND_LABELS,
  getDocumentById,
} from '@/lib/scenario/documents';
import { locateEvidence } from '@/lib/scenario/documents/page-lookup';
import { cn } from '@/lib/utils';

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
type StreamingFindings = DeepPartial<CrossDocFindings>;

const SEVERITY_BADGE: Record<
  'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  { variant: 'default' | 'secondary' | 'destructive'; label: string }
> = {
  CRITICAL: { variant: 'destructive', label: 'Critical' },
  HIGH: { variant: 'destructive', label: 'High' },
  MEDIUM: { variant: 'secondary', label: 'Medium' },
  LOW: { variant: 'secondary', label: 'Low' },
};

const ROUTING_LABELS: Record<string, string> = {
  auto_settle: 'Auto-settle',
  adjuster_review: 'Adjuster review required',
  siu_referral: 'SIU referral',
};

const KIND_LABELS = DOCUMENT_KIND_LABELS as Record<string, string>;

export function DocumentsOutput({
  object,
  isStreaming,
  endedAt,
}: {
  object: StreamingFindings | undefined;
  isStreaming: boolean;
  endedAt: number | null;
}) {
  const inventory = object?.document_inventory ?? [];
  const findings = object?.findings ?? [];
  const memo = object?.summary_markdown;
  const criticalCount = findings.filter((f) => f?.severity === 'CRITICAL').length;

  return (
    <div className="flex flex-col gap-4 text-sm">
      <WriteBackStatusLine endedAt={endedAt} />

      <HeadlineSummary memo={memo} />

      <RoutingRow routing={object?.routing} streaming={isStreaming} />

      <FindingsList items={findings} streaming={isStreaming} />

      <DocumentInventory items={inventory} streaming={isStreaming} />

      <FileSummary
        markdown={memo}
        routing={object?.routing}
        criticalCount={criticalCount}
        streaming={isStreaming}
      />
    </div>
  );
}

function WriteBackStatusLine({ endedAt }: { endedAt: number | null }) {
  if (endedAt == null) return null;
  return (
    <p className="text-xs text-muted-foreground">
      <span aria-hidden>✅ </span>
      Findings written to claim file by M6e ·{' '}
      {formatDateTime(new Date(endedAt).toISOString())}
    </p>
  );
}

// Pulls the bolded one-sentence headline the agent is required to write
// at the top of summary_markdown and surfaces it above the routing badge
// — same pattern as the Coverage panel.
function HeadlineSummary({ memo }: { memo?: string }) {
  if (!memo) return null;
  const firstLine = memo
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!firstLine) return null;
  const clean = firstLine.replace(/^\*+|\*+$/g, '').trim();
  if (!clean) return null;
  return (
    <p className="text-base font-medium leading-snug text-foreground">
      {clean}
    </p>
  );
}

function RoutingRow({
  routing,
  streaming,
}: {
  routing: string | undefined;
  streaming: boolean;
}) {
  if (!routing) {
    return streaming ? (
      <Shimmer className="text-xs">Determining routing decision…</Shimmer>
    ) : null;
  }
  const label = ROUTING_LABELS[routing] ?? routing;
  const variant: 'default' | 'destructive' | 'secondary' =
    routing === 'siu_referral' || routing === 'adjuster_review'
      ? 'destructive'
      : 'default';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        Routing
      </span>
      <Badge variant={variant}>{label}</Badge>
    </div>
  );
}

function FindingsList({
  items,
  streaming,
}: {
  items: NonNullable<StreamingFindings['findings']>;
  streaming: boolean;
}) {
  if (items.length === 0) {
    return streaming ? (
      <Shimmer className="text-xs">Cross-referencing documents…</Shimmer>
    ) : null;
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((f, i) => {
        if (!f?.title) return null;
        const rawSev = f.severity;
        const sev =
          rawSev && rawSev in SEVERITY_BADGE
            ? (rawSev as keyof typeof SEVERITY_BADGE)
            : null;
        return (
          <li
            key={`${f.title}-${i}`}
            className="flex flex-col gap-2 rounded-md border bg-card p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              {sev ? (
                <Badge variant={SEVERITY_BADGE[sev].variant}>
                  {SEVERITY_BADGE[sev].label}
                </Badge>
              ) : null}
              <span className="text-sm font-semibold">{f.title}</span>
            </div>
            {f.suggested_action ? (
              <p className="text-xs leading-snug text-muted-foreground">
                {f.suggested_action}
                {f.financial_impact ? (
                  <span className="ml-1 text-muted-foreground/70">
                    · {f.financial_impact}
                  </span>
                ) : null}
              </p>
            ) : null}
            {f.evidence_a || f.evidence_b || f.evidence_c ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {f.evidence_a ? <EvidenceBlock text={f.evidence_a} /> : null}
                {f.evidence_b ? <EvidenceBlock text={f.evidence_b} /> : null}
                {f.evidence_c ? <EvidenceBlock text={f.evidence_c} /> : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function EvidenceBlock({ text }: { text: string }) {
  const located = locateEvidence(text);
  const doc = located ? getDocumentById(located.sourceId) : undefined;
  const href = doc ? `${doc.pdfUrl}#page=${located!.page}` : undefined;

  return (
    <div className="flex flex-col gap-1 rounded-md border bg-muted/30 p-2">
      <p className="whitespace-pre-wrap text-xs leading-snug text-foreground">
        {text}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1 text-[10px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Open
          <ExternalLinkIcon className="size-3" />
        </a>
      ) : null}
    </div>
  );
}

function DocumentInventory({
  items,
  streaming,
}: {
  items: NonNullable<StreamingFindings['document_inventory']>;
  streaming: boolean;
}) {
  if (items.length === 0 && !streaming) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Document inventory
        </span>
        {streaming && items.length === 0 ? (
          <Shimmer className="text-xs">Classifying documents…</Shimmer>
        ) : null}
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((row, i) => {
          if (!row?.id) return null;
          const present = row.present !== false;
          const kindLabel =
            (row.kind && KIND_LABELS[row.kind]) ||
            row.kind ||
            'Unknown document type';
          // Match the inventory row to the scenario manifest to surface
          // the rendered PDF facsimile when the document is present.
          const scenarioDoc = present ? getDocumentById(row.id) : undefined;
          return (
            <li
              key={`${row.id}-${i}`}
              className={cn(
                'flex items-start gap-2 rounded-md border p-2',
                present ? 'bg-card' : 'border-dashed bg-muted/30'
              )}
            >
              <div className="mt-0.5 text-muted-foreground">
                {present ? (
                  <FileTextIcon className="size-4" />
                ) : (
                  <FileQuestionIcon className="size-4" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {row.title ?? kindLabel}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {kindLabel}
                </span>
                {scenarioDoc ? (
                  <a
                    href={scenarioDoc.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex w-fit items-center gap-1 text-[11px] font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    Open PDF
                    <ExternalLinkIcon className="size-3" />
                  </a>
                ) : null}
              </div>
              <Badge variant={present ? 'secondary' : 'destructive'}>
                {present ? 'Present' : 'Missing'}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FileSummary({
  markdown,
  routing,
  criticalCount,
  streaming,
}: {
  markdown: string | undefined;
  routing: string | undefined;
  criticalCount: number;
  streaming: boolean;
}) {
  if (!markdown) {
    return streaming ? (
      <Shimmer className="text-xs">Drafting file summary…</Shimmer>
    ) : null;
  }
  const headline = buildRoutingHeadline(routing, criticalCount);
  return (
    <Accordion defaultValue={[]}>
      <AccordionItem value="summary" className="border-b-0">
        <AccordionTrigger className="text-sm font-medium">
          {headline}
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-md border bg-card p-3">
            <Streamdown className="markdown-memo" parseIncompleteMarkdown>
              {markdown}
            </Streamdown>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function buildRoutingHeadline(
  routing: string | undefined,
  criticalCount: number,
): string {
  const findingsClause =
    criticalCount === 0
      ? 'no Critical findings'
      : `${criticalCount} Critical finding${criticalCount === 1 ? '' : 's'}`;
  if (routing === 'siu_referral') {
    return `Routing: SIU Referral — ${findingsClause}. This claim must not be settled until SIU review is complete.`;
  }
  if (routing === 'adjuster_review') {
    return `Routing: Adjuster review required — ${findingsClause}.`;
  }
  if (routing === 'auto_settle') {
    return `Routing: Auto-settle — ${findingsClause}.`;
  }
  return `Routing pending — ${findingsClause}.`;
}

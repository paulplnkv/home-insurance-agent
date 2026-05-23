'use client';

import { ExternalLinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shimmer } from '@/components/ai-elements/shimmer';
import type { CrossDocFindings } from '@/lib/agents/documents/schema';
import { formatDateTime } from '@/lib/scenario/claim';
import { getDocumentById } from '@/lib/scenario/documents';
import { locateEvidence } from '@/lib/scenario/documents/page-lookup';

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
type StreamingFindings = DeepPartial<CrossDocFindings>;

const SEVERITY_BADGE: Record<
  'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  { variant: 'default' | 'secondary' | 'destructive'; label: string }
> = {
  CRITICAL: { variant: 'destructive', label: '🚨 Critical' },
  HIGH: { variant: 'destructive', label: '🚨 High' },
  MEDIUM: { variant: 'secondary', label: 'Medium' },
  LOW: { variant: 'secondary', label: 'Low' },
};

const ROUTING_LABELS: Record<string, string> = {
  auto_settle: 'Auto-settle',
  adjuster_review: 'Adjuster review required',
  siu_referral: 'SIU referral',
};

export function DocumentsOutput({
  object,
  isStreaming,
  endedAt,
}: {
  object: StreamingFindings | undefined;
  isStreaming: boolean;
  endedAt: number | null;
}) {
  const findings = object?.findings ?? [];

  return (
    <div className="flex flex-col gap-5 text-sm">
      <WriteBackStatusLine endedAt={endedAt} />
      <RoutingHeadline
        routing={object?.routing}
        headline={object?.summary_markdown}
        streaming={isStreaming}
      />
      <FindingsList items={findings} streaming={isStreaming} />
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

function extractHeadline(memo: string | undefined): string | null {
  if (!memo) return null;
  const firstLine = memo
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!firstLine) return null;
  const clean = firstLine.replace(/^\*+|\*+$/g, '').trim();
  return clean.length > 0 ? clean : null;
}

// Big headline paragraph + small "ROUTING" label/badge row — no boxed
// accent panel, per Figma.
function RoutingHeadline({
  routing,
  headline,
  streaming,
}: {
  routing: string | undefined;
  headline: string | undefined;
  streaming: boolean;
}) {
  const text = extractHeadline(headline);
  if (!routing && !text) {
    return streaming ? (
      <Shimmer className="text-xs">Determining AI recommendation…</Shimmer>
    ) : null;
  }

  const label = routing ? (ROUTING_LABELS[routing] ?? routing) : null;
  const isHighRisk =
    routing === 'siu_referral' || routing === 'adjuster_review';

  return (
    <div className="flex flex-col gap-3">
      {text ? (
        <p className="text-base font-medium leading-relaxed text-foreground">
          {text}
        </p>
      ) : null}
      {label ? (
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            AI Recommendation
          </span>
          <Badge variant={isHighRisk ? 'destructive' : 'default'}>
            {label}
          </Badge>
        </div>
      ) : null}
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
    <ul className="flex flex-col gap-4">
      {items.map((f, i) => {
        if (!f?.title) return null;
        const rawSev = f.severity;
        const sev =
          rawSev && rawSev in SEVERITY_BADGE
            ? (rawSev as keyof typeof SEVERITY_BADGE)
            : null;
        return (
          <li key={`${f.title}-${i}`}>
            <Card>
              <CardContent className="flex flex-col gap-3 py-4">
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
                    AI summary: {f.suggested_action}
                    {f.financial_impact ? (
                      <span className="ml-1 text-muted-foreground/70">
                        · {f.financial_impact}
                      </span>
                    ) : null}
                  </p>
                ) : null}
                {f.evidence_a || f.evidence_b || f.evidence_c ? (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {f.evidence_a ? (
                      <EvidenceBlock label="One document" text={f.evidence_a} />
                    ) : null}
                    {f.evidence_b ? (
                      <EvidenceBlock
                        label="Other document"
                        text={f.evidence_b}
                      />
                    ) : null}
                    {f.evidence_c ? (
                      <EvidenceBlock
                        label="Third document"
                        text={f.evidence_c}
                      />
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

function EvidenceBlock({ label, text }: { label: string; text: string }) {
  const located = locateEvidence(text);
  const doc = located ? getDocumentById(located.sourceId) : undefined;
  const href = doc ? `${doc.pdfUrl}#page=${located!.page}` : undefined;

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-3">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
        {text}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1 text-xs font-medium text-foreground underline-offset-2 hover:underline"
        >
          <ExternalLinkIcon className="size-3.5" />
          Open
        </a>
      ) : null}
    </div>
  );
}

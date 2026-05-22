'use client';

import {
  ExternalLinkIcon,
  FileQuestionIcon,
  FileTextIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { PageCard } from '@/components/workbench/agent-page';
import type { CrossDocFindings } from '@/lib/agents/documents/schema';
import {
  DOCUMENT_KIND_LABELS,
  getDocumentById,
} from '@/lib/scenario/documents';
import { cn } from '@/lib/utils';

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
type InventoryRow = NonNullable<
  DeepPartial<CrossDocFindings>['document_inventory']
>[number];

const KIND_LABELS = DOCUMENT_KIND_LABELS as Record<string, string>;

export function DocumentInventoryCard({
  items,
  streaming,
}: {
  items: InventoryRow[];
  streaming: boolean;
}) {
  if (items.length === 0 && !streaming) return null;
  return (
    <PageCard>
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold leading-snug text-[var(--ink)]">
          Document inventory
        </h2>
        {items.length === 0 ? (
          <Shimmer className="text-xs">Classifying documents…</Shimmer>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((row, i) => {
              if (!row?.id) return null;
              return <InventoryRowItem key={`${row.id}-${i}`} row={row} />;
            })}
          </ul>
        )}
      </div>
    </PageCard>
  );
}

function InventoryRowItem({ row }: { row: InventoryRow }) {
  const present = row?.present !== false;
  const kindLabel =
    (row?.kind && KIND_LABELS[row.kind]) ||
    row?.kind ||
    'Unknown document type';
  const scenarioDoc = present && row?.id ? getDocumentById(row.id) : undefined;
  const pageCount = pageCountFor(scenarioDoc?.payload);

  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-md border p-3',
        present ? 'bg-card' : 'border-dashed bg-muted/30',
      )}
    >
      <div className="mt-0.5 text-muted-foreground">
        {present ? (
          <FileTextIcon className="size-6" />
        ) : (
          <FileQuestionIcon className="size-6" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <span className="text-sm font-medium leading-snug">
          {row?.title ?? kindLabel}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={present ? 'secondary' : 'destructive'}>
            {present ? 'Present' : 'Missing'}
          </Badge>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {kindLabel}
            {pageCount ? (
              <>
                <span className="mx-1.5 text-muted-foreground/60">·</span>
                {pageCount} {pageCount === 1 ? 'page' : 'pages'}
              </>
            ) : null}
          </span>
        </div>
        {scenarioDoc ? (
          <a
            href={scenarioDoc.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1 text-xs font-medium text-foreground underline-offset-2 hover:underline"
          >
            <ExternalLinkIcon className="size-3.5" />
            Open PDF
          </a>
        ) : null}
      </div>
    </li>
  );
}

// Pulls a `pages` count out of an arbitrary scenario payload when the
// document declares one. Treated as soft data — most JSON payloads in
// `lib/scenario/documents/data/` won't have it, so missing is fine.
function pageCountFor(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object') return null;
  const value = (payload as Record<string, unknown>).pages;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

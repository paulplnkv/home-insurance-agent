'use client';

import { FileTextIcon } from 'lucide-react';
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
          <ul className="flex flex-col gap-3">
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
        'flex items-start gap-3 rounded-xl border bg-white p-4',
        present
          ? 'border-[var(--status-open-fg)]'
          : 'border-[var(--status-danger-fg)]',
      )}
    >
      <FileTextIcon className="mt-0.5 size-6 shrink-0 text-[var(--brand-blue)]" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-sm font-medium leading-snug text-[var(--ink)]">
          {row?.title ?? kindLabel}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full border bg-white px-2 py-0.5 text-[11px] font-medium',
              present
                ? 'border-[var(--status-open-fg)] text-[var(--status-open-fg)]'
                : 'border-[var(--status-danger-fg)] text-[var(--status-danger-fg)]',
            )}
          >
            {present ? 'Present' : 'Missing'}
          </span>
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
            className="inline-flex w-fit items-center gap-1 text-xs font-medium text-[var(--brand-blue)] underline-offset-2 hover:underline"
          >
            <FileTextIcon className="size-3.5" />
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

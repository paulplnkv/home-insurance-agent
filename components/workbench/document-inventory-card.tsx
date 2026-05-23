'use client';

import { CopyIcon, FileTextIcon, MailIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Shimmer } from '@/components/ai-elements/shimmer';
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
import type { CrossDocFindings } from '@/lib/agents/documents/schema';
import { CLAIM } from '@/lib/scenario/claim';
import {
  DOCUMENT_KIND_LABELS,
  getDocumentById,
} from '@/lib/scenario/documents';
import { cn } from '@/lib/utils';
import { buildMailto } from '@/lib/utils/mailto';

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
  if (present) {
    return <PresentRow row={row} kindLabel={kindLabel} />;
  }
  return <MissingRow row={row} kindLabel={kindLabel} />;
}

function PresentRow({
  row,
  kindLabel,
}: {
  row: InventoryRow;
  kindLabel: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-[var(--status-open-fg)] bg-white p-4">
      <RowBody present row={row} kindLabel={kindLabel} />
    </li>
  );
}

function MissingRow({
  row,
  kindLabel,
}: {
  row: InventoryRow;
  kindLabel: string;
}) {
  const [subject, setSubject] = useState(() =>
    buildMissingDocSubject(kindLabel),
  );
  const [body, setBody] = useState(() => buildMissingDocBody(kindLabel));

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
    <li>
      <Dialog>
        <DialogTrigger
          render={
            <button
              type="button"
              className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-[var(--status-danger-fg)] bg-white p-4 text-left transition-colors hover:bg-red-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-danger-fg)] focus-visible:ring-offset-2"
            />
          }
        >
          <RowBody present={false} row={row} kindLabel={kindLabel} />
        </DialogTrigger>
        <DialogContent className="grid max-h-[90vh] w-full gap-4 overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request: {kindLabel}</DialogTitle>
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
    </li>
  );
}

function RowBody({
  present,
  row,
  kindLabel,
}: {
  present: boolean;
  row: InventoryRow;
  kindLabel: string;
}) {
  const scenarioDoc = present && row?.id ? getDocumentById(row.id) : undefined;
  const pageCount = pageCountFor(scenarioDoc?.payload);

  return (
    <>
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
    </>
  );
}

function buildMissingDocSubject(kindLabel: string): string {
  return `Document request — ${kindLabel} (Claim ${CLAIM.claim_number})`;
}

function buildMissingDocBody(kindLabel: string): string {
  const firstName = CLAIM.insured.name.split(' ')[0];
  return `Hi ${firstName},

Thanks again for your patience as we work through your hailstorm claim (${CLAIM.claim_number}, date of loss ${CLAIM.loss.date_of_loss}).

As I'm reviewing the file, I noticed we're still missing the following document:

  • ${kindLabel}

Whenever you have a moment, could you reply to this email with a copy attached? A clear photo or scan is fine — please make sure the whole page is in frame and the text is legible.

Having this in hand will let me keep your claim moving without any avoidable delays. If you're not sure where to find it, or if you'd rather text it over, just let me know and we'll figure out the easiest path.

Thanks,
— ${CLAIM.adjuster.name}
  Pacific States Mutual · ${CLAIM.adjuster.team}
  ${CLAIM.adjuster.phone}`;
}

// Pulls a `pages` count out of an arbitrary scenario payload when the
// document declares one. Treated as soft data — most JSON payloads in
// `lib/scenario/documents/data/` won't have it, so missing is fine.
function pageCountFor(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object') return null;
  const value = (payload as Record<string, unknown>).pages;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

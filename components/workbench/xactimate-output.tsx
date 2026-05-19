'use client';

import { DownloadIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { CLAIM, formatCurrency } from '@/lib/scenario/claim';
import type { DamageAgentOutput } from '@/lib/agents/photos/schema';
import {
  CATALOG_BY_SELECTOR,
  PRICE_LIST_META,
} from '@/lib/xactimate/catalog';
import {
  priceLineItems,
  renderXactimateXML,
  type PricedEstimate,
  type RawLineItem,
} from '@/lib/xactimate/xml';
import { cn } from '@/lib/utils';

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type StreamingDamage = DeepPartial<DamageAgentOutput>;

function moneyCents(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function moneyWhole(n: number): string {
  return formatCurrency(n);
}

// Filter the streamed line items to those that are fully formed enough
// to price. The model emits partial tokens during streaming — selector
// strings may briefly read "RFG 24" before becoming "RFG 240S", and
// quantity may be undefined.
function toValidRawItems(
  streamed: StreamingDamage['estimate_line_items']
): RawLineItem[] {
  if (!streamed) return [];
  const out: RawLineItem[] = [];
  for (const li of streamed) {
    if (!li?.selector || !li.zone) continue;
    if (!CATALOG_BY_SELECTOR.has(li.selector)) continue;
    if (typeof li.quantity !== 'number' || !(li.quantity > 0)) continue;
    out.push({
      zone: li.zone,
      selector: li.selector,
      quantity: li.quantity,
    });
  }
  return out;
}

export function XactimateOutput({
  object,
  isStreaming,
}: {
  object: StreamingDamage | undefined;
  isStreaming: boolean;
}) {
  const items = useMemo(
    () => toValidRawItems(object?.estimate_line_items),
    [object?.estimate_line_items]
  );

  const priced = useMemo(() => priceLineItems(items, CLAIM), [items]);
  const xml = useMemo(
    () => renderXactimateXML(priced, CLAIM),
    [priced]
  );

  const streamedCount = object?.estimate_line_items?.length ?? 0;
  const showShimmer =
    isStreaming && priced.line_count < Math.max(streamedCount, 4);

  return (
    <Accordion defaultValue={['estimate']}>
      <AccordionItem value="estimate">
        <AccordionTrigger className="text-xs uppercase tracking-wide text-muted-foreground hover:no-underline">
          <span className="flex items-center gap-2">
            Xactimate estimate ({priced.line_count} line{priced.line_count === 1 ? '' : 's'})
            {showShimmer ? (
              <Shimmer className="text-xs normal-case tracking-normal">
                pricing line items…
              </Shimmer>
            ) : null}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          {priced.line_count === 0 ? (
            <p className="text-xs italic text-muted-foreground">
              {isStreaming
                ? 'Waiting for line items…'
                : 'No line items in this estimate.'}
            </p>
          ) : (
            <Tabs defaultValue="sheet">
              <div className="flex items-center justify-between gap-3">
                <TabsList>
                  <TabsTrigger value="sheet">Estimate sheet</TabsTrigger>
                  <TabsTrigger value="xml">XML</TabsTrigger>
                </TabsList>
                <DownloadButton xml={xml} />
              </div>

              <TabsContent value="sheet" className="mt-3">
                <EstimateSheet priced={priced} />
              </TabsContent>

              <TabsContent value="xml" className="mt-3">
                <XmlView xml={xml} isStreaming={isStreaming} />
              </TabsContent>
            </Tabs>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function EstimateSheet({ priced }: { priced: PricedEstimate }) {
  const { rooms, summary } = priced;
  return (
    <div className="flex flex-col gap-4">
      {rooms.map((room) => (
        <div key={room.zone} className="overflow-hidden rounded-md border">
          <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">{room.name}</Badge>
              <code className="font-mono text-[10px] text-muted-foreground">
                {room.zone}
              </code>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              Subtotal {moneyCents(room.subtotal_rcv)}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium">Selector</th>
                <th className="px-3 py-1.5 text-left font-medium">Description</th>
                <th className="px-3 py-1.5 text-right font-medium">Qty</th>
                <th className="px-3 py-1.5 text-left font-medium">Unit</th>
                <th className="px-3 py-1.5 text-right font-medium">Unit $</th>
                <th className="px-3 py-1.5 text-right font-medium">RCV</th>
              </tr>
            </thead>
            <tbody>
              {room.items.map((li, i) => (
                <tr
                  key={`${li.catalog.selector}-${i}`}
                  className="border-t text-[13px]"
                >
                  <td className="px-3 py-1.5 font-mono text-xs">
                    {li.catalog.selector}
                  </td>
                  <td className="px-3 py-1.5">{li.catalog.description}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {li.quantity.toFixed(2)}
                  </td>
                  <td className="px-3 py-1.5">{li.catalog.unit}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {moneyCents(li.catalog.unit_price)}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-medium">
                    {moneyCents(li.rcv)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <SummaryCard summary={summary} />
    </div>
  );
}

function SummaryCard({ summary }: { summary: PricedEstimate['summary'] }) {
  const rows: Array<{ label: string; value: string; emphasis?: boolean }> = [
    { label: 'Line items subtotal (RCV)', value: moneyCents(summary.subtotal_rcv) },
    { label: 'Sales tax (8.25%)', value: moneyCents(summary.sales_tax) },
    { label: 'Overhead (10%)', value: moneyCents(summary.overhead) },
    { label: 'Profit (10%)', value: moneyCents(summary.profit) },
    { label: 'Replacement cost (RCV)', value: moneyCents(summary.total_rcv), emphasis: true },
    { label: 'Depreciation', value: `−${moneyCents(summary.total_depreciation)}` },
    { label: 'Actual cash value (ACV)', value: moneyCents(summary.acv), emphasis: true },
    {
      label: `Deductible (greater of AOP ${moneyWhole(CLAIM.policy.deductibles.aop_standard)} / Wind-Hail 2% of ${moneyWhole(CLAIM.policy.coverage_a_dwelling)})`,
      value: `−${moneyCents(summary.deductible)}`,
    },
    { label: 'Net claim payable', value: moneyCents(summary.net_claim), emphasis: true },
  ];

  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <div className="border-b bg-muted/40 px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">
        Summary · {PRICE_LIST_META.region} · effective {PRICE_LIST_META.effective_date}
      </div>
      <dl className="divide-y text-sm">
        {rows.map((r) => (
          <div
            key={r.label}
            className={cn(
              'flex items-center justify-between gap-4 px-3 py-1.5',
              r.emphasis && 'bg-muted/20 font-medium'
            )}
          >
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="tabular-nums text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function XmlView({
  xml,
  isStreaming,
}: {
  xml: string;
  isStreaming: boolean;
}) {
  const [highlighted, setHighlighted] = useState<{
    xml: string;
    html: string;
  } | null>(null);

  // Run Shiki only once the stream is complete — highlighting on every
  // token is wasteful and flicker-y. During streaming we render plain
  // monospace text. The render below also gates on `!isStreaming` so a
  // stale highlighted snapshot never bleeds into a new run.
  useEffect(() => {
    if (isStreaming) return;
    let cancelled = false;
    (async () => {
      const { codeToHtml } = await import('shiki');
      const html = await codeToHtml(xml, {
        lang: 'xml',
        theme: 'github-dark',
      });
      if (!cancelled) setHighlighted({ xml, html });
    })();
    return () => {
      cancelled = true;
    };
  }, [xml, isStreaming]);

  const canShowHighlighted =
    !isStreaming && highlighted?.xml === xml && highlighted.html;

  if (canShowHighlighted) {
    return (
      <div
        className="overflow-auto rounded-md border text-xs [&_pre]:m-0 [&_pre]:p-3"
        dangerouslySetInnerHTML={{ __html: highlighted.html }}
      />
    );
  }

  return (
    <pre className="overflow-auto rounded-md border bg-zinc-950 p-3 text-xs leading-relaxed text-zinc-100">
      <code>{xml}</code>
    </pre>
  );
}

function DownloadButton({ xml }: { xml: string }) {
  const href = useMemo(
    () =>
      `data:application/xml;charset=utf-8,${encodeURIComponent(xml)}`,
    [xml]
  );
  const filename = `xactimate-${CLAIM.claim_number}.xml`;
  return (
    <a
      href={href}
      download={filename}
      className={buttonVariants({ size: 'sm', variant: 'outline' })}
    >
      <DownloadIcon className="size-3.5" />
      Download .xml
    </a>
  );
}

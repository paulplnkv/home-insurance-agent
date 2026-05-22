'use client';

import { DownloadIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { PageCard } from '@/components/workbench/agent-page';
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
  const xml = useMemo(() => renderXactimateXML(priced, CLAIM), [priced]);

  const streamedCount = object?.estimate_line_items?.length ?? 0;
  const showShimmer =
    isStreaming && priced.line_count < Math.max(streamedCount, 4);

  return (
    <PageCard>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">
            Xactimate estimate ({priced.line_count} line
            {priced.line_count === 1 ? '' : 's'})
            {showShimmer ? (
              <Shimmer className="ml-2 text-sm font-normal normal-case tracking-normal">
                pricing line items…
              </Shimmer>
            ) : null}
          </h3>
          {priced.line_count > 0 ? <DownloadLink xml={xml} /> : null}
        </div>

        {priced.line_count === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            {isStreaming
              ? 'Waiting for line items…'
              : 'No line items in this estimate.'}
          </p>
        ) : (
          <Tabs defaultValue="sheet">
            <TabsList
              variant="line"
              className="h-auto w-fit gap-1 rounded-full border border-[#d9dadc] bg-[#f6f6f6] p-0.5"
            >
              <TabsTrigger
                value="sheet"
                className="rounded-full border-transparent px-4 py-2 text-base text-[var(--brand-blue)] data-active:bg-[var(--brand-blue)] data-active:text-white"
              >
                Estimate sheet
              </TabsTrigger>
              <TabsTrigger
                value="xml"
                className="rounded-full border-transparent bg-white px-4 py-2 text-base text-[var(--brand-blue)] data-active:bg-[var(--brand-blue)] data-active:text-white"
              >
                XML
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sheet" className="mt-4">
              <EstimateSheet priced={priced} />
            </TabsContent>

            <TabsContent value="xml" className="mt-4">
              <XmlView xml={xml} isStreaming={isStreaming} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageCard>
  );
}

function EstimateSheet({ priced }: { priced: PricedEstimate }) {
  const { rooms, summary } = priced;
  return (
    <div className="flex flex-col gap-4">
      {rooms.map((room) => (
        <div
          key={room.zone}
          className="overflow-hidden rounded-2xl border border-[var(--line-soft)]"
        >
          <div className="flex items-center justify-between gap-2 bg-[#edf3ff] px-3 py-4">
            <div className="flex items-center gap-4">
              <Badge variant="zone_tag" className="px-2 py-1 text-sm">
                {room.name}
              </Badge>
              <code className="font-mono text-base text-[var(--ink)]">
                {room.zone}
              </code>
            </div>
            <span className="text-base tabular-nums text-[var(--ink)]">
              Subtotal: {moneyCents(room.subtotal_rcv)}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#edf3ff]">
              <tr>
                <th className="w-[126px] px-3 py-4 text-left font-semibold text-[var(--brand-blue)]">
                  SELECTOR
                </th>
                <th className="w-[317px] px-3 py-4 text-left font-semibold text-[var(--brand-blue)]">
                  DESCRIPTION
                </th>
                <th className="px-3 py-4 text-right font-semibold text-[var(--brand-blue)]">
                  QTY
                </th>
                <th className="px-3 py-4 text-right font-semibold text-[var(--brand-blue)]">
                  UNIT
                </th>
                <th className="px-3 py-4 text-right font-semibold text-[var(--brand-blue)]">
                  UNIT, $
                </th>
                <th className="px-3 py-4 text-right font-semibold text-[var(--brand-blue)]">
                  RCV
                </th>
              </tr>
            </thead>
            <tbody>
              {room.items.map((li, i) => (
                <tr
                  key={`${li.catalog.selector}-${i}`}
                  className="border-t border-[var(--line-soft)] text-base"
                >
                  <td className="px-3 py-4 font-mono text-sm text-[var(--ink)]">
                    {li.catalog.selector}
                  </td>
                  <td className="px-3 py-4 text-[var(--ink)]">
                    {li.catalog.description}
                  </td>
                  <td className="px-3 py-4 text-right tabular-nums text-[var(--ink)]">
                    {li.quantity.toFixed(2)}
                  </td>
                  <td className="px-3 py-4 text-right text-[var(--ink)]">
                    {li.catalog.unit}
                  </td>
                  <td className="px-3 py-4 text-right tabular-nums text-[var(--ink)]">
                    {moneyCents(li.catalog.unit_price)}
                  </td>
                  <td className="px-3 py-4 text-right tabular-nums font-medium text-[var(--ink)]">
                    {moneyCents(li.rcv)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <SummaryTable summary={summary} />
    </div>
  );
}

function SummaryTable({ summary }: { summary: PricedEstimate['summary'] }) {
  const rows: Array<{ label: string; value: string; emphasis?: boolean }> = [
    { label: 'Line items subtotal (RCV)', value: moneyCents(summary.subtotal_rcv) },
    { label: 'Sales tax (8.25%)', value: moneyCents(summary.sales_tax) },
    { label: 'Overhead (10%)', value: moneyCents(summary.overhead) },
    { label: 'Profit (10%)', value: moneyCents(summary.profit) },
    {
      label: 'Replacement cost (RCV)',
      value: moneyCents(summary.total_rcv),
      emphasis: true,
    },
    { label: 'Depreciation', value: `−${moneyCents(summary.total_depreciation)}` },
    {
      label: 'Actual cash value (ACV)',
      value: moneyCents(summary.acv),
      emphasis: true,
    },
    {
      label: `Deductible (greater of AOP ${moneyWhole(CLAIM.policy.deductibles.aop_standard)} / Wind-Hail 2% of ${moneyWhole(CLAIM.policy.coverage_a_dwelling)})`,
      value: `−${moneyCents(summary.deductible)}`,
    },
    {
      label: 'Net claim payable',
      value: moneyCents(summary.net_claim),
      emphasis: true,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)]">
      <table className="w-full text-sm">
        <thead className="bg-[#edf3ff]">
          <tr>
            <th
              colSpan={2}
              className="px-3 py-4 text-left text-base font-semibold text-[var(--ink)]"
            >
              SUMMARY · {PRICE_LIST_META.region} · effective{' '}
              {PRICE_LIST_META.effective_date}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.label}
              className="border-t border-[var(--line-soft)] text-base"
            >
              <td
                className={`px-3 py-4 text-[var(--ink)] ${r.emphasis ? 'font-semibold' : ''}`}
              >
                {r.label}
              </td>
              <td
                className={`px-3 py-4 text-right tabular-nums text-[var(--ink)] ${r.emphasis ? 'font-semibold' : ''}`}
              >
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

function DownloadLink({ xml }: { xml: string }) {
  const href = useMemo(
    () => `data:application/xml;charset=utf-8,${encodeURIComponent(xml)}`,
    [xml]
  );
  const filename = `xactimate-${CLAIM.claim_number}.xml`;
  return (
    <a
      href={href}
      download={filename}
      className="inline-flex items-center gap-1 text-sm font-normal text-[var(--brand-blue)] hover:underline"
    >
      <DownloadIcon className="size-4" />
      Download .xml
    </a>
  );
}

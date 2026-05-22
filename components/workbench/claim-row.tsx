'use client';

import type { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardAiStatusCell } from '@/components/workbench/dashboard-ai-status-cell';
import { StatusBadge } from '@/components/workbench/status-badge';
import { formatCurrency, formatDate } from '@/lib/scenario/claim';
import { type ClaimSummary } from '@/lib/scenario/dashboard-claims';
import { cn } from '@/lib/utils';

function pseudoDaysOpen(claimNumber: string): number {
  let h = 0;
  for (let i = 0; i < claimNumber.length; i++) {
    h = (h * 31 + claimNumber.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 8) + 1;
}

export function ClaimRow({ claim }: { claim: ClaimSummary }) {
  const router = useRouter();
  const detailHref = `/claims/${claim.claim_number}`;
  const days =
    claim.is_real || claim.status === 'Open'
      ? 1
      : pseudoDaysOpen(claim.claim_number);

  const navigate = () => {
    if (claim.is_real) router.push(detailHref);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (!claim.is_real) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(detailHref);
    }
  };

  return (
    <tr
      onClick={navigate}
      onKeyDown={onKeyDown}
      tabIndex={claim.is_real ? 0 : -1}
      role={claim.is_real ? 'link' : undefined}
      aria-label={
        claim.is_real ? `Open claim ${claim.claim_number}` : undefined
      }
      className={cn(
        'border-b border-[var(--line-table)] transition-colors hover:bg-[var(--surface-table-header)]/50 focus-visible:bg-[var(--surface-table-header)]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand-blue)]',
        claim.is_real ? 'cursor-pointer' : 'cursor-default',
      )}
    >
      <td className="px-3 py-4 text-base text-[var(--ink)]">
        <div className="flex flex-col items-start gap-1">
          <span className="whitespace-nowrap">{claim.claim_number}</span>
          {claim.cat_event ? (
            <span
              title={claim.cat_event}
              className="inline-flex items-center rounded-full border border-[var(--status-cat-fg)] bg-[var(--status-cat-bg)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--status-cat-fg)]"
            >
              CAT
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-3 py-4 text-base text-[var(--ink)]">
        {claim.insured_name}
      </td>
      <td className="px-3 py-4 text-base text-[var(--ink)]">{claim.loss_address}</td>
      <td className="px-3 py-4 text-base text-[var(--ink)]">{claim.peril}</td>
      <td className="px-3 py-4">
        <StatusBadge status={claim.status} />
      </td>
      <td className="px-3 py-4 text-base text-[var(--ink)]">
        {formatDate(claim.date_of_loss)}
      </td>
      <td className="px-3 py-4 text-base text-[var(--ink)] tabular-nums">
        {days}
      </td>
      <td className="px-3 py-4 text-right text-base font-semibold text-[var(--ink)] tabular-nums">
        {claim.reserve_working == null
          ? '—'
          : formatCurrency(claim.reserve_working)}
      </td>
      <td className="px-3 py-4 text-right text-base font-semibold text-[var(--ink)] tabular-nums">
        {formatCurrency(claim.coverage_a)}
      </td>
      <td className="px-3 py-4 text-base text-[var(--ink)]">{claim.adjuster_name}</td>
      <td className="px-3 py-4 text-center">
        <DashboardAiStatusCell isReal={claim.is_real} />
      </td>
    </tr>
  );
}

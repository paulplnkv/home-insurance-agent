'use client';

import type { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardAiStatusCell } from '@/components/workbench/dashboard-ai-status-cell';
import { StatusBadge } from '@/components/workbench/status-badge';
import { formatCurrency, formatDate } from '@/lib/scenario/claim';
import { type ClaimSummary } from '@/lib/scenario/dashboard-claims';
import { cn } from '@/lib/utils';

function daysOpenClass(days: number): string {
  if (days > 30) {
    return 'bg-red-100 text-red-900 dark:bg-red-500/15 dark:text-red-300';
  }
  if (days > 20) {
    return 'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300';
  }
  return 'text-foreground';
}

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
        'border-t transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-accent/40',
        claim.is_real ? 'cursor-pointer' : 'cursor-default',
      )}
    >
      <td className="px-6 py-3 font-mono text-xs font-medium text-foreground">
        <span className="inline-flex items-center gap-2">
          {claim.claim_number}
          {claim.cat_event ? (
            <span
              title={claim.cat_event}
              className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-800 dark:bg-orange-500/20 dark:text-orange-300"
            >
              CAT
            </span>
          ) : null}
        </span>
      </td>
      <td className="px-4 py-3 font-medium text-foreground">
        {claim.insured_name}
      </td>
      <td className="px-4 py-3 text-foreground">{claim.loss_address}</td>
      <td className="px-4 py-3 text-foreground">{claim.peril}</td>
      <td className="px-4 py-3">
        <StatusBadge status={claim.status} />
      </td>
      <td className="px-4 py-3 text-foreground">
        {formatDate(claim.date_of_loss)}
      </td>
      <td className="px-4 py-3 text-right">
        <span
          className={cn(
            'inline-block min-w-7 rounded px-1.5 font-mono text-xs',
            daysOpenClass(days),
          )}
        >
          {days}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
        {claim.reserve_working == null
          ? '—'
          : formatCurrency(claim.reserve_working)}
      </td>
      <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
        {formatCurrency(claim.coverage_a)}
      </td>
      <td className="px-4 py-3 text-foreground">{claim.adjuster_name}</td>
      <td className="px-6 py-3 text-center">
        <DashboardAiStatusCell isReal={claim.is_real} />
      </td>
    </tr>
  );
}

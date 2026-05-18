'use client';

import type { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/workbench/status-badge';
import { formatCurrency, formatDate } from '@/lib/scenario/claim';
import type { ClaimSummary } from '@/lib/scenario/dashboard-claims';
import { cn } from '@/lib/utils';

export function ClaimRow({ claim }: { claim: ClaimSummary }) {
  const router = useRouter();
  const detailHref = `/claims/${claim.claim_number}`;

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
        {claim.claim_number}
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
      <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
        {formatCurrency(claim.coverage_a)}
      </td>
      <td className="px-6 py-3 text-foreground">{claim.adjuster_name}</td>
    </tr>
  );
}

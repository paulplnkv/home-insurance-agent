'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ClaimRow } from '@/components/workbench/claim-row';
import {
  DASHBOARD_CLAIMS,
  OPEN_STATUSES,
} from '@/lib/scenario/dashboard-claims';
import { cn } from '@/lib/utils';

function KpiTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="gap-2 px-5 py-4">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-semibold leading-none">{value}</span>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </Card>
  );
}

type ViewMode = 'open' | 'all';

export function ClaimsDashboard() {
  const [mode, setMode] = useState<ViewMode>('open');

  const openClaims = useMemo(
    () => DASHBOARD_CLAIMS.filter((c) => OPEN_STATUSES.has(c.status)),
    [],
  );
  const visibleClaims = mode === 'open' ? openClaims : DASHBOARD_CLAIMS;

  const investigating = DASHBOARD_CLAIMS.filter(
    (c) => c.status === 'In Investigation',
  ).length;
  const pendingReview = DASHBOARD_CLAIMS.filter(
    (c) => c.status === 'Pending Review',
  ).length;
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-tight">
            Claims Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            {visibleClaims.length}{' '}
            {mode === 'open' ? 'open' : 'total'} claims · Updated {today}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          Pacific States Mutual · Texas region
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiTile
          label="Open claims"
          value={String(openClaims.length)}
          hint="Active workload"
        />
        <KpiTile
          label="In investigation"
          value={String(investigating)}
          hint="Field review underway"
        />
        <KpiTile
          label="Pending review"
          value={String(pendingReview)}
          hint="Awaiting adjuster sign-off"
        />
      </div>

      <div
        role="tablist"
        aria-label="Filter claims"
        className="inline-flex w-fit items-center gap-1 rounded-md border bg-card p-1 text-xs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'open'}
          onClick={() => setMode('open')}
          className={cn(
            'rounded px-3 py-1 font-medium transition-colors',
            mode === 'open'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Open ({openClaims.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'all'}
          onClick={() => setMode('all')}
          className={cn(
            'rounded px-3 py-1 font-medium transition-colors',
            mode === 'all'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          All ({DASHBOARD_CLAIMS.length})
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="whitespace-nowrap">
                <th className="px-6 py-2 text-left font-medium">Claim #</th>
                <th className="px-4 py-2 text-left font-medium">Insured</th>
                <th className="px-4 py-2 text-left font-medium">Loss address</th>
                <th className="px-4 py-2 text-left font-medium">Peril</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Date of loss</th>
                <th className="px-4 py-2 text-right font-medium">Days open</th>
                <th className="px-4 py-2 text-right font-medium">Reserve</th>
                <th className="px-4 py-2 text-right font-medium">Coverage A</th>
                <th className="px-4 py-2 text-left font-medium">Adjuster</th>
                <th className="px-6 py-2 text-center font-medium">AI status</th>
              </tr>
            </thead>
            <tbody>
              {visibleClaims.map((claim) => (
                <ClaimRow key={claim.claim_number} claim={claim} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

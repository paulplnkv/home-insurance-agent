'use client';

import { useMemo, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import {
  InvestigationIcon,
  OpenClaimsIcon,
  PendingReviewIcon,
} from '@/components/icons/claim-status-icons';
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
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="flex h-[123px] items-center gap-4 rounded-lg bg-white p-4 shadow-[0_0_20px_0_rgba(0,0,0,0.1)]">
      <Icon aria-hidden className="size-[91px] shrink-0" />
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-normal uppercase text-[var(--ink)]">
          {label}
        </span>
        <span className="text-2xl font-semibold leading-none text-[var(--ink)]">
          {value}
        </span>
        <span className="text-sm font-normal text-[var(--ink)]">{hint}</span>
      </div>
    </div>
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
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold leading-tight text-[var(--ink)]">
          Claims Dashboard
        </h1>
        <p className="flex flex-wrap items-center gap-2 text-sm text-[var(--ink)]">
          <span>{openClaims.length} open claims</span>
          <span aria-hidden className="block size-1 rounded-full bg-[var(--ink-soft)]" />
          <span>Updated {today}</span>
          <span aria-hidden className="block size-1 rounded-full bg-[var(--ink-soft)]" />
          <span className="text-[var(--ink-soft)]">
            Pacific States Mutual (Texas region)
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiTile
          label="Open claims"
          value={String(openClaims.length)}
          hint="Active workload"
          icon={OpenClaimsIcon}
        />
        <KpiTile
          label="In investigation"
          value={String(investigating)}
          hint="Field review underway"
          icon={InvestigationIcon}
        />
        <KpiTile
          label="Pending review"
          value={String(pendingReview)}
          hint="Awaiting adjuster sign-off"
          icon={PendingReviewIcon}
        />
      </div>

      <div
        role="tablist"
        aria-label="Filter claims"
        className="inline-flex w-fit items-center gap-1 rounded-full border border-[var(--line-table)] bg-[var(--surface-tab-track)] p-0.5 font-[family-name:var(--font-commissioner)]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'open'}
          onClick={() => setMode('open')}
          className={cn(
            'rounded-full border px-4 py-2 text-base font-normal transition-colors',
            mode === 'open'
              ? 'border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white'
              : 'border-transparent bg-white text-[var(--brand-blue)]',
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
            'rounded-full border px-4 py-2 text-base font-normal transition-colors',
            mode === 'all'
              ? 'border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white'
              : 'border-transparent bg-white text-[var(--brand-blue)]',
          )}
        >
          All ({DASHBOARD_CLAIMS.length})
        </button>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[var(--line-soft)] bg-white font-[family-name:var(--font-commissioner)]">
        {/* table-fixed + colgroup pins column widths so the layout doesn't
            shift when the user toggles Open ↔ All. Widths mirror Figma. */}
        <table className="w-full table-fixed text-base">
          <colgroup>
            <col className="w-[170px]" />
            <col className="w-[140px]" />
            <col className="w-[200px]" />
            <col className="w-[110px]" />
            <col className="w-[150px]" />
            <col className="w-[140px]" />
            <col className="w-[110px]" />
            <col className="w-[130px]" />
            <col className="w-[140px]" />
            <col className="w-[140px]" />
            <col className="w-[90px]" />
          </colgroup>
          <thead className="bg-[var(--surface-table-header)] text-[var(--brand-blue)]">
            <tr className="border-b border-[var(--line-table)]">
              <th className="px-3 py-4 text-left text-base font-semibold uppercase whitespace-nowrap">Claim #</th>
              <th className="px-3 py-4 text-left text-base font-semibold uppercase whitespace-nowrap">Insured</th>
              <th className="px-3 py-4 text-left text-base font-semibold uppercase whitespace-nowrap">Loss address</th>
              <th className="px-3 py-4 text-left text-base font-semibold uppercase whitespace-nowrap">Peril</th>
              <th className="px-3 py-4 text-left text-base font-semibold uppercase whitespace-nowrap">Status</th>
              <th className="px-3 py-4 text-left text-base font-semibold uppercase whitespace-nowrap">Date of loss</th>
              <th className="px-3 py-4 text-left text-base font-semibold uppercase whitespace-nowrap">Days open</th>
              <th className="px-3 py-4 text-right text-base font-semibold uppercase whitespace-nowrap">Reserve</th>
              <th className="px-3 py-4 text-right text-base font-semibold uppercase whitespace-nowrap">Coverage A</th>
              <th className="px-3 py-4 text-left text-base font-semibold uppercase whitespace-nowrap">Adjuster</th>
              <th className="px-3 py-4 text-center text-base font-semibold uppercase whitespace-nowrap">AI</th>
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
  );
}

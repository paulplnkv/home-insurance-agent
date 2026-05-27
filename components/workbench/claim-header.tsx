import { AlertTriangleIcon, MailIcon, PhoneIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConsistencyCheckBadge } from './consistency-check-badge';
import { StatusBadge } from './status-badge';
import { CLAIM, formatDate, formatDateTime } from '@/lib/scenario/claim';
import { daysSinceLoss } from '@/lib/scenario/dashboard-claims';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ClaimHeader() {
  return (
    <header className="mt-4 grid gap-6 lg:grid-cols-[1fr_557px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <h1 className="text-[24px] font-semibold leading-none tracking-tight text-[var(--ink)]">
          {CLAIM.claim_number} · {CLAIM.insured.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={CLAIM.status} />
          <ConsistencyCheckBadge />
          <Badge
            variant="outline"
            className="gap-1 rounded-full border-[#9e3838] bg-transparent px-2 py-1 text-[14px] font-normal text-[#9e3838]"
          >
            <AlertTriangleIcon className="size-4" />
            {CLAIM.loss.cat_event}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[14px] text-[var(--ink)]">
          <span>CLAIM</span>
          <span aria-hidden className="size-1 rounded-full bg-[var(--ink)]" />
          <span>POLICY {CLAIM.policy.number}</span>
          <span aria-hidden className="size-1 rounded-full bg-[var(--ink)]" />
          <span className="inline-flex items-center gap-1 text-[var(--ink-soft)]">
            <span aria-hidden>📍</span>
            {CLAIM.insured.address}
          </span>
        </div>
      </div>

      <AdjusterCard />
    </header>
  );
}

function AdjusterCard() {
  return (
    <div className="relative flex h-[132px] w-full items-start gap-4 overflow-hidden rounded-[8px] bg-white p-4 shadow-[0_0_20px_rgba(0,0,0,0.1)]">
      <div
        aria-hidden
        className="flex size-[71px] shrink-0 items-center justify-center rounded-full border border-[var(--line-soft)] bg-[#edf3ff] text-[24px] font-semibold text-[var(--brand-blue)]"
      >
        {initials(CLAIM.adjuster.name)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[14px] text-[var(--ink)]">ASSIGNED ADJUSTER</span>
        <span className="text-[24px] font-semibold leading-tight text-[var(--ink)]">
          {CLAIM.adjuster.name}
        </span>
        <span className="text-[14px] text-[var(--ink)]">
          {CLAIM.adjuster.team}
        </span>
      </div>
      <div className="absolute bottom-3 left-4 flex items-center gap-4 text-[14px] text-[var(--brand-blue)]">
        <a
          href={`tel:${CLAIM.adjuster.phone}`}
          className="inline-flex items-center gap-1 hover:underline"
        >
          <PhoneIcon className="size-4" />
          {CLAIM.adjuster.phone}
        </a>
        <a
          href={`mailto:${CLAIM.adjuster.email}`}
          className="inline-flex items-center gap-1 hover:underline"
        >
          <MailIcon className="size-4" />
          {CLAIM.adjuster.email}
        </a>
      </div>
    </div>
  );
}

export function ClaimStatsBar() {
  const open = daysSinceLoss(CLAIM.loss.date_of_loss);
  const reportedVia = (
    <>
      <span>{CLAIM.insured.preferred_contact}</span>
      <span className="font-normal text-[var(--ink-soft)]"> · </span>
      <span>Insured</span>
    </>
  );

  const stats: ReadonlyArray<{ label: string; value: React.ReactNode }> = [
    { label: 'PERIL', value: CLAIM.loss.peril },
    { label: 'DATE OF LOSS', value: formatDate(CLAIM.loss.date_of_loss) },
    { label: 'FNOL FILED', value: formatDateTime(CLAIM.loss.fnol_filed_at) },
    { label: 'DAYS OPEN', value: `${open} ${open === 1 ? 'day' : 'days'}` },
    { label: 'REPORTED VIA', value: reportedVia },
    { label: 'LOSS STATE', value: CLAIM.loss.location_state },
  ];

  return (
    <div className="flex items-center justify-between gap-6 rounded-[16px] border border-[var(--line-soft)] bg-white p-6">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-2">
          <span className="text-[14px] font-normal text-[var(--ink)]">
            {stat.label}
          </span>
          <span className="whitespace-nowrap text-[16px] font-semibold text-[var(--ink)]">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}

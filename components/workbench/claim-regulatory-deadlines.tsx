import { formatDate } from '@/lib/scenario/claim';
import { cn } from '@/lib/utils';
import { SectionCard, SectionTitle } from './section-card';

type Status = 'met' | 'pending';

type DeadlineRow = {
  requirement: string;
  cadence: string;
  dueIso: string | null;
  status: Status;
};

const ROWS: ReadonlyArray<DeadlineRow> = [
  {
    requirement: 'Acknowledge receipt',
    cadence: '15 calendar days from FNOL',
    dueIso: '2026-05-08',
    status: 'met',
  },
  {
    requirement: 'Accept or deny',
    cadence: '15 business days from complete proof of loss',
    dueIso: null,
    status: 'pending',
  },
  {
    requirement: 'Issue payment',
    cadence: '5 business days from acceptance',
    dueIso: null,
    status: 'pending',
  },
];

const DAY_MS = 1000 * 60 * 60 * 24;

function dueColorClass(dueIso: string | null, status: Status): string {
  if (status === 'met') return 'text-[var(--status-open-fg)]';
  if (!dueIso) return 'text-[var(--ink-soft)]';
  const diffDays = (new Date(dueIso).getTime() - Date.now()) / DAY_MS;
  if (diffDays < 0) return 'text-[var(--status-danger-fg)]';
  if (diffDays <= 5) return 'text-[var(--status-review-fg)]';
  return 'text-[var(--ink)]';
}

function StatusPill({ status }: { status: Status }) {
  if (status === 'met') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-open-fg)] bg-[var(--status-open-bg)] px-2 py-1 text-[14px] text-[var(--status-open-fg)]">
        <span aria-hidden>✅</span> Met
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-review-fg)] bg-[var(--status-review-bg)] px-2 py-1 text-[14px] text-[var(--status-review-fg)]">
      <span aria-hidden>⏳</span> Pending
    </span>
  );
}

export function ClaimRegulatoryDeadlines() {
  return (
    <SectionCard>
      <SectionTitle>Regulatory deadlines · TX TDI</SectionTitle>
      {ROWS.map((row) => (
        <div
          key={row.requirement}
          className="flex items-center justify-between gap-3 rounded-[8px] bg-white p-3 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
        >
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-[16px] font-semibold leading-tight text-[var(--ink)]">
              {row.requirement}
            </span>
            <span className="text-[14px] text-[var(--ink)]">
              {row.cadence}
            </span>
            <span className={cn('text-[14px]', dueColorClass(row.dueIso, row.status))}>
              {row.dueIso ? `Due ${formatDate(row.dueIso)}` : 'TBD'}
            </span>
          </div>
          <StatusPill status={row.status} />
        </div>
      ))}
    </SectionCard>
  );
}

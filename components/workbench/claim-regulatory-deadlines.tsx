import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDate } from '@/lib/scenario/claim';
import { cn } from '@/lib/utils';

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
  if (status === 'met') return 'text-emerald-600';
  if (!dueIso) return 'text-muted-foreground';
  const diffDays = (new Date(dueIso).getTime() - Date.now()) / DAY_MS;
  if (diffDays < 0) return 'text-red-600';
  if (diffDays <= 5) return 'text-amber-600';
  return 'text-foreground';
}

function StatusPill({ status }: { status: Status }) {
  if (status === 'met') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <span aria-hidden>✅</span> Met
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <span aria-hidden>⏳</span> Pending
    </span>
  );
}

export function ClaimRegulatoryDeadlines() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Regulatory Deadlines · TX TDI
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pb-4">
        {ROWS.map((row) => (
          <div
            key={row.requirement}
            className="flex items-start justify-between gap-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium leading-tight">
                {row.requirement}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.cadence}
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  dueColorClass(row.dueIso, row.status),
                )}
              >
                {row.dueIso ? `Due ${formatDate(row.dueIso)}` : 'TBD'}
              </span>
            </div>
            <StatusPill status={row.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

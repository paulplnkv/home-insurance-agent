import { formatCurrency } from '@/lib/scenario/claim';
import { cn } from '@/lib/utils';

type LineCode = 'A' | 'B' | 'C' | 'D' | 'HE7' | 'HO0490' | 'HO0441';
type LineStatus =
  | 'PENDING'
  | 'COVERED'
  | 'PARTIALLY_COVERED'
  | 'EXCLUDED'
  | 'NEEDS_REVIEW';

type ScaffoldRow = {
  code: LineCode;
  label: string;
  detail: string;
};

const ROWS: ReadonlyArray<ScaffoldRow> = [
  { code: 'A', label: 'Coverage A — Dwelling', detail: formatCurrency(480_000) },
  { code: 'B', label: 'Coverage B — Other Structures', detail: formatCurrency(48_000) },
  { code: 'C', label: 'Coverage C — Personal Property', detail: formatCurrency(240_000) },
  { code: 'D', label: 'Coverage D — Loss of Use', detail: formatCurrency(96_000) },
  { code: 'HE7', label: 'Endorsement HE-7', detail: 'Wind/Hail % Deductible' },
  { code: 'HO0490', label: 'Endorsement HO 04 90', detail: 'Ordinance or Law' },
  { code: 'HO0441', label: 'Endorsement HO 04 41', detail: 'Limited Mold' },
];

const STATUS_BADGE: Record<
  LineStatus,
  { className: string; icon: string; label: string }
> = {
  PENDING: {
    className:
      'border border-border bg-muted text-muted-foreground',
    icon: '⬜',
    label: 'Pending',
  },
  COVERED: {
    className:
      'border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300',
    icon: '✅',
    label: 'Covered',
  },
  PARTIALLY_COVERED: {
    className:
      'border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300',
    icon: '◐',
    label: 'Partially covered',
  },
  EXCLUDED: {
    className:
      'border border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300',
    icon: '❌',
    label: 'Excluded',
  },
  NEEDS_REVIEW: {
    className:
      'border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300',
    icon: '⚠️',
    label: 'Needs review',
  },
};

type CoverageLine = { code?: string; status?: string } | undefined;

const VALID_STATUSES = new Set<LineStatus>([
  'COVERED',
  'PARTIALLY_COVERED',
  'EXCLUDED',
  'NEEDS_REVIEW',
]);

function resolveStatus(
  lines: ReadonlyArray<CoverageLine> | undefined,
  code: LineCode,
): LineStatus {
  if (!lines) return 'PENDING';
  const match = lines.find((l) => l?.code === code);
  if (!match?.status) return 'PENDING';
  return VALID_STATUSES.has(match.status as LineStatus)
    ? (match.status as LineStatus)
    : 'PENDING';
}

export function CoverageScaffold({
  lines,
}: {
  lines?: ReadonlyArray<CoverageLine>;
}) {
  const hasLines = !!lines && lines.length > 0;
  return (
    <div className="flex flex-col gap-3">
      {hasLines ? null : (
        <p className="text-sm italic text-muted-foreground">
          Coverage position will populate when the analysis runs.
        </p>
      )}
      <ul className="flex flex-col divide-y rounded-md border bg-card">
        {ROWS.map((row) => {
          const status = resolveStatus(lines, row.code);
          const badge = STATUS_BADGE[status];
          return (
            <li
              key={row.code}
              className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium leading-tight">
                  {row.label}
                </span>
                <span className="text-xs text-muted-foreground">{row.detail}</span>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  badge.className,
                )}
              >
                <span aria-hidden>{badge.icon}</span>
                {badge.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

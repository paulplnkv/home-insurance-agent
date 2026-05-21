import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/scenario/claim';

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
  {
    variant: 'secondary' | 'default' | 'destructive' | 'outline';
    icon: string;
    label: string;
  }
> = {
  PENDING: { variant: 'secondary', icon: '⬜', label: 'Pending' },
  COVERED: { variant: 'default', icon: '✅', label: 'Covered' },
  PARTIALLY_COVERED: {
    variant: 'secondary',
    icon: '◐',
    label: 'Partially covered',
  },
  EXCLUDED: { variant: 'destructive', icon: '❌', label: 'Excluded' },
  NEEDS_REVIEW: { variant: 'destructive', icon: '⚠️', label: 'Needs review' },
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
              <Badge variant={badge.variant} className="gap-1 font-normal">
                <span aria-hidden>{badge.icon}</span>
                {badge.label}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

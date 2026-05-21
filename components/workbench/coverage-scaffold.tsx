import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/scenario/claim';

type ScaffoldRow = {
  label: string;
  detail: string;
};

const ROWS: ReadonlyArray<ScaffoldRow> = [
  { label: 'Coverage A — Dwelling', detail: formatCurrency(480_000) },
  { label: 'Coverage B — Other Structures', detail: formatCurrency(48_000) },
  { label: 'Coverage C — Personal Property', detail: formatCurrency(240_000) },
  { label: 'Coverage D — Loss of Use', detail: formatCurrency(96_000) },
  { label: 'Endorsement HE-7', detail: 'Wind/Hail % Deductible' },
  { label: 'Endorsement HO 04 90', detail: 'Ordinance or Law' },
  { label: 'Endorsement HO 04 41', detail: 'Limited Mold' },
];

export function CoverageScaffold() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm italic text-muted-foreground">
        Coverage position will populate when the analysis runs.
      </p>
      <ul className="flex flex-col divide-y rounded-md border bg-card">
        {ROWS.map((row) => (
          <li
            key={row.label}
            className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium leading-tight">
                {row.label}
              </span>
              <span className="text-xs text-muted-foreground">{row.detail}</span>
            </div>
            <Badge variant="secondary" className="gap-1 font-normal">
              <span aria-hidden>⬜</span>
              Pending
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

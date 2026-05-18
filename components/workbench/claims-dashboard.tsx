import { Card } from '@/components/ui/card';
import { ClaimRow } from '@/components/workbench/claim-row';
import {
  DASHBOARD_CLAIMS,
  type ClaimStatus,
} from '@/lib/scenario/dashboard-claims';

const CLOSED_STATUSES: ReadonlySet<ClaimStatus> = new Set([
  'Closed',
  'Denied',
  'Approved',
]);

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

export function ClaimsDashboard() {
  const openClaims = DASHBOARD_CLAIMS.filter(
    (c) => !CLOSED_STATUSES.has(c.status),
  );
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
            {openClaims.length} open claims · Updated {today}
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

      <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 text-left font-medium">Claim #</th>
                <th className="px-4 py-2 text-left font-medium">Insured</th>
                <th className="px-4 py-2 text-left font-medium">
                  Loss address
                </th>
                <th className="px-4 py-2 text-left font-medium">Peril</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">
                  Date of loss
                </th>
                <th className="px-4 py-2 text-right font-medium">Coverage A</th>
                <th className="px-6 py-2 text-left font-medium">Adjuster</th>
              </tr>
            </thead>
            <tbody>
              {DASHBOARD_CLAIMS.map((claim) => (
                <ClaimRow key={claim.claim_number} claim={claim} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

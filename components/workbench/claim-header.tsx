import { ExternalLinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  CLAIM,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '@/lib/scenario/claim';

const POLICY_PDF_URL = '/documents/policy-ho3.pdf';

function Field({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-foreground underline-offset-2 hover:underline"
        >
          {value}
          <ExternalLinkIcon className="size-3 text-muted-foreground" />
        </a>
      ) : (
        <span className="text-sm font-medium text-foreground">{value}</span>
      )}
    </div>
  );
}

export function ClaimHeader() {
  const windHailPct = `${(CLAIM.policy.deductibles.wind_hail_pct * 100).toFixed(0)}%`;
  const aopDeductible = formatCurrency(CLAIM.policy.deductibles.aop_standard);
  const coverageA = formatCurrency(CLAIM.policy.coverage_a_dwelling);

  return (
    <header className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Claim
          </span>
          <h1 className="text-lg font-semibold leading-tight">
            {CLAIM.claim_number} · {CLAIM.insured.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {CLAIM.insured.address}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary">{CLAIM.status}</Badge>
          <span className="text-xs text-muted-foreground">
            Adjuster: {CLAIM.adjuster.name}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-4 md:grid-cols-5">
        <Field
          label="Policy form"
          value={`${CLAIM.policy.form} · Coverage A ${coverageA}`}
          href={POLICY_PDF_URL}
        />
        <Field
          label="Deductibles"
          value={`AOP ${aopDeductible} · Wind/Hail ${windHailPct}`}
        />
        <Field label="Peril" value={CLAIM.loss.peril} />
        <Field
          label="Date of loss"
          value={formatDate(CLAIM.loss.date_of_loss)}
        />
        <Field
          label="FNOL filed"
          value={formatDateTime(CLAIM.loss.fnol_filed_at)}
        />
      </div>
    </header>
  );
}

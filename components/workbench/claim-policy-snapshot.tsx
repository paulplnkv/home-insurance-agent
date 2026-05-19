import { BuildingIcon, FileTextIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Field } from './field';
import { CLAIM, formatCurrency, formatDate } from '@/lib/scenario/claim';

const POLICY_PDF_URL = '/documents/policy-ho3.pdf';

export function ClaimPolicySnapshot() {
  const { coverage_a_dwelling, deductibles } = CLAIM.policy;
  const aop = formatCurrency(deductibles.aop_standard);
  const windHailPct = `${(deductibles.wind_hail_pct * 100).toFixed(0)}%`;
  const windHailDollar = formatCurrency(
    Math.round(coverage_a_dwelling * deductibles.wind_hail_pct),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base">Policy snapshot</CardTitle>
        <a
          href={POLICY_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <FileTextIcon className="size-3.5" />
          Open policy PDF
        </a>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pb-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
          <Field label="Policy number" value={CLAIM.policy.number} />
          <Field label="Form" value={CLAIM.policy.form} />
          <Field
            label="Effective"
            value={formatDate(CLAIM.policy.effective_date)}
          />
          <Field
            label="Expiration"
            value={formatDate(CLAIM.policy.expiration_date)}
          />
          <Field
            label="Coverage A — Dwelling"
            value={formatCurrency(coverage_a_dwelling)}
          />
          <Field label="Deductible · AOP" value={aop} />
          <Field
            label="Deductible · Wind/Hail"
            value={`${windHailPct} (${windHailDollar})`}
          />
          <Field label="In-force at DOL" value="Yes" />
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Mortgagee
          </span>
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground"
            >
              <BuildingIcon className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {CLAIM.policy.mortgagee.lender}
              </span>
              <span className="text-xs text-muted-foreground">
                Loan #{CLAIM.policy.mortgagee.loan_number} · Loss payee on file
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

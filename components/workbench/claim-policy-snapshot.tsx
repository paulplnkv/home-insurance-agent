import { BuildingIcon, ExternalLinkIcon } from 'lucide-react';
import { CLAIM, formatCurrency, formatDate } from '@/lib/scenario/claim';
import { FieldTile, SectionCard, SectionTitle } from './section-card';

const POLICY_PDF_URL = '/documents/policy-ho3.pdf';

export function ClaimPolicySnapshot() {
  const { coverage_a_dwelling, deductibles, endorsements } = CLAIM.policy;
  const aop = formatCurrency(deductibles.aop_standard);
  const windHailPct = `${(deductibles.wind_hail_pct * 100).toFixed(0)}%`;
  const windHailDollar = formatCurrency(
    Math.round(coverage_a_dwelling * deductibles.wind_hail_pct),
  );

  return (
    <SectionCard>
      <div className="flex items-center justify-between">
        <SectionTitle>Policy snapshot</SectionTitle>
        <a
          href={POLICY_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[14px] text-[var(--brand-blue)] hover:underline"
        >
          <ExternalLinkIcon className="size-4" />
          Open PDF
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <FieldTile label="POLICY NUMBER" value={CLAIM.policy.number} />
        <FieldTile label="FORM" value={CLAIM.policy.form} />
        <FieldTile
          label="EFFECTIVE"
          value={formatDate(CLAIM.policy.effective_date)}
        />
        <FieldTile
          label="EXPIRATION"
          value={formatDate(CLAIM.policy.expiration_date)}
        />
        <FieldTile
          label="COVERAGE A — DWELLING"
          value={formatCurrency(coverage_a_dwelling)}
        />
        <FieldTile label="DEDUCTIBLE · AOP" value={aop} />
        <FieldTile
          label="DEDUCTIBLE · WIND/HAIL"
          value={`${windHailPct} (${windHailDollar})`}
        />
        <FieldTile label="IN-FORCE AT DOL" value="Yes" />
      </div>

      <div className="h-px bg-[var(--line-soft)]" />

      <div className="flex flex-col gap-2">
        <span className="text-[14px] text-[var(--ink)]">ENDORSEMENTS</span>
        <span className="text-[16px] font-semibold text-[var(--ink)]">
          {endorsements.map((e) => `${e.code} · ${e.name}`).join('  |  ')}
        </span>
      </div>

      <div className="h-px bg-[var(--line-soft)]" />

      <div className="flex flex-col gap-3">
        <span className="text-[14px] text-[var(--ink)]">MORTGAGEE</span>
        <div className="flex items-center gap-4">
          <div
            aria-hidden
            className="flex size-[71px] shrink-0 items-center justify-center rounded-full border border-[var(--line-soft)] bg-[#edf3ff] text-[var(--brand-blue)]"
          >
            <BuildingIcon className="size-6" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[16px] font-semibold text-[var(--ink)]">
              {CLAIM.policy.mortgagee.lender}
            </span>
            <span className="text-[14px] text-[var(--ink)]">
              Loan #{CLAIM.policy.mortgagee.loan_number} · Loss payee on file
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

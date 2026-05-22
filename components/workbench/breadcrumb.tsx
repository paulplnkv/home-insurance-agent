import { CLAIM } from '@/lib/scenario/claim';

export function Breadcrumb() {
  const nameParts = CLAIM.insured.name.split(' ');
  const last = nameParts[nameParts.length - 1];
  const first = nameParts.slice(0, -1).join(' ');
  const formatted = last ? `${last}, ${first}` : CLAIM.insured.name;

  return (
    <p className="text-[14px] text-[var(--ink)]">
      Claims <span className="text-[var(--ink)]">›</span> Open files{' '}
      <span className="text-[var(--ink)]">›</span>{' '}
      <span className="text-[var(--ink-soft)]">
        {CLAIM.claim_number} · {formatted}
      </span>
    </p>
  );
}

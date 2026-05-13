import { CLAIM } from '@/lib/scenario/claim';

export function Breadcrumb() {
  // "Chen, Maria" — last-first order is the CMS convention.
  const nameParts = CLAIM.insured.name.split(' ');
  const last = nameParts[nameParts.length - 1];
  const first = nameParts.slice(0, -1).join(' ');
  const formatted = last ? `${last}, ${first}` : CLAIM.insured.name;

  return (
    <div className="bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-2 text-xs text-muted-foreground">
        Claims <span className="px-1">›</span> Open files{' '}
        <span className="px-1">›</span>
        <span className="text-foreground">
          {CLAIM.claim_number} · {formatted}
        </span>
      </div>
    </div>
  );
}

// Single source of truth for the demo's hardcoded claim. Per PRD §
// "One unified hailstorm claim drives everything."

export const CLAIM = {
  claim_number: 'HO-2026-04-04217',
  status: 'In Investigation' as const,
  insured: {
    name: 'Maria Chen',
    address: '4521 Oak Ridge Dr, Plano TX 75024',
  },
  policy: {
    form: 'HO-3',
    coverage_a_dwelling: 480_000,
    deductibles: {
      aop_standard: 1_000,
      wind_hail_pct: 0.02,
    },
  },
  loss: {
    peril: 'Hailstorm',
    date_of_loss: '2026-04-22',
    fnol_filed_at: '2026-04-23T09:14:00-05:00',
  },
  adjuster: {
    name: 'Maria Wells',
  },
} as const;

export type Claim = typeof CLAIM;

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })} ${d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`;
}

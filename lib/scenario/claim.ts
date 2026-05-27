// Single source of truth for the demo's hardcoded claim. Per PRD §
// "One unified hailstorm claim drives everything."

export const CLAIM = {
  claim_number: 'HO-2026-04-04217',
  status: 'In Investigation' as const,
  insured: {
    name: 'Maria Chen',
    address: '4521 Oak Ridge Dr, Plano TX 75024',
    phone: '+1 (469) 555-0182',
    email: 'maria.chen@gmail.com',
    preferred_contact: 'Phone' as 'SMS' | 'Email' | 'Phone',
  },
  policy: {
    number: 'PSM-HO-7842113',
    form: 'HO-3',
    effective_date: '2025-08-01',
    expiration_date: '2026-08-01',
    coverage_a_dwelling: 480_000,
    coverage_b_other_structures: 48_000,
    coverage_c_personal_property: 240_000,
    coverage_d_loss_of_use: 96_000,
    deductibles: {
      aop_standard: 1_000,
      wind_hail_pct: 0.02,
    },
    endorsements: [
      { code: 'HE-7', name: 'Wind/Hail % Deductible' },
      { code: 'HO 04 90', name: 'Ordinance or Law' },
      { code: 'HO 04 41', name: 'Limited Mold' },
    ],
    mortgagee: {
      lender: 'Frost Bank, NA',
      loan_number: '0042-118937',
    },
  },
  loss: {
    peril: 'Hailstorm',
    date_of_loss: '2026-05-25',
    fnol_filed_at: '2026-05-26T14:14:00-05:00',
    location_state: 'TX',
    description:
      'Severe hailstorm with reported 1.75" stones swept across Collin County the afternoon of May 25. Insured reports impact dents across roof shingles, bent gutters on the north elevation, and cracked skylight glass.',
    cat_event: 'TX Hail Event May 2026 · CAT-2026-031',
  },
  adjuster: {
    name: 'Maria Wells',
    phone: '+1 (214) 555-2814',
    email: 'maria.wells@pacificstatesmutual.com',
    team: 'Property · North TX',
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

const LOSS_TZ_OFFSET = '-05:00';

function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}

export function dateOffsetFromLoss(offsetDays: number): string {
  const [y, m, d] = CLAIM.loss.date_of_loss.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function timestampOffsetFromLoss(
  offsetDays: number,
  time: string,
): string {
  return `${dateOffsetFromLoss(offsetDays)}T${time}${LOSS_TZ_OFFSET}`;
}

export function lossDateUsSlash(): string {
  const [y, m, d] = CLAIM.loss.date_of_loss.split('-');
  return `${m}/${d}/${y}`;
}

export function lossDateMonthOrdinal(): string {
  const [y, m, d] = CLAIM.loss.date_of_loss.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const month = dt
    .toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
    .toLowerCase();
  return `${month} ${d}${ordinalSuffix(d)}`;
}


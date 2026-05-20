import { CLAIM } from './claim';

export type ClaimStatus =
  | 'New'
  | 'In Investigation'
  | 'Pending Review'
  | 'In Adjustment'
  | 'Approved'
  | 'Closed'
  | 'Denied';

export const STATUS_ORDER: readonly ClaimStatus[] = [
  'New',
  'In Investigation',
  'Pending Review',
  'In Adjustment',
  'Approved',
  'Closed',
  'Denied',
] as const;

export const OPEN_STATUSES: ReadonlySet<ClaimStatus> = new Set([
  'New',
  'In Investigation',
  'Pending Review',
  'In Adjustment',
]);

export const REAL_CLAIM_AGENT_KEYS = {
  coverage: 'home-ins:coverage:v3',
  damage: 'home-ins:damage:v4',
  documents: 'home-ins:documents:v3',
} as const;

export function daysSinceLoss(
  dateOfLoss: string,
  asOf: Date = new Date(),
): number {
  const loss = new Date(`${dateOfLoss}T00:00:00`);
  const ms = asOf.getTime() - loss.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export type ClaimSummary = {
  claim_number: string;
  insured_name: string;
  loss_address: string;
  peril: string;
  status: ClaimStatus;
  date_of_loss: string;
  coverage_a: number;
  adjuster_name: string;
  reserve_working: number | null;
  cat_event: string | null;
  is_real: boolean;
};

const CHEN_ROW: ClaimSummary = {
  claim_number: CLAIM.claim_number,
  insured_name: CLAIM.insured.name,
  loss_address: CLAIM.insured.address,
  peril: CLAIM.loss.peril,
  status: CLAIM.status,
  date_of_loss: CLAIM.loss.date_of_loss,
  coverage_a: CLAIM.policy.coverage_a_dwelling,
  adjuster_name: CLAIM.adjuster.name,
  reserve_working: 22_000,
  cat_event: 'CAT-2026-022 · TX Hail Event Apr 2026',
  is_real: true,
};

const MOCK_ROWS: Omit<ClaimSummary, 'is_real'>[] = [
  {
    claim_number: 'HO-2026-05-04412',
    insured_name: 'David Rodriguez',
    loss_address: '218 Pecan Hollow Ln, Frisco TX 75033',
    peril: 'Wind',
    status: 'New',
    date_of_loss: '2026-05-11',
    coverage_a: 365_000,
    adjuster_name: 'Maria Wells',
    reserve_working: null,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-04-04188',
    insured_name: 'Sarah Patel',
    loss_address: '7714 Bluebonnet Trl, Round Rock TX 78664',
    peril: 'Water (non-flood)',
    status: 'In Investigation',
    date_of_loss: '2026-04-18',
    coverage_a: 295_000,
    adjuster_name: 'James Okafor',
    reserve_working: 18_500,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-04-04201',
    insured_name: 'Robert Nguyen',
    loss_address: '1102 Cedar Ridge Cir, Sugar Land TX 77479',
    peril: 'Hailstorm',
    status: 'Pending Review',
    date_of_loss: '2026-04-22',
    coverage_a: 612_000,
    adjuster_name: 'Maria Wells',
    reserve_working: 41_300,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-04-04153',
    insured_name: 'Jennifer Brooks',
    loss_address: '3408 Magnolia Bend Dr, The Woodlands TX 77381',
    peril: 'Tree fall',
    status: 'Pending Review',
    date_of_loss: '2026-04-09',
    coverage_a: 525_000,
    adjuster_name: 'Linda Park',
    reserve_working: 73_500,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-04-04122',
    insured_name: 'Michael Alvarez',
    loss_address: '910 Sage Creek Pkwy, Allen TX 75002',
    peril: 'Frozen pipe',
    status: 'In Adjustment',
    date_of_loss: '2026-04-04',
    coverage_a: 410_000,
    adjuster_name: 'James Okafor',
    reserve_working: 31_700,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-04-04089',
    insured_name: 'Emily Thompson',
    loss_address: '5601 Stone Brook Dr, Katy TX 77494',
    peril: 'Fire',
    status: 'In Adjustment',
    date_of_loss: '2026-04-02',
    coverage_a: 820_000,
    adjuster_name: 'Maria Wells',
    reserve_working: 184_500,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-03-03987',
    insured_name: 'Carlos Mendoza',
    loss_address: '2245 Oak Park Blvd, San Antonio TX 78248',
    peril: 'Hailstorm',
    status: 'Approved',
    date_of_loss: '2026-03-27',
    coverage_a: 348_000,
    adjuster_name: 'Linda Park',
    reserve_working: 28_650,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-03-03842',
    insured_name: 'Olivia Chen',
    loss_address: '1430 Heritage Oaks Ln, Southlake TX 76092',
    peril: 'Theft',
    status: 'Closed',
    date_of_loss: '2026-03-14',
    coverage_a: 715_000,
    adjuster_name: 'James Okafor',
    reserve_working: 41_200,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-03-03801',
    insured_name: 'Marcus Williams',
    loss_address: '628 Willow Bend St, Garland TX 75044',
    peril: 'Water (non-flood)',
    status: 'Denied',
    date_of_loss: '2026-03-08',
    coverage_a: 242_000,
    adjuster_name: 'Linda Park',
    reserve_working: null,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-05-04458',
    insured_name: 'Hannah Schultz',
    loss_address: '1812 Trailwood Ave, McKinney TX 75070',
    peril: 'Lightning',
    status: 'New',
    date_of_loss: '2026-05-14',
    coverage_a: 388_000,
    adjuster_name: 'James Okafor',
    reserve_working: null,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-05-04471',
    insured_name: 'Trevor Bauer',
    loss_address: '4406 Lakeside Vw, Flower Mound TX 75028',
    peril: 'Hailstorm',
    status: 'New',
    date_of_loss: '2026-05-15',
    coverage_a: 472_000,
    adjuster_name: 'Maria Wells',
    reserve_working: null,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-05-04305',
    insured_name: 'Priya Singh',
    loss_address: '903 Live Oak Ct, Pearland TX 77584',
    peril: 'Wind',
    status: 'In Investigation',
    date_of_loss: '2026-05-02',
    coverage_a: 535_000,
    adjuster_name: 'Linda Park',
    reserve_working: 14_200,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-04-04244',
    insured_name: 'Daniel Foster',
    loss_address: '7290 Crestview Dr, Plano TX 75093',
    peril: 'Smoke',
    status: 'In Investigation',
    date_of_loss: '2026-04-26',
    coverage_a: 458_000,
    adjuster_name: 'James Okafor',
    reserve_working: 9_800,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-04-04175',
    insured_name: 'Rachel Kim',
    loss_address: '511 Briarcliff Way, Richardson TX 75080',
    peril: 'Tree fall',
    status: 'Pending Review',
    date_of_loss: '2026-04-16',
    coverage_a: 322_000,
    adjuster_name: 'Maria Wells',
    reserve_working: 26_400,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-04-04147',
    insured_name: 'Benjamin Cole',
    loss_address: '2018 Hidden Creek Ln, Austin TX 78731',
    peril: 'Hailstorm',
    status: 'Pending Review',
    date_of_loss: '2026-04-12',
    coverage_a: 668_000,
    adjuster_name: 'Linda Park',
    reserve_working: 38_900,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-04-04101',
    insured_name: 'Sofia Hernandez',
    loss_address: '3733 Vineyard Hill Rd, El Paso TX 79935',
    peril: 'Wind',
    status: 'In Adjustment',
    date_of_loss: '2026-04-06',
    coverage_a: 286_000,
    adjuster_name: 'Maria Wells',
    reserve_working: 12_300,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-03-03952',
    insured_name: 'Andrew Park',
    loss_address: '6122 Dove Meadow Dr, Lewisville TX 75067',
    peril: 'Fire',
    status: 'Approved',
    date_of_loss: '2026-03-22',
    coverage_a: 555_000,
    adjuster_name: 'James Okafor',
    reserve_working: 96_400,
    cat_event: null,
  },
  {
    claim_number: 'HO-2026-03-03877',
    insured_name: 'Leah Bennett',
    loss_address: '4087 Sunset Ridge Dr, Tyler TX 75703',
    peril: 'Frozen pipe',
    status: 'Closed',
    date_of_loss: '2026-03-17',
    coverage_a: 304_000,
    adjuster_name: 'Maria Wells',
    reserve_working: 8_900,
    cat_event: null,
  },
];

const statusRank = (s: ClaimStatus) => STATUS_ORDER.indexOf(s);

export const DASHBOARD_CLAIMS: ClaimSummary[] = [
  CHEN_ROW,
  ...MOCK_ROWS.map((row) => ({ ...row, is_real: false })),
].sort((a, b) => {
  const r = statusRank(a.status) - statusRank(b.status);
  if (r !== 0) return r;
  return a.date_of_loss < b.date_of_loss ? 1 : -1;
});

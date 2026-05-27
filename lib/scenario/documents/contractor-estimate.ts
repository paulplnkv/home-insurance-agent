import { dateOffsetFromLoss, lossDateUsSlash } from '../claim';

// Estimate prepared 3 days after the loss; valid for 30 days from
// preparation. Scope narrative cites the loss date in US slash format
// (e.g. "04/22/2026").
const DATE_PREPARED = dateOffsetFromLoss(3);
const VALID_THROUGH = dateOffsetFromLoss(33);
const LOSS_DATE_SLASH = lossDateUsSlash();

const contractorEstimate = {
  id: 'contractor-estimate',
  kind: 'contractor_estimate',
  title: 'Contractor Estimate — Lone Star Premier Roofing',
  filename: 'LonestarPremier_Estimate_Chen.pdf',
  metadata: {
    claim_number: 'HO-2026-04-04217',
    estimate_number: 'LSP-2026-04217',
    prepared_for: 'Maria Chen',
    property_address: '4521 Oak Ridge Dr, Plano TX 75024',
    contractor: 'Lone Star Premier Roofing, LLC',
    contractor_address: '1305 Custer Pkwy Ste 210, Richardson TX 75080',
    contractor_license: 'TX-RCC-44218',
    contractor_phone: '(972) 555-0188',
    contact: 'Brett Halverson, Sr. Estimator',
    date_prepared: DATE_PREPARED,
    estimate_software: 'Xactimate-style',
    scope_summary:
      'Full roof replacement (all slopes), full gutter system replacement, skylight replacement, interior drywall repair under skylight.',
  },
  scope_narrative: `Property sustained widespread hail impact across all roof slopes during the ${LOSS_DATE_SLASH} hail event. Recommend full tear-off and replacement of all asphalt composition shingles per manufacturer warranty requirements. Front and rear gutter runs show denting consistent with hail and require replacement to restore matching aluminum profile. Kitchen skylight cracked at glazing — replace unit and reframe as needed. Interior drywall under skylight shows water staining and requires R&R plus paint.`,
  line_items: [
    { code: 'RFG 240S', description: 'Tear off composition shingles — all slopes', qty: 32, unit: 'SQ', unit_price: 75.0, extended: 2400.0 },
    { code: 'RFG 240A', description: 'Asphalt composition shingles — laminated, all slopes (RCV)', qty: 32, unit: 'SQ', unit_price: 280.0, extended: 8960.0 },
    { code: 'RFG UNDR', description: 'Synthetic underlayment — full deck', qty: 32, unit: 'SQ', unit_price: 32.0, extended: 1024.0 },
    { code: 'RFG IWS', description: 'Ice & water shield — eaves & valleys', qty: 8, unit: 'SQ', unit_price: 95.0, extended: 760.0 },
    { code: 'RFG FLSHG', description: 'Drip edge & step flashing — replace all', qty: 220, unit: 'LF', unit_price: 4.2, extended: 924.0 },
    { code: 'GTR 5KAL', description: 'Aluminum gutter — 5" K-style — full system replacement', qty: 180, unit: 'LF', unit_price: 11.5, extended: 2070.0 },
    { code: 'GTR DSPT', description: 'Aluminum downspouts — 3x4 — replace all', qty: 60, unit: 'LF', unit_price: 9.5, extended: 570.0 },
    { code: 'SKY 24x48', description: 'Skylight — fixed glass 24x48 — R&R unit incl. flashing kit', qty: 1, unit: 'EA', unit_price: 1480.0, extended: 1480.0 },
    { code: 'DRY 1/2', description: 'Drywall 1/2" under skylight — R&R, tape & float, prime', qty: 96, unit: 'SF', unit_price: 4.2, extended: 403.2 },
    { code: 'PNT INT', description: 'Interior paint — 2 coats, ceiling, kitchen', qty: 96, unit: 'SF', unit_price: 1.8, extended: 172.8 },
    { code: 'DBR HAUL', description: 'Debris haul-off & disposal', qty: 1, unit: 'EA', unit_price: 525.0, extended: 525.0 },
    { code: 'OHP O&P', description: 'Overhead & profit (10% / 10%)', qty: 1, unit: 'EA', unit_price: 551.0, extended: 551.0 },
  ],
  totals: {
    subtotal_rcv: 19840.0,
    deposit_required: 4960.0,
    balance_on_completion: 14880.0,
    valid_through: VALID_THROUGH,
  },
  notes:
    'Bid is contingent on insurance approval. Lone Star Premier Roofing will work directly with the carrier on supplements. Workmanship warranty: 5 years. Manufacturer warranty: 30 years (limited).',
  signature_block: {
    signed_by: 'Brett Halverson',
    signed_title: 'Sr. Estimator',
    signed_date: DATE_PREPARED,
  },
} as const;

export default contractorEstimate;

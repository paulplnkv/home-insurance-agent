// Curated Xactimate line-item catalog used by the Damage agent. The LLM
// picks {selector, quantity} from this catalog per zone; description,
// unit, unit price, and category are looked up here. Pricing reflects
// 2026 Plano TX (region code TXDA8X) replacement-cost values for a
// typical residential hail claim — they are plausibility-grade, not
// scraped from Verisk.

import { DAMAGE_ZONES } from '@/lib/agents/photos/schema';

export const XACT_UNITS = ['SQ', 'LF', 'SF', 'EA', 'HR'] as const;
export type XactUnit = (typeof XACT_UNITS)[number];

export const XACT_CATEGORIES = [
  'RFG',
  'GUTTER',
  'SKLT',
  'EXT',
  'MECH',
  'INT',
  'DMO',
  'GENERAL',
] as const;
export type XactCategory = (typeof XACT_CATEGORIES)[number];

export interface XactCatalogEntry {
  selector: string;
  description: string;
  unit: XactUnit;
  unit_price: number;
  category: XactCategory;
}

// Roofing, gutter, skylight, exterior cladding, openings, mechanical,
// interior, demolition. Prices in USD.
export const XACT_CATALOG: readonly XactCatalogEntry[] = [
  // Roof — composition shingle replacement
  {
    selector: 'RFG 240S',
    description: 'Laminated - comp. shingle rfg. - w/ felt',
    unit: 'SQ',
    unit_price: 312.0,
    category: 'RFG',
  },
  {
    selector: 'RFG UNDLAY',
    description: 'Roofing felt - synthetic underlayment',
    unit: 'SQ',
    unit_price: 42.0,
    category: 'RFG',
  },
  {
    selector: 'RFG RIDGC',
    description: 'Ridge cap - composition shingles',
    unit: 'LF',
    unit_price: 4.85,
    category: 'RFG',
  },
  {
    selector: 'RFG IWS',
    description: 'Ice & water shield',
    unit: 'SF',
    unit_price: 1.65,
    category: 'RFG',
  },
  {
    selector: 'RFG VENT',
    description: 'Roof vent - turtle type - metal',
    unit: 'EA',
    unit_price: 48.5,
    category: 'RFG',
  },
  {
    selector: 'RFG FLREP',
    description: 'Flashing - pipe jack',
    unit: 'EA',
    unit_price: 42.0,
    category: 'RFG',
  },
  {
    selector: 'RFG STMETAL',
    description: 'Step flashing',
    unit: 'LF',
    unit_price: 8.2,
    category: 'RFG',
  },
  {
    selector: 'RFG DRIPEDGE',
    description: 'Drip edge',
    unit: 'LF',
    unit_price: 2.85,
    category: 'RFG',
  },
  // Roof — demolition
  {
    selector: 'DMO TRSHEET',
    description: 'Tear off composition shingles (per layer)',
    unit: 'SQ',
    unit_price: 58.0,
    category: 'DMO',
  },
  {
    selector: 'DMO HAUL',
    description: 'Dumpster load - approx. 30 yards, debris haul',
    unit: 'EA',
    unit_price: 640.0,
    category: 'DMO',
  },
  // Gutters
  {
    selector: 'GUTTER 6A',
    description: 'Gutter / downspout - aluminum - 5" K-style',
    unit: 'LF',
    unit_price: 9.85,
    category: 'GUTTER',
  },
  {
    selector: 'GUTTER DSP',
    description: 'Downspout - aluminum - 3" x 4"',
    unit: 'LF',
    unit_price: 11.2,
    category: 'GUTTER',
  },
  {
    selector: 'GUTTER GUARD',
    description: 'Gutter guard / screen',
    unit: 'LF',
    unit_price: 7.5,
    category: 'GUTTER',
  },
  {
    selector: 'GUTTER DR',
    description: 'Detach & reset gutter',
    unit: 'LF',
    unit_price: 3.2,
    category: 'GUTTER',
  },
  // Soffit & fascia
  {
    selector: 'SOFFIT VINYL',
    description: 'Soffit - vinyl - vented',
    unit: 'LF',
    unit_price: 8.95,
    category: 'EXT',
  },
  {
    selector: 'FASCIA AL',
    description: 'Fascia - aluminum wrap on wood, 6"',
    unit: 'LF',
    unit_price: 7.4,
    category: 'EXT',
  },
  // Skylight
  {
    selector: 'SKLT MED',
    description: 'Skylight - medium size - replace',
    unit: 'EA',
    unit_price: 865.0,
    category: 'SKLT',
  },
  {
    selector: 'SKLT FL',
    description: 'Skylight flashing kit',
    unit: 'EA',
    unit_price: 185.0,
    category: 'SKLT',
  },
  {
    selector: 'SKLT DOME',
    description: 'Skylight dome only - acrylic',
    unit: 'EA',
    unit_price: 410.0,
    category: 'SKLT',
  },
  // Exterior cladding (siding) & openings
  {
    selector: 'EXT VINYL',
    description: 'Vinyl siding - replace panel',
    unit: 'SF',
    unit_price: 6.85,
    category: 'EXT',
  },
  {
    selector: 'EXT GDR',
    description: 'Garage door panel - steel - replace',
    unit: 'EA',
    unit_price: 420.0,
    category: 'EXT',
  },
  {
    selector: 'EXT WIN SCRN',
    description: 'Window screen - re-screen / replace',
    unit: 'EA',
    unit_price: 65.0,
    category: 'EXT',
  },
  // Mechanical — HVAC condenser hail damage
  {
    selector: 'MECH ACFIN',
    description: 'HVAC condenser fin comb / straighten',
    unit: 'HR',
    unit_price: 95.0,
    category: 'MECH',
  },
  // Interior — drywall & paint (water-stain repair under skylight)
  {
    selector: 'INT DWR',
    description: 'Drywall patch - small to medium hole, finish + texture',
    unit: 'SF',
    unit_price: 5.25,
    category: 'INT',
  },
  {
    selector: 'INT PNT',
    description: 'Paint ceiling - two coats',
    unit: 'SF',
    unit_price: 1.45,
    category: 'INT',
  },
  // General labor (rarely chosen, but available as fallback)
  {
    selector: 'RFG LBR',
    description: 'Roofer - per hour',
    unit: 'HR',
    unit_price: 72.0,
    category: 'GENERAL',
  },
] as const;

export const CATALOG_BY_SELECTOR: ReadonlyMap<string, XactCatalogEntry> =
  new Map(XACT_CATALOG.map((item) => [item.selector, item]));

// Per-zone candidacy: which selectors are reasonable for which zone.
// Used both to scope the LLM's prompt and to validate output downstream.
export const ZONE_CANDIDATES: Readonly<
  Record<(typeof DAMAGE_ZONES)[number], readonly string[]>
> = {
  roof_south_slope: [
    'RFG 240S',
    'RFG UNDLAY',
    'RFG RIDGC',
    'RFG IWS',
    'RFG VENT',
    'RFG FLREP',
    'RFG STMETAL',
    'RFG DRIPEDGE',
    'DMO TRSHEET',
    'DMO HAUL',
    'RFG LBR',
  ],
  roof_west_slope: [
    'RFG 240S',
    'RFG UNDLAY',
    'RFG RIDGC',
    'RFG IWS',
    'RFG VENT',
    'RFG FLREP',
    'RFG STMETAL',
    'RFG DRIPEDGE',
    'DMO TRSHEET',
    'DMO HAUL',
    'RFG LBR',
  ],
  gutter_front: ['GUTTER 6A', 'GUTTER DSP', 'GUTTER GUARD', 'GUTTER DR'],
  soffit_fascia: ['SOFFIT VINYL', 'FASCIA AL'],
  skylight_kitchen: ['SKLT MED', 'SKLT FL', 'SKLT DOME'],
  elevation_siding: ['EXT VINYL'],
  opening_garage_door: ['EXT GDR'],
  opening_window: ['EXT WIN SCRN'],
  system_hvac_exterior: ['MECH ACFIN'],
  interior_ceiling: ['INT DWR', 'INT PNT'],
  // Overview is for orientation photos only — never bills.
  property_overview: [],
};

export const ZONE_NAMES: Readonly<
  Record<(typeof DAMAGE_ZONES)[number], string>
> = {
  roof_south_slope: 'Roof - South Slope',
  roof_west_slope: 'Roof - West Slope',
  gutter_front: 'Front Gutter',
  soffit_fascia: 'Soffit & Fascia',
  skylight_kitchen: 'Kitchen Skylight',
  elevation_siding: 'Elevation - Siding',
  opening_garage_door: 'Garage Door',
  opening_window: 'Window Opening',
  system_hvac_exterior: 'HVAC Condenser (Exterior)',
  interior_ceiling: 'Interior Ceiling',
  property_overview: 'Property Overview',
};

// Pricing metadata for the estimate. Real Xactimate price lists are
// keyed by a region code + month; these mimic the format.
export const PRICE_LIST_META = {
  region: 'TXDA8X',
  effective_date: '2026-04-01',
  xactimate_version: '28.5',
} as const;

export const TAX_RATE = 0.0825; // Plano TX combined sales tax (demo)
export const OVERHEAD_RATE = 0.1; // 10%
export const PROFIT_RATE = 0.1; // 10% applied after overhead
export const DEPRECIATION_RATE = 0.15; // flat across materials lines (demo)

// Categories considered "materials" for depreciation + tax math.
// Mechanical (fin combing) and General (labor) are pure-labor lines.
export const MATERIAL_CATEGORIES: ReadonlySet<XactCategory> = new Set([
  'RFG',
  'GUTTER',
  'SKLT',
  'EXT',
  'INT',
]);

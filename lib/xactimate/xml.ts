// Pricing math and Xactimate-style XML rendering. Pure functions — no
// React. Consumed by the XactimateOutput component to derive a priced
// estimate and a downloadable .xml from the LLM's selector+quantity
// emissions plus the static claim context.

import { CLAIM, type Claim } from '@/lib/scenario/claim';
import { DAMAGE_ZONES } from '@/lib/agents/photos/schema';
import {
  CATALOG_BY_SELECTOR,
  DEPRECIATION_RATE,
  MATERIAL_CATEGORIES,
  OVERHEAD_RATE,
  PRICE_LIST_META,
  PROFIT_RATE,
  TAX_RATE,
  ZONE_NAMES,
  type XactCatalogEntry,
} from './catalog';

type ZoneCode = (typeof DAMAGE_ZONES)[number];

export interface RawLineItem {
  zone: ZoneCode;
  selector: string;
  quantity: number;
}

export interface PricedLineItem {
  zone: ZoneCode;
  catalog: XactCatalogEntry;
  quantity: number;
  rcv: number;
  depreciation: number;
  acv: number;
}

export interface PricedRoom {
  zone: ZoneCode;
  name: string;
  items: PricedLineItem[];
  subtotal_rcv: number;
}

export interface EstimateSummary {
  subtotal_rcv: number;
  sales_tax: number;
  overhead: number;
  profit: number;
  total_rcv: number;
  total_depreciation: number;
  acv: number;
  deductible: number;
  net_claim: number;
}

export interface PricedEstimate {
  rooms: PricedRoom[];
  summary: EstimateSummary;
  line_count: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Deductible: greater of AOP and (wind_hail_pct × Coverage A).
function computeDeductible(claim: Claim): number {
  const aop = claim.policy.deductibles.aop_standard;
  const windHail =
    claim.policy.deductibles.wind_hail_pct *
    claim.policy.coverage_a_dwelling;
  return Math.max(aop, windHail);
}

export function priceLineItems(
  raw: RawLineItem[],
  claim: Claim = CLAIM
): PricedEstimate {
  const priced: PricedLineItem[] = [];
  for (const item of raw) {
    const catalog = CATALOG_BY_SELECTOR.get(item.selector);
    if (!catalog) continue; // ignore items the model invented outside the catalog
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) continue;
    const rcv = round2(item.quantity * catalog.unit_price);
    const depreciation = MATERIAL_CATEGORIES.has(catalog.category)
      ? round2(rcv * DEPRECIATION_RATE)
      : 0;
    const acv = round2(rcv - depreciation);
    priced.push({
      zone: item.zone,
      catalog,
      quantity: item.quantity,
      rcv,
      depreciation,
      acv,
    });
  }

  // Group by zone, preserving DAMAGE_ZONES order for stable output.
  const byZone = new Map<ZoneCode, PricedLineItem[]>();
  for (const z of DAMAGE_ZONES) byZone.set(z, []);
  for (const li of priced) byZone.get(li.zone)?.push(li);

  const rooms: PricedRoom[] = [];
  for (const z of DAMAGE_ZONES) {
    const items = byZone.get(z) ?? [];
    if (items.length === 0) continue;
    const subtotal_rcv = round2(
      items.reduce((sum, li) => sum + li.rcv, 0)
    );
    rooms.push({ zone: z, name: ZONE_NAMES[z], items, subtotal_rcv });
  }

  const subtotal_rcv = round2(
    priced.reduce((sum, li) => sum + li.rcv, 0)
  );
  const sales_tax = round2(subtotal_rcv * TAX_RATE);
  const overhead = round2((subtotal_rcv + sales_tax) * OVERHEAD_RATE);
  const profit = round2(
    (subtotal_rcv + sales_tax + overhead) * PROFIT_RATE
  );
  const total_rcv = round2(subtotal_rcv + sales_tax + overhead + profit);
  const total_depreciation = round2(
    priced.reduce((sum, li) => sum + li.depreciation, 0)
  );
  const acv = round2(total_rcv - total_depreciation);
  const deductible = round2(computeDeductible(claim));
  const net_claim = round2(acv - deductible);

  return {
    rooms,
    summary: {
      subtotal_rcv,
      sales_tax,
      overhead,
      profit,
      total_rcv,
      total_depreciation,
      acv,
      deductible,
      net_claim,
    },
    line_count: priced.length,
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function money(n: number): string {
  return n.toFixed(2);
}

function qty(n: number): string {
  return n.toFixed(2);
}

export function renderXactimateXML(
  priced: PricedEstimate,
  claim: Claim = CLAIM
): string {
  const { summary, rooms } = priced;
  const windHailPct = (claim.policy.deductibles.wind_hail_pct * 100).toFixed(2);

  const rooms_xml = rooms
    .map((room) => {
      const items_xml = room.items
        .map(
          (li) => `      <LineItem>
        <Selector>${escapeXml(li.catalog.selector)}</Selector>
        <Description>${escapeXml(li.catalog.description)}</Description>
        <Category>${escapeXml(li.catalog.category)}</Category>
        <Quantity>${qty(li.quantity)}</Quantity>
        <Unit>${escapeXml(li.catalog.unit)}</Unit>
        <UnitPrice>${money(li.catalog.unit_price)}</UnitPrice>
        <RCV>${money(li.rcv)}</RCV>
        <Depreciation>${money(li.depreciation)}</Depreciation>
        <ACV>${money(li.acv)}</ACV>
      </LineItem>`
        )
        .join('\n');
      return `    <Room id="${escapeXml(room.zone)}" name="${escapeXml(room.name)}">
${items_xml}
      <RoomSubtotal>${money(room.subtotal_rcv)}</RoomSubtotal>
    </Room>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<XactimateEstimate version="${PRICE_LIST_META.xactimate_version}" exportedBy="Home Insurance Agent (Demo)">
  <Header>
    <ClaimNumber>${escapeXml(claim.claim_number)}</ClaimNumber>
    <Insured>
      <Name>${escapeXml(claim.insured.name)}</Name>
      <PropertyAddress>${escapeXml(claim.insured.address)}</PropertyAddress>
    </Insured>
    <Policy>
      <Form>${escapeXml(claim.policy.form)}</Form>
      <CoverageA>${money(claim.policy.coverage_a_dwelling)}</CoverageA>
      <Deductible type="AOP">${money(claim.policy.deductibles.aop_standard)}</Deductible>
      <Deductible type="WindHail" basis="percent">${windHailPct}</Deductible>
    </Policy>
    <Loss>
      <Peril>${escapeXml(claim.loss.peril)}</Peril>
      <DateOfLoss>${escapeXml(claim.loss.date_of_loss)}</DateOfLoss>
    </Loss>
    <Adjuster>${escapeXml(claim.adjuster.name)}</Adjuster>
    <PriceList region="${PRICE_LIST_META.region}" effectiveDate="${PRICE_LIST_META.effective_date}"/>
  </Header>
  <Scope>
${rooms_xml}
  </Scope>
  <Summary>
    <SubtotalLineItems>${money(summary.subtotal_rcv)}</SubtotalLineItems>
    <SalesTax rate="${(TAX_RATE * 100).toFixed(3)}">${money(summary.sales_tax)}</SalesTax>
    <Overhead rate="${(OVERHEAD_RATE * 100).toFixed(2)}">${money(summary.overhead)}</Overhead>
    <Profit rate="${(PROFIT_RATE * 100).toFixed(2)}">${money(summary.profit)}</Profit>
    <RCV>${money(summary.total_rcv)}</RCV>
    <Depreciation>${money(summary.total_depreciation)}</Depreciation>
    <ACV>${money(summary.acv)}</ACV>
    <Deductible>${money(summary.deductible)}</Deductible>
    <NetClaim>${money(summary.net_claim)}</NetClaim>
  </Summary>
</XactimateEstimate>
`;
}

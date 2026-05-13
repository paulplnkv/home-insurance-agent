import { z } from 'zod';

// DamageAgentOutput — the contract between the Damage Assessment agent
// and the Damage Assessment panel. The agent produces classifications,
// zone groupings, and peril consistency only — no dollar figures.

export const PHOTO_LABELS = [
  'hail_damage',
  'scale_reference',
  'near_duplicate',
  'unrelated',
] as const;

export const DAMAGE_ZONES = [
  'roof_south_slope',
  'roof_west_slope',
  'gutter_front',
  'skylight_kitchen',
] as const;

export const DAMAGE_SEVERITIES = ['minor', 'moderate', 'major'] as const;

export const PERIL_CONSISTENCY = [
  'consistent',
  'inconsistent',
  'inconclusive',
] as const;

export const damageAgentOutputSchema = z.object({
  classifications: z
    .array(
      z.object({
        photo_id: z
          .string()
          .describe(
            'The id from the field photo set (e.g., "roof-south-1"). Use the IDs as given.'
          ),
        label: z.enum(PHOTO_LABELS),
        confidence: z.number().min(0).max(1),
        rationale: z
          .string()
          .describe(
            'One short sentence describing what is visible in the photo and why it earned this label.'
          ),
      })
    )
    .describe('One entry per supplied photo. Cover every photo ID.'),
  zones: z
    .array(
      z.object({
        zone: z.enum(DAMAGE_ZONES),
        severity: z.enum(DAMAGE_SEVERITIES),
        evidence: z
          .string()
          .describe(
            'Photo IDs and short observations supporting this zone, e.g. "roof-south-1, roof-south-2: granule loss across mid-field; impact craters consistent with hail."'
          ),
      })
    )
    .describe(
      'Damage zones derived from the photo set. Group hail-damaged photos into the canonical zones; use one entry per zone you can support.'
    ),
  peril_consistency: z
    .enum(PERIL_CONSISTENCY)
    .describe(
      'Whether the photo evidence is consistent with the reported peril (hail). "inconclusive" when the photos lack scale or dating context to decide.'
    ),
  estimate_line_items: z
    .array(
      z.object({
        zone: z.enum(DAMAGE_ZONES),
        selector: z
          .string()
          .describe(
            'Xactimate selector code chosen verbatim from the provided catalog (e.g., "RFG 240S"). Do not invent codes.'
          ),
        quantity: z
          .number()
          .positive()
          .describe(
            'Quantity in the unit the selector specifies (SQ, LF, SF, EA, or HR). Two decimals max.'
          ),
      })
    )
    .describe(
      'Repair scope as Xactimate line items, one row per (selector, zone). The host application will join with the catalog to compute pricing, tax, O&P, depreciation, and totals — do not emit dollar amounts.'
    ),
});

export type DamageAgentOutput = z.infer<typeof damageAgentOutputSchema>;

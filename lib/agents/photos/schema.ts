import { z } from 'zod';

// DamageAgentOutput — the contract between the Damage Assessment agent
// and the Damage Assessment panel. The agent produces multi-category
// photo classifications (peril / non-peril / no-damage + material +
// component + shot type + findings), zone groupings, peril consistency,
// and Xactimate selectors. No dollar figures are emitted here.

// Eight orthogonal tag categories drawn from the homeowners adjuster
// photo taxonomy (hail-claim subset).

export const PRIMARY_CLASSIFICATIONS = ['peril', 'non_peril', 'no_damage'] as const;

export const PERIL_TAGS = [
  'hail',
  'wind',
  'debris_impact',
  'water_intrusion',
] as const;

export const NON_PERIL_TAGS = [
  'wear_and_tear',
  'deferred_maintenance',
  'mechanical_damage',
  'improper_installation',
  'rust_corrosion',
  'foot_traffic',
] as const;

export const NO_DAMAGE_TAGS = ['no_damage_confirmed', 'na_component_absent'] as const;

export const MATERIAL_TAGS = [
  'asphalt_architectural',
  'asphalt_3tab',
  'metal_galvanized',
  'aluminum',
  'vinyl_siding',
  'vinyl_soffit',
  'glass_glazing',
  'steel_panel',
] as const;

export const SHOT_TYPE_TAGS = [
  'overview',
  'mid_range',
  'close_up',
  'macro',
  'scale_reference_in_frame',
  'ground_level_context',
  'redundant_view',
] as const;

export const COMPONENT_TAGS = [
  'primary_slope_field',
  'ridge_cap',
  'valley',
  'hip',
  'flashing_step',
  'flashing_pipe_boot',
  'vent_turbine',
  'dormer_face',
  'gutter_trough',
  'downspout',
  'soffit',
  'fascia',
  'skylight_glazing',
  'skylight_frame',
  'siding_field',
  'window_screen',
  'garage_door_panel',
  'hvac_condenser_fins',
  'ceiling_drywall',
] as const;

export const FINDING_TAGS = [
  'bruise_spatter_mark',
  'granule_displacement',
  'fractured_tab',
  'dent_metal',
  'dent_vinyl',
  'pitting',
  'cracked_glazing',
  'lifted_creased_shingle',
  'exposed_nail_heads',
  'water_stain_active',
  'water_stain_prior',
  'displaced_panel',
  'puncture',
  'cracked_sealant',
  'paint_chipping',
] as const;

// Widened zone set — matches the hail-claim subset of the taxonomy.
// Roof slopes stay split (south/west) for Xactimate aggregation; new
// zones land siding, garage door, window screen, AC condenser, and
// interior ceiling damage that the prior 4-zone set could not place.
export const DAMAGE_ZONES = [
  'roof_south_slope',
  'roof_west_slope',
  'gutter_front',
  'soffit_fascia',
  'skylight_kitchen',
  'elevation_siding',
  'opening_garage_door',
  'opening_window',
  'system_hvac_exterior',
  'interior_ceiling',
  'property_overview',
] as const;

export const DAMAGE_SEVERITIES = ['minor', 'moderate', 'major', 'severe'] as const;

export const PERIL_CONSISTENCY = [
  'consistent',
  'inconsistent',
  'inconclusive',
] as const;

// M6b autonomous-output cutoff. Per-zone confidence at or above this
// threshold renders as an autonomous-output indicator; below it routes
// the zone to adjuster review.
export const CONFIDENCE_ROUTING_THRESHOLD = 0.85;

export const damageAgentOutputSchema = z.object({
  classifications: z
    .array(
      z.object({
        photo_id: z
          .string()
          .describe(
            'The id from the field photo set (e.g., "image-1"). Use the IDs as given.'
          ),
        primary_classification: z
          .enum(PRIMARY_CLASSIFICATIONS)
          .nullable()
          .describe(
            'The overall bucket for this photo. "peril" for storm-caused damage, "non_peril" for wear/age/improper-installation, "no_damage" for absent damage or non-dwelling subjects. Null only if truly ambiguous.'
          ),
        peril: z
          .array(z.enum(PERIL_TAGS))
          .default([])
          .describe(
            'Peril tags evidenced by the photo. Empty unless primary_classification is "peril". A single photo can carry multiple perils (e.g. hail + water_intrusion).'
          ),
        non_peril: z
          .array(z.enum(NON_PERIL_TAGS))
          .default([])
          .describe(
            'Non-peril findings (wear, age, improper installation). Empty unless primary_classification is "non_peril" or these are layered on top of a primary peril.'
          ),
        no_damage: z
          .array(z.enum(NO_DAMAGE_TAGS))
          .default([])
          .describe(
            'No-damage tags. "no_damage_confirmed" for dwelling components inspected with no defect; "na_component_absent" for objects outside the dwelling scope (neighbor property, vehicles, ornamental items).'
          ),
        component: z
          .enum(COMPONENT_TAGS)
          .nullable()
          .describe(
            'The single most-specific building component shown. Null for whole-property overviews or non-dwelling subjects.'
          ),
        material: z
          .enum(MATERIAL_TAGS)
          .nullable()
          .describe('Primary material of the component in frame. Null when not identifiable.'),
        shot_types: z
          .array(z.enum(SHOT_TYPE_TAGS))
          .default([])
          .describe(
            'Shot-quality attributes. Multi-select. Always include "scale_reference_in_frame" when a coin/ruler/hand is present; always include "redundant_view" for near-duplicates.'
          ),
        findings: z
          .array(z.enum(FINDING_TAGS))
          .default([])
          .describe(
            'Specific surface findings supporting the primary classification (e.g. bruise_spatter_mark + granule_displacement for a hail-struck shingle).'
          ),
        zone: z
          .enum(DAMAGE_ZONES)
          .nullable()
          .describe(
            'Which property zone this photo evidences. Null for unrelated/no-damage subjects with no dwelling tie-in.'
          ),
        confidence: z.number().min(0).max(1),
        rationale: z
          .string()
          .describe(
            'One short sentence describing what is visible in the photo and why it earned these tags.'
          ),
      })
    )
    .describe('One entry per supplied photo. Cover every photo ID.'),
  zones: z
    .array(
      z.object({
        zone: z.enum(DAMAGE_ZONES),
        severity: z.enum(DAMAGE_SEVERITIES),
        photo_count: z
          .number()
          .int()
          .nonnegative()
          .describe(
            'Number of photos in the set that evidence this zone. Powers the manifest "Photos" column.'
          ),
        findings_summary: z
          .string()
          .describe(
            'Comma-separated human-readable findings summary, e.g. "Bruise/spatter, Granule loss, Fractured tab". Drives the manifest "Findings" column.'
          ),
        recommendation: z
          .string()
          .describe(
            'Short repair recommendation with quantity, e.g. "Replace — 12 SQ", "No repair", "R&R drywall ~96 SF". Drives the manifest "Recommendation" column.'
          ),
        evidence: z
          .string()
          .describe(
            'Photo IDs and short observations supporting this zone, e.g. "image-1, image-2: granule loss across mid-field; impact craters consistent with hail."'
          ),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe(
            'Per-zone classification confidence (0–1). Values below CONFIDENCE_ROUTING_THRESHOLD route the zone to adjuster review; at or above the threshold the zone renders as an autonomous output.'
          ),
      })
    )
    .describe(
      'Damage zones derived from the photo set. One entry per zone you can support with photo evidence. Skip property_overview — it never carries severity.'
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

export type PrimaryClassification = (typeof PRIMARY_CLASSIFICATIONS)[number];
export type PerilTag = (typeof PERIL_TAGS)[number];
export type NonPerilTag = (typeof NON_PERIL_TAGS)[number];
export type NoDamageTag = (typeof NO_DAMAGE_TAGS)[number];
export type MaterialTag = (typeof MATERIAL_TAGS)[number];
export type ShotTypeTag = (typeof SHOT_TYPE_TAGS)[number];
export type ComponentTag = (typeof COMPONENT_TAGS)[number];
export type FindingTag = (typeof FINDING_TAGS)[number];
export type DamageZone = (typeof DAMAGE_ZONES)[number];

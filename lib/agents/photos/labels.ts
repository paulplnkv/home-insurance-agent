// Human-readable labels for the photo classification taxonomy. Kept
// separate from `schema.ts` so the schema stays as a pure source of
// truth for tag enums; UI surfaces that render badges (damage-output,
// photo-detail-dialog) import labels from here.
import type {
  ComponentTag,
  DamageZone,
  FindingTag,
  MaterialTag,
  NoDamageTag,
  NonPerilTag,
  PerilTag,
  PrimaryClassification,
  ShotTypeTag,
} from '@/lib/agents/photos/schema';

export const PRIMARY_LABEL: Record<PrimaryClassification, string> = {
  peril: 'Peril',
  non_peril: 'Non-peril',
  no_damage: 'No damage / out of scope',
};

export const PERIL_LABEL: Record<PerilTag, string> = {
  hail: 'Hail',
  wind: 'Wind',
  debris_impact: 'Debris impact',
  water_intrusion: 'Water intrusion',
};

export const NON_PERIL_LABEL: Record<NonPerilTag, string> = {
  wear_and_tear: 'Wear & age',
  deferred_maintenance: 'Deferred maintenance',
  mechanical_damage: 'Mechanical',
  improper_installation: 'Improper installation',
  rust_corrosion: 'Rust / corrosion',
  foot_traffic: 'Foot-traffic',
};

export const NO_DAMAGE_LABEL: Record<NoDamageTag, string> = {
  no_damage_confirmed: 'No damage',
  na_component_absent: 'Out of scope',
};

export const COMPONENT_LABEL: Record<ComponentTag, string> = {
  primary_slope_field: 'Slope field',
  ridge_cap: 'Ridge cap',
  valley: 'Valley',
  hip: 'Hip',
  flashing_step: 'Step flashing',
  flashing_pipe_boot: 'Pipe-boot flashing',
  vent_turbine: 'Turbine vent',
  dormer_face: 'Dormer face',
  gutter_trough: 'Gutter trough',
  downspout: 'Downspout',
  soffit: 'Soffit',
  fascia: 'Fascia',
  skylight_glazing: 'Skylight glazing',
  skylight_frame: 'Skylight frame',
  siding_field: 'Siding field',
  window_screen: 'Window screen',
  garage_door_panel: 'Garage door panel',
  hvac_condenser_fins: 'HVAC fins',
  ceiling_drywall: 'Ceiling drywall',
};

export const MATERIAL_LABEL: Record<MaterialTag, string> = {
  asphalt_architectural: 'Asphalt arch.',
  asphalt_3tab: 'Asphalt 3-tab',
  metal_galvanized: 'Galv. metal',
  aluminum: 'Aluminum',
  vinyl_siding: 'Vinyl siding',
  vinyl_soffit: 'Vinyl soffit',
  glass_glazing: 'Glass',
  steel_panel: 'Steel',
};

export const SHOT_TYPE_LABEL: Record<ShotTypeTag, string> = {
  overview: 'Overview',
  mid_range: 'Mid-range',
  close_up: 'Close-up',
  macro: 'Macro',
  scale_reference_in_frame: 'Scale ref.',
  ground_level_context: 'Ground-level',
  redundant_view: 'Redundant view',
};

export const FINDING_LABEL: Record<FindingTag, string> = {
  bruise_spatter_mark: 'Bruise / spatter',
  granule_displacement: 'Granule loss',
  fractured_tab: 'Fractured tab',
  dent_metal: 'Dent (metal)',
  dent_vinyl: 'Dent (vinyl)',
  pitting: 'Pitting',
  cracked_glazing: 'Cracked glazing',
  lifted_creased_shingle: 'Lifted shingle',
  exposed_nail_heads: 'Exposed nails',
  water_stain_active: 'Water stain (active)',
  water_stain_prior: 'Water stain (prior)',
  displaced_panel: 'Displaced panel',
  puncture: 'Puncture',
  cracked_sealant: 'Cracked sealant',
  paint_chipping: 'Paint chipping',
};

export const ZONE_LABELS: Record<DamageZone, string> = {
  roof_south_slope: 'Roof — south slope',
  roof_west_slope: 'Roof — west slope',
  gutter_front: 'Front gutter',
  soffit_fascia: 'Soffit & fascia',
  skylight_kitchen: 'Kitchen skylight',
  elevation_siding: 'Elevation — siding',
  opening_garage_door: 'Garage door',
  opening_window: 'Window opening',
  system_hvac_exterior: 'HVAC condenser',
  interior_ceiling: 'Interior ceiling',
  property_overview: 'Property overview',
};

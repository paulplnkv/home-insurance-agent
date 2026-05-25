// Photo manifest — single source of truth for the field photo set the
// Damage Assessment agent classifies. Ground truth follows the
// multi-category taxonomy in lib/agents/photos/schema.ts and is used
// only for prompt context and post-run verification; it is never
// injected into the model's input.
//
// File assets live in /public/photos/. See public/photos/README.md for
// licensing and rehearsal-time replacement guidance.
import { resolve } from 'node:path';
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

export interface PhotoGroundTruth {
  primary_classification: PrimaryClassification | null;
  peril: readonly PerilTag[];
  non_peril: readonly NonPerilTag[];
  no_damage: readonly NoDamageTag[];
  component: ComponentTag | null;
  material: MaterialTag | null;
  shot_types: readonly ShotTypeTag[];
  findings: readonly FindingTag[];
  zone: DamageZone | null;
}

export interface ScenarioPhoto {
  id: string;
  filename: string;
  // Public URL relative to the Next.js origin. Used by the panel to render.
  publicUrl: string;
  // Multi-category ground truth — what the photo is supposed to depict
  // in this scenario. Drives our pre/post verification of agent output.
  // NOT injected into the agent prompt.
  groundTruth: PhotoGroundTruth;
  // Free-text description the panel uses for tooltips and the JSON
  // inspector. NOT injected into the agent prompt.
  description: string;
}

// Reusable ground-truth shapes for the most common photo archetypes.
// The agent has no access to these; they only keep the manifest tidy.
const HAIL_ROOF_SOUTH: PhotoGroundTruth = {
  primary_classification: 'peril',
  peril: ['hail'],
  non_peril: [],
  no_damage: [],
  component: 'primary_slope_field',
  material: 'asphalt_architectural',
  shot_types: ['mid_range'],
  findings: ['bruise_spatter_mark', 'granule_displacement'],
  zone: 'roof_south_slope',
};

const HAIL_ROOF_WEST: PhotoGroundTruth = {
  ...HAIL_ROOF_SOUTH,
  findings: ['bruise_spatter_mark'],
  zone: 'roof_west_slope',
};

const HAIL_GUTTER_FRONT: PhotoGroundTruth = {
  primary_classification: 'peril',
  peril: ['hail'],
  non_peril: [],
  no_damage: [],
  component: 'gutter_trough',
  material: 'aluminum',
  shot_types: ['mid_range'],
  findings: ['dent_metal'],
  zone: 'gutter_front',
};

const HAIL_SKYLIGHT_KITCHEN: PhotoGroundTruth = {
  primary_classification: 'peril',
  peril: ['hail'],
  non_peril: [],
  no_damage: [],
  component: 'skylight_glazing',
  material: 'glass_glazing',
  shot_types: ['mid_range'],
  findings: ['cracked_glazing'],
  zone: 'skylight_kitchen',
};

const INTERIOR_WATER: PhotoGroundTruth = {
  primary_classification: 'peril',
  peril: ['water_intrusion'],
  non_peril: [],
  no_damage: [],
  component: 'ceiling_drywall',
  material: null,
  shot_types: ['mid_range'],
  findings: ['water_stain_active'],
  zone: 'interior_ceiling',
};

const NA_OUT_OF_SCOPE: PhotoGroundTruth = {
  primary_classification: 'no_damage',
  peril: [],
  non_peril: [],
  no_damage: ['na_component_absent'],
  component: null,
  material: null,
  shot_types: ['overview'],
  findings: [],
  zone: null,
};

// Helper: extend a ground-truth shape, useful for near-duplicate and
// scale-reference variants of a primary photo.
function extend(
  base: PhotoGroundTruth,
  patch: Partial<PhotoGroundTruth>
): PhotoGroundTruth {
  return { ...base, ...patch };
}

export const PHOTO_MANIFEST: readonly ScenarioPhoto[] = [
  {
    id: 'image-1',
    filename: 'roof-south-1.jpg',
    publicUrl: '/photos/roof-south-1.jpg',
    groundTruth: HAIL_ROOF_SOUTH,
    description: 'South slope roof, severe hail impacts across mid field.',
  },
  {
    id: 'image-2',
    filename: 'roof-south-2.jpg',
    publicUrl: '/photos/roof-south-2.jpg',
    groundTruth: HAIL_ROOF_SOUTH,
    description: 'South slope roof, second angle showing granule loss.',
  },
  {
    id: 'image-3',
    filename: 'roof-west-1.jpg',
    publicUrl: '/photos/roof-west-1.jpg',
    groundTruth: HAIL_ROOF_WEST,
    description: 'West slope roof, moderate hail impacts.',
  },
  {
    id: 'image-4',
    filename: 'gutter-1.jpg',
    publicUrl: '/photos/gutter-1.jpg',
    groundTruth: HAIL_GUTTER_FRONT,
    description: 'Front aluminum gutter, dented along 24 lf run.',
  },
  {
    id: 'image-5',
    filename: 'roof-south-near-1.jpg',
    publicUrl: '/photos/roof-south-near-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['mid_range', 'redundant_view'],
    }),
    description: 'Near-duplicate of image-1 (slight angle shift).',
  },
  {
    id: 'image-6',
    filename: 'roof-south-near-2.jpg',
    publicUrl: '/photos/roof-south-near-2.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['close_up', 'redundant_view'],
    }),
    description: 'Near-duplicate of image-1 (closer crop).',
  },
  {
    id: 'image-7',
    filename: 'roof-south-near-3.jpg',
    publicUrl: '/photos/roof-south-near-3.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['mid_range', 'redundant_view'],
    }),
    description: 'Near-duplicate of image-1 (different exposure).',
  },
  {
    id: 'image-8',
    filename: 'scale-coin-1.jpg',
    publicUrl: '/photos/scale-coin-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['close_up', 'scale_reference_in_frame'],
      findings: ['bruise_spatter_mark'],
    }),
    description: 'Quarter coin placed beside hail impact crater for scale.',
  },
  {
    id: 'image-9',
    filename: 'scale-tape-1.jpg',
    publicUrl: '/photos/scale-tape-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['close_up', 'scale_reference_in_frame'],
      findings: ['bruise_spatter_mark'],
    }),
    description: 'Tape measure across hail impact, reads ~1.5" diameter.',
  },
  {
    id: 'image-10',
    filename: 'skylight-1.jpg',
    publicUrl: '/photos/skylight-1.jpg',
    groundTruth: HAIL_SKYLIGHT_KITCHEN,
    description: 'Damaged kitchen skylight, cracked glazing and seal.',
  },
  {
    id: 'image-11',
    filename: 'interior-water-1.jpg',
    publicUrl: '/photos/interior-water-1.jpg',
    groundTruth: INTERIOR_WATER,
    description: 'Interior kitchen ceiling under skylight — water staining.',
  },
  {
    id: 'image-12',
    filename: 'neighbor-fence-1.jpg',
    publicUrl: '/photos/neighbor-fence-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Neighbor property fence — no relevance to this loss.',
  },
  {
    id: 'image-13',
    filename: 'parked-car-1.jpg',
    publicUrl: '/photos/parked-car-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Parked car in driveway — not part of dwelling damage.',
  },

  // --- expansion to 30 total for richer demo ---

  {
    id: 'image-14',
    filename: 'roof-south-3.jpg',
    publicUrl: '/photos/roof-south-3.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, { shot_types: ['overview'] }),
    description: 'South slope roof, wide overhead view from the ridge.',
  },
  {
    id: 'image-15',
    filename: 'roof-south-detail-1.jpg',
    publicUrl: '/photos/roof-south-detail-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['macro'],
      findings: ['bruise_spatter_mark'],
    }),
    description: 'Macro of a single hail impact crater on south slope.',
  },
  {
    id: 'image-16',
    filename: 'roof-west-2.jpg',
    publicUrl: '/photos/roof-west-2.jpg',
    groundTruth: HAIL_ROOF_WEST,
    description: 'West slope roof, closer angle showing scuffing.',
  },
  {
    id: 'image-17',
    filename: 'roof-west-3.jpg',
    publicUrl: '/photos/roof-west-3.jpg',
    groundTruth: HAIL_ROOF_WEST,
    description: 'Corner where west and south slopes meet, both impacted.',
  },
  {
    id: 'image-18',
    filename: 'gutter-2.jpg',
    publicUrl: '/photos/gutter-2.jpg',
    groundTruth: HAIL_GUTTER_FRONT,
    description: 'Front gutter, second section with more dents from below.',
  },
  {
    id: 'image-19',
    filename: 'gutter-3.jpg',
    publicUrl: '/photos/gutter-3.jpg',
    groundTruth: extend(HAIL_GUTTER_FRONT, { component: 'downspout' }),
    description: 'Front downspout, dented from falling hail.',
  },
  {
    id: 'image-20',
    filename: 'interior-water-2.jpg',
    publicUrl: '/photos/interior-water-2.jpg',
    groundTruth: INTERIOR_WATER,
    description: 'Kitchen ceiling water staining spreading from skylight.',
  },

  {
    id: 'image-21',
    filename: 'roof-south-near-4.jpg',
    publicUrl: '/photos/roof-south-near-4.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['overview', 'redundant_view'],
    }),
    description: 'Near-duplicate of image-1 (wider crop).',
  },
  {
    id: 'image-22',
    filename: 'gutter-near-1.jpg',
    publicUrl: '/photos/gutter-near-1.jpg',
    groundTruth: extend(HAIL_GUTTER_FRONT, {
      shot_types: ['mid_range', 'redundant_view'],
    }),
    description: 'Near-duplicate of image-4 (slight angle shift).',
  },

  {
    id: 'image-23',
    filename: 'scale-ruler-1.jpg',
    publicUrl: '/photos/scale-ruler-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['close_up', 'scale_reference_in_frame'],
      findings: ['bruise_spatter_mark'],
    }),
    description: 'Metal ruler across hail impacts, ~1.5–2 inch diameter.',
  },
  {
    id: 'image-24',
    filename: 'scale-card-1.jpg',
    publicUrl: '/photos/scale-card-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['close_up', 'scale_reference_in_frame'],
      findings: ['bruise_spatter_mark'],
    }),
    description: 'Credit-card-sized object beside hail impact crater.',
  },

  {
    id: 'image-25',
    filename: 'unrelated-mailbox-1.jpg',
    publicUrl: '/photos/unrelated-mailbox-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Undamaged mailbox at curb — not part of dwelling claim.',
  },
  {
    id: 'image-26',
    filename: 'unrelated-pool-1.jpg',
    publicUrl: '/photos/unrelated-pool-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Backyard pool deck, no storm damage.',
  },
  {
    id: 'image-27',
    filename: 'unrelated-grill-1.jpg',
    publicUrl: '/photos/unrelated-grill-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Propane grill on patio, no damage.',
  },
  {
    id: 'image-28',
    filename: 'unrelated-trashcan-1.jpg',
    publicUrl: '/photos/unrelated-trashcan-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Rolling trash bins at curb, undamaged.',
  },
  {
    id: 'image-29',
    filename: 'unrelated-driveway-1.jpg',
    publicUrl: '/photos/unrelated-driveway-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Empty driveway and closed garage door, undamaged.',
  },
  {
    id: 'image-30',
    filename: 'unrelated-flowerbed-1.jpg',
    publicUrl: '/photos/unrelated-flowerbed-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Front flowerbed near entry, undamaged.',
  },

  // --- expansion to 60 total: broader damage surfaces + more variety ---

  {
    id: 'image-31',
    filename: 'roof-ridge-cap-1.jpg',
    publicUrl: '/photos/roof-ridge-cap-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      component: 'ridge_cap',
      shot_types: ['close_up'],
      findings: ['bruise_spatter_mark'],
    }),
    description: 'Ridge-cap shingles along the peak, hail impacts visible.',
  },
  {
    id: 'image-32',
    filename: 'roof-valley-1.jpg',
    publicUrl: '/photos/roof-valley-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      component: 'valley',
      shot_types: ['mid_range'],
    }),
    description: 'Valley between south and west slopes, impacts on both sides.',
  },
  {
    id: 'image-33',
    filename: 'roof-vent-1.jpg',
    publicUrl: '/photos/roof-vent-1.jpg',
    groundTruth: {
      primary_classification: 'peril',
      peril: ['hail'],
      non_peril: [],
      no_damage: [],
      component: 'vent_turbine',
      material: 'metal_galvanized',
      shot_types: ['close_up'],
      findings: ['dent_metal'],
      zone: 'roof_south_slope',
    },
    description: 'Metal turbine roof vent, dome dented and blades bent.',
  },
  {
    id: 'image-34',
    filename: 'roof-flashing-1.jpg',
    publicUrl: '/photos/roof-flashing-1.jpg',
    groundTruth: {
      primary_classification: 'peril',
      peril: ['hail'],
      non_peril: [],
      no_damage: [],
      component: 'flashing_step',
      material: 'metal_galvanized',
      shot_types: ['close_up'],
      findings: ['dent_metal', 'cracked_sealant'],
      zone: 'roof_west_slope',
    },
    description: 'Chimney step-flashing dented and lifted, cracked sealant.',
  },
  {
    id: 'image-35',
    filename: 'roof-dormer-1.jpg',
    publicUrl: '/photos/roof-dormer-1.jpg',
    groundTruth: extend(HAIL_ROOF_WEST, {
      component: 'dormer_face',
      findings: ['bruise_spatter_mark', 'granule_displacement'],
    }),
    description: 'Dormer roof face, hail impacts and granule loss.',
  },
  {
    id: 'image-36',
    filename: 'roof-soffit-1.jpg',
    publicUrl: '/photos/roof-soffit-1.jpg',
    groundTruth: {
      primary_classification: 'peril',
      peril: ['hail'],
      non_peril: [],
      no_damage: [],
      component: 'soffit',
      material: 'vinyl_soffit',
      shot_types: ['close_up'],
      findings: ['dent_vinyl', 'paint_chipping'],
      zone: 'soffit_fascia',
    },
    description: 'White vinyl soffit panel cracked and dented from hail.',
  },
  {
    id: 'image-37',
    filename: 'siding-1.jpg',
    publicUrl: '/photos/siding-1.jpg',
    groundTruth: {
      primary_classification: 'peril',
      peril: ['hail'],
      non_peril: [],
      no_damage: [],
      component: 'siding_field',
      material: 'vinyl_siding',
      shot_types: ['mid_range'],
      findings: ['dent_vinyl', 'paint_chipping'],
      zone: 'elevation_siding',
    },
    description: 'Beige vinyl siding with hail impact dings and small cracks.',
  },
  {
    id: 'image-38',
    filename: 'garage-door-1.jpg',
    publicUrl: '/photos/garage-door-1.jpg',
    groundTruth: {
      primary_classification: 'peril',
      peril: ['hail'],
      non_peril: [],
      no_damage: [],
      component: 'garage_door_panel',
      material: 'steel_panel',
      shot_types: ['mid_range'],
      findings: ['dent_metal'],
      zone: 'opening_garage_door',
    },
    description: 'Steel two-car garage door, dented across upper panels.',
  },
  {
    id: 'image-39',
    filename: 'ac-condenser-1.jpg',
    publicUrl: '/photos/ac-condenser-1.jpg',
    groundTruth: {
      primary_classification: 'peril',
      peril: ['hail'],
      non_peril: [],
      no_damage: [],
      component: 'hvac_condenser_fins',
      material: 'aluminum',
      shot_types: ['close_up'],
      findings: ['dent_metal'],
      zone: 'system_hvac_exterior',
    },
    description: 'AC condenser unit, aluminum cooling fins bent from hail.',
  },
  {
    id: 'image-40',
    filename: 'window-screen-1.jpg',
    publicUrl: '/photos/window-screen-1.jpg',
    groundTruth: {
      primary_classification: 'peril',
      peril: ['hail'],
      non_peril: [],
      no_damage: [],
      component: 'window_screen',
      material: null,
      shot_types: ['close_up'],
      findings: ['puncture', 'dent_metal'],
      zone: 'opening_window',
    },
    description: 'Window screen with hailstone punctures and dented frame.',
  },
  {
    id: 'image-41',
    filename: 'skylight-2.jpg',
    publicUrl: '/photos/skylight-2.jpg',
    groundTruth: HAIL_SKYLIGHT_KITCHEN,
    description: 'Second skylight unit, moderate glazing damage and chipped frame.',
  },
  {
    id: 'image-42',
    filename: 'roof-south-edge-1.jpg',
    publicUrl: '/photos/roof-south-edge-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      peril: ['hail', 'wind'],
      findings: ['bruise_spatter_mark', 'lifted_creased_shingle'],
    }),
    description: 'South-slope eave row, hail impacts plus lifted shingle tabs.',
  },
  {
    id: 'image-43',
    filename: 'interior-water-3.jpg',
    publicUrl: '/photos/interior-water-3.jpg',
    groundTruth: INTERIOR_WATER,
    description: 'Bedroom ceiling water stain spreading across drywall.',
  },

  {
    id: 'image-44',
    filename: 'roof-west-near-1.jpg',
    publicUrl: '/photos/roof-west-near-1.jpg',
    groundTruth: extend(HAIL_ROOF_WEST, {
      shot_types: ['mid_range', 'redundant_view'],
    }),
    description: 'Near-duplicate of image-3 (slight angle shift).',
  },
  {
    id: 'image-45',
    filename: 'roof-west-near-2.jpg',
    publicUrl: '/photos/roof-west-near-2.jpg',
    groundTruth: extend(HAIL_ROOF_WEST, {
      shot_types: ['close_up', 'redundant_view'],
    }),
    description: 'Near-duplicate of image-3 (closer crop).',
  },
  {
    id: 'image-46',
    filename: 'gutter-near-2.jpg',
    publicUrl: '/photos/gutter-near-2.jpg',
    groundTruth: extend(HAIL_GUTTER_FRONT, {
      shot_types: ['mid_range', 'redundant_view'],
    }),
    description: 'Near-duplicate of image-4 (different framing).',
  },
  {
    id: 'image-47',
    filename: 'skylight-near-1.jpg',
    publicUrl: '/photos/skylight-near-1.jpg',
    groundTruth: extend(HAIL_SKYLIGHT_KITCHEN, {
      shot_types: ['mid_range', 'redundant_view'],
    }),
    description: 'Near-duplicate of image-10 (slight angle shift).',
  },
  {
    id: 'image-48',
    filename: 'interior-water-near-1.jpg',
    publicUrl: '/photos/interior-water-near-1.jpg',
    groundTruth: extend(INTERIOR_WATER, {
      shot_types: ['mid_range', 'redundant_view'],
    }),
    description: 'Near-duplicate of image-11 (different exposure).',
  },

  {
    id: 'image-49',
    filename: 'scale-hand-1.jpg',
    publicUrl: '/photos/scale-hand-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['close_up', 'scale_reference_in_frame'],
      findings: ['bruise_spatter_mark'],
    }),
    description: 'Adult hand beside hail impact crater for scale.',
  },
  {
    id: 'image-50',
    filename: 'scale-keys-1.jpg',
    publicUrl: '/photos/scale-keys-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['close_up', 'scale_reference_in_frame'],
      findings: ['bruise_spatter_mark'],
    }),
    description: 'Car key fob laid next to hail impact crater.',
  },
  {
    id: 'image-51',
    filename: 'scale-pen-1.jpg',
    publicUrl: '/photos/scale-pen-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['close_up', 'scale_reference_in_frame'],
    }),
    description: 'Ballpoint pen across a row of three hail impact craters.',
  },
  {
    id: 'image-52',
    filename: 'scale-callipers-1.jpg',
    publicUrl: '/photos/scale-callipers-1.jpg',
    groundTruth: extend(HAIL_ROOF_SOUTH, {
      shot_types: ['macro', 'scale_reference_in_frame'],
      findings: ['bruise_spatter_mark'],
    }),
    description: 'Digital calipers measuring hail crater diameter (~1.5 in).',
  },

  {
    id: 'image-53',
    filename: 'unrelated-shed-1.jpg',
    publicUrl: '/photos/unrelated-shed-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Backyard storage shed, undamaged.',
  },
  {
    id: 'image-54',
    filename: 'unrelated-playset-1.jpg',
    publicUrl: '/photos/unrelated-playset-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Wooden backyard playset (swing + slide), undamaged.',
  },
  {
    id: 'image-55',
    filename: 'unrelated-patio-furniture-1.jpg',
    publicUrl: '/photos/unrelated-patio-furniture-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Patio dining set (table + four chairs), undamaged.',
  },
  {
    id: 'image-56',
    filename: 'unrelated-hose-1.jpg',
    publicUrl: '/photos/unrelated-hose-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Coiled garden hose on wall-mounted reel, undamaged.',
  },
  {
    id: 'image-57',
    filename: 'unrelated-porch-light-1.jpg',
    publicUrl: '/photos/unrelated-porch-light-1.jpg',
    groundTruth: {
      primary_classification: 'no_damage',
      peril: [],
      non_peril: [],
      no_damage: ['no_damage_confirmed'],
      component: null,
      material: null,
      shot_types: ['close_up'],
      findings: [],
      zone: null,
    },
    description: 'Front-porch wall sconce fixture, undamaged.',
  },
  {
    id: 'image-58',
    filename: 'unrelated-doormat-1.jpg',
    publicUrl: '/photos/unrelated-doormat-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Coir welcome mat at the front door, undamaged.',
  },
  {
    id: 'image-59',
    filename: 'unrelated-bird-feeder-1.jpg',
    publicUrl: '/photos/unrelated-bird-feeder-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Wooden bird feeder on a garden pole, undamaged.',
  },
  {
    id: 'image-60',
    filename: 'unrelated-bicycle-1.jpg',
    publicUrl: '/photos/unrelated-bicycle-1.jpg',
    groundTruth: NA_OUT_OF_SCOPE,
    description: 'Adult bicycle leaning on the front porch railing, undamaged.',
  },
] as const;

export function getPhotoById(id: string): ScenarioPhoto | undefined {
  return PHOTO_MANIFEST.find((p) => p.id === id);
}

// Server-side absolute path for reading the binary off disk.
export function photoFilesystemPath(photo: ScenarioPhoto): string {
  return resolve(process.cwd(), 'public', 'photos', photo.filename);
}

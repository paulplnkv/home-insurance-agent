// Photo manifest — single source of truth for the field photo set the
// Damage Assessment agent classifies. Per PRD § "Photo manifest module
// exposes typed entries with id, public URL, and ground-truth label
// (used for prompts and verification, not exposed to the model)".
//
// File assets live in /public/photos/. See public/photos/README.md for
// licensing and rehearsal-time replacement guidance.
import { resolve } from 'node:path';

export type GroundTruthLabel =
  | 'hail_damage'
  | 'scale_reference'
  | 'near_duplicate'
  | 'unrelated';

export interface ScenarioPhoto {
  id: string;
  filename: string;
  // Public URL relative to the Next.js origin. Used by the panel to render.
  publicUrl: string;
  // Ground truth — what the photo is supposed to depict in this scenario.
  // Drives our pre/post verification of agent output. NOT injected into
  // the agent prompt.
  groundTruth: GroundTruthLabel;
  // Free-text description the panel uses for tooltips and the JSON
  // inspector. NOT injected into the agent prompt.
  description: string;
  // Optional: zone label this photo evidences when groundTruth =
  // 'hail_damage'. Used by the rehearsal scenario builder to assemble
  // the canonical zone manifest the deterministic calculator expects.
  zone?: 'roof_south_slope' | 'roof_west_slope' | 'gutter_front' | 'skylight_kitchen';
}

export const PHOTO_MANIFEST: readonly ScenarioPhoto[] = [
  {
    id: 'roof-south-1',
    filename: 'roof-south-1.jpg',
    publicUrl: '/photos/roof-south-1.jpg',
    groundTruth: 'hail_damage',
    description: 'South slope roof, severe hail impacts across mid field.',
    zone: 'roof_south_slope',
  },
  {
    id: 'roof-south-2',
    filename: 'roof-south-2.jpg',
    publicUrl: '/photos/roof-south-2.jpg',
    groundTruth: 'hail_damage',
    description: 'South slope roof, second angle showing granule loss.',
    zone: 'roof_south_slope',
  },
  {
    id: 'roof-west-1',
    filename: 'roof-west-1.jpg',
    publicUrl: '/photos/roof-west-1.jpg',
    groundTruth: 'hail_damage',
    description: 'West slope roof, moderate hail impacts.',
    zone: 'roof_west_slope',
  },
  {
    id: 'gutter-1',
    filename: 'gutter-1.jpg',
    publicUrl: '/photos/gutter-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Front aluminum gutter, dented along 24 lf run.',
    zone: 'gutter_front',
  },
  {
    id: 'roof-south-near-1',
    filename: 'roof-south-near-1.jpg',
    publicUrl: '/photos/roof-south-near-1.jpg',
    groundTruth: 'near_duplicate',
    description: 'Near-duplicate of roof-south-1 (slight angle shift).',
  },
  {
    id: 'roof-south-near-2',
    filename: 'roof-south-near-2.jpg',
    publicUrl: '/photos/roof-south-near-2.jpg',
    groundTruth: 'near_duplicate',
    description: 'Near-duplicate of roof-south-1 (closer crop).',
  },
  {
    id: 'roof-south-near-3',
    filename: 'roof-south-near-3.jpg',
    publicUrl: '/photos/roof-south-near-3.jpg',
    groundTruth: 'near_duplicate',
    description: 'Near-duplicate of roof-south-1 (different exposure).',
  },
  {
    id: 'scale-coin-1',
    filename: 'scale-coin-1.jpg',
    publicUrl: '/photos/scale-coin-1.jpg',
    groundTruth: 'scale_reference',
    description: 'Quarter coin placed beside hail impact crater for scale.',
  },
  {
    id: 'scale-tape-1',
    filename: 'scale-tape-1.jpg',
    publicUrl: '/photos/scale-tape-1.jpg',
    groundTruth: 'scale_reference',
    description: 'Tape measure across hail impact, reads ~1.5" diameter.',
  },
  {
    id: 'skylight-1',
    filename: 'skylight-1.jpg',
    publicUrl: '/photos/skylight-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Damaged kitchen skylight, cracked glazing and seal.',
    zone: 'skylight_kitchen',
  },
  {
    id: 'interior-water-1',
    filename: 'interior-water-1.jpg',
    publicUrl: '/photos/interior-water-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Interior kitchen ceiling under skylight — water staining.',
    zone: 'skylight_kitchen',
  },
  {
    id: 'neighbor-fence-1',
    filename: 'neighbor-fence-1.jpg',
    publicUrl: '/photos/neighbor-fence-1.jpg',
    groundTruth: 'unrelated',
    description: 'Neighbor property fence — no relevance to this loss.',
  },
  {
    id: 'parked-car-1',
    filename: 'parked-car-1.jpg',
    publicUrl: '/photos/parked-car-1.jpg',
    groundTruth: 'unrelated',
    description: 'Parked car in driveway — not part of dwelling damage.',
  },

  // --- expansion to 30 total for richer demo ---

  {
    id: 'roof-south-3',
    filename: 'roof-south-3.jpg',
    publicUrl: '/photos/roof-south-3.jpg',
    groundTruth: 'hail_damage',
    description: 'South slope roof, wide overhead view from the ridge.',
    zone: 'roof_south_slope',
  },
  {
    id: 'roof-south-detail-1',
    filename: 'roof-south-detail-1.jpg',
    publicUrl: '/photos/roof-south-detail-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Macro of a single hail impact crater on south slope.',
    zone: 'roof_south_slope',
  },
  {
    id: 'roof-west-2',
    filename: 'roof-west-2.jpg',
    publicUrl: '/photos/roof-west-2.jpg',
    groundTruth: 'hail_damage',
    description: 'West slope roof, closer angle showing scuffing.',
    zone: 'roof_west_slope',
  },
  {
    id: 'roof-west-3',
    filename: 'roof-west-3.jpg',
    publicUrl: '/photos/roof-west-3.jpg',
    groundTruth: 'hail_damage',
    description: 'Corner where west and south slopes meet, both impacted.',
    zone: 'roof_west_slope',
  },
  {
    id: 'gutter-2',
    filename: 'gutter-2.jpg',
    publicUrl: '/photos/gutter-2.jpg',
    groundTruth: 'hail_damage',
    description: 'Front gutter, second section with more dents from below.',
    zone: 'gutter_front',
  },
  {
    id: 'gutter-3',
    filename: 'gutter-3.jpg',
    publicUrl: '/photos/gutter-3.jpg',
    groundTruth: 'hail_damage',
    description: 'Front downspout, dented from falling hail.',
    zone: 'gutter_front',
  },
  {
    id: 'interior-water-2',
    filename: 'interior-water-2.jpg',
    publicUrl: '/photos/interior-water-2.jpg',
    groundTruth: 'hail_damage',
    description: 'Kitchen ceiling water staining spreading from skylight.',
    zone: 'skylight_kitchen',
  },

  {
    id: 'roof-south-near-4',
    filename: 'roof-south-near-4.jpg',
    publicUrl: '/photos/roof-south-near-4.jpg',
    groundTruth: 'near_duplicate',
    description: 'Near-duplicate of roof-south-1 (wider crop).',
  },
  {
    id: 'gutter-near-1',
    filename: 'gutter-near-1.jpg',
    publicUrl: '/photos/gutter-near-1.jpg',
    groundTruth: 'near_duplicate',
    description: 'Near-duplicate of gutter-1 (slight angle shift).',
  },

  {
    id: 'scale-ruler-1',
    filename: 'scale-ruler-1.jpg',
    publicUrl: '/photos/scale-ruler-1.jpg',
    groundTruth: 'scale_reference',
    description: 'Metal ruler across hail impacts, ~1.5–2 inch diameter.',
  },
  {
    id: 'scale-card-1',
    filename: 'scale-card-1.jpg',
    publicUrl: '/photos/scale-card-1.jpg',
    groundTruth: 'scale_reference',
    description: 'Credit-card-sized object beside hail impact crater.',
  },

  {
    id: 'unrelated-mailbox-1',
    filename: 'unrelated-mailbox-1.jpg',
    publicUrl: '/photos/unrelated-mailbox-1.jpg',
    groundTruth: 'unrelated',
    description: 'Undamaged mailbox at curb — not part of dwelling claim.',
  },
  {
    id: 'unrelated-pool-1',
    filename: 'unrelated-pool-1.jpg',
    publicUrl: '/photos/unrelated-pool-1.jpg',
    groundTruth: 'unrelated',
    description: 'Backyard pool deck, no storm damage.',
  },
  {
    id: 'unrelated-grill-1',
    filename: 'unrelated-grill-1.jpg',
    publicUrl: '/photos/unrelated-grill-1.jpg',
    groundTruth: 'unrelated',
    description: 'Propane grill on patio, no damage.',
  },
  {
    id: 'unrelated-trashcan-1',
    filename: 'unrelated-trashcan-1.jpg',
    publicUrl: '/photos/unrelated-trashcan-1.jpg',
    groundTruth: 'unrelated',
    description: 'Rolling trash bins at curb, undamaged.',
  },
  {
    id: 'unrelated-driveway-1',
    filename: 'unrelated-driveway-1.jpg',
    publicUrl: '/photos/unrelated-driveway-1.jpg',
    groundTruth: 'unrelated',
    description: 'Empty driveway and closed garage door, undamaged.',
  },
  {
    id: 'unrelated-flowerbed-1',
    filename: 'unrelated-flowerbed-1.jpg',
    publicUrl: '/photos/unrelated-flowerbed-1.jpg',
    groundTruth: 'unrelated',
    description: 'Front flowerbed near entry, undamaged.',
  },

  // --- expansion to 60 total: broader damage surfaces + more variety ---

  {
    id: 'roof-ridge-cap-1',
    filename: 'roof-ridge-cap-1.jpg',
    publicUrl: '/photos/roof-ridge-cap-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Ridge-cap shingles along the peak, hail impacts visible.',
    zone: 'roof_south_slope',
  },
  {
    id: 'roof-valley-1',
    filename: 'roof-valley-1.jpg',
    publicUrl: '/photos/roof-valley-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Valley between south and west slopes, impacts on both sides.',
    zone: 'roof_south_slope',
  },
  {
    id: 'roof-vent-1',
    filename: 'roof-vent-1.jpg',
    publicUrl: '/photos/roof-vent-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Metal turbine roof vent, dome dented and blades bent.',
    zone: 'roof_south_slope',
  },
  {
    id: 'roof-flashing-1',
    filename: 'roof-flashing-1.jpg',
    publicUrl: '/photos/roof-flashing-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Chimney step-flashing dented and lifted, cracked sealant.',
    zone: 'roof_west_slope',
  },
  {
    id: 'roof-dormer-1',
    filename: 'roof-dormer-1.jpg',
    publicUrl: '/photos/roof-dormer-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Dormer roof face, hail impacts and granule loss.',
    zone: 'roof_west_slope',
  },
  {
    id: 'roof-soffit-1',
    filename: 'roof-soffit-1.jpg',
    publicUrl: '/photos/roof-soffit-1.jpg',
    groundTruth: 'hail_damage',
    description: 'White vinyl soffit panel cracked and dented from hail.',
    zone: 'gutter_front',
  },
  // Out-of-zone hail damage — useful for "is this covered under dwelling?"
  // demo cases. groundTruth stays hail_damage; zone is intentionally omitted.
  {
    id: 'siding-1',
    filename: 'siding-1.jpg',
    publicUrl: '/photos/siding-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Beige vinyl siding with hail impact dings and small cracks.',
  },
  {
    id: 'garage-door-1',
    filename: 'garage-door-1.jpg',
    publicUrl: '/photos/garage-door-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Steel two-car garage door, dented across upper panels.',
  },
  {
    id: 'ac-condenser-1',
    filename: 'ac-condenser-1.jpg',
    publicUrl: '/photos/ac-condenser-1.jpg',
    groundTruth: 'hail_damage',
    description: 'AC condenser unit, aluminum cooling fins bent from hail.',
  },
  {
    id: 'window-screen-1',
    filename: 'window-screen-1.jpg',
    publicUrl: '/photos/window-screen-1.jpg',
    groundTruth: 'hail_damage',
    description: 'Window screen with hailstone punctures and dented frame.',
  },
  {
    id: 'skylight-2',
    filename: 'skylight-2.jpg',
    publicUrl: '/photos/skylight-2.jpg',
    groundTruth: 'hail_damage',
    description: 'Second skylight unit, moderate glazing damage and chipped frame.',
    zone: 'skylight_kitchen',
  },
  {
    id: 'roof-south-edge-1',
    filename: 'roof-south-edge-1.jpg',
    publicUrl: '/photos/roof-south-edge-1.jpg',
    groundTruth: 'hail_damage',
    description: 'South-slope eave row, hail impacts plus lifted shingle tabs.',
    zone: 'roof_south_slope',
  },
  {
    id: 'interior-water-3',
    filename: 'interior-water-3.jpg',
    publicUrl: '/photos/interior-water-3.jpg',
    groundTruth: 'hail_damage',
    description: 'Bedroom ceiling water stain spreading across drywall.',
    zone: 'skylight_kitchen',
  },

  {
    id: 'roof-west-near-1',
    filename: 'roof-west-near-1.jpg',
    publicUrl: '/photos/roof-west-near-1.jpg',
    groundTruth: 'near_duplicate',
    description: 'Near-duplicate of roof-west-1 (slight angle shift).',
  },
  {
    id: 'roof-west-near-2',
    filename: 'roof-west-near-2.jpg',
    publicUrl: '/photos/roof-west-near-2.jpg',
    groundTruth: 'near_duplicate',
    description: 'Near-duplicate of roof-west-1 (closer crop).',
  },
  {
    id: 'gutter-near-2',
    filename: 'gutter-near-2.jpg',
    publicUrl: '/photos/gutter-near-2.jpg',
    groundTruth: 'near_duplicate',
    description: 'Near-duplicate of gutter-1 (different framing).',
  },
  {
    id: 'skylight-near-1',
    filename: 'skylight-near-1.jpg',
    publicUrl: '/photos/skylight-near-1.jpg',
    groundTruth: 'near_duplicate',
    description: 'Near-duplicate of skylight-1 (slight angle shift).',
  },
  {
    id: 'interior-water-near-1',
    filename: 'interior-water-near-1.jpg',
    publicUrl: '/photos/interior-water-near-1.jpg',
    groundTruth: 'near_duplicate',
    description: 'Near-duplicate of interior-water-1 (different exposure).',
  },

  {
    id: 'scale-hand-1',
    filename: 'scale-hand-1.jpg',
    publicUrl: '/photos/scale-hand-1.jpg',
    groundTruth: 'scale_reference',
    description: 'Adult hand beside hail impact crater for scale.',
  },
  {
    id: 'scale-keys-1',
    filename: 'scale-keys-1.jpg',
    publicUrl: '/photos/scale-keys-1.jpg',
    groundTruth: 'scale_reference',
    description: 'Car key fob laid next to hail impact crater.',
  },
  {
    id: 'scale-pen-1',
    filename: 'scale-pen-1.jpg',
    publicUrl: '/photos/scale-pen-1.jpg',
    groundTruth: 'scale_reference',
    description: 'Ballpoint pen across a row of three hail impact craters.',
  },
  {
    id: 'scale-callipers-1',
    filename: 'scale-callipers-1.jpg',
    publicUrl: '/photos/scale-callipers-1.jpg',
    groundTruth: 'scale_reference',
    description: 'Digital calipers measuring hail crater diameter (~1.5 in).',
  },

  {
    id: 'unrelated-shed-1',
    filename: 'unrelated-shed-1.jpg',
    publicUrl: '/photos/unrelated-shed-1.jpg',
    groundTruth: 'unrelated',
    description: 'Backyard storage shed, undamaged.',
  },
  {
    id: 'unrelated-playset-1',
    filename: 'unrelated-playset-1.jpg',
    publicUrl: '/photos/unrelated-playset-1.jpg',
    groundTruth: 'unrelated',
    description: 'Wooden backyard playset (swing + slide), undamaged.',
  },
  {
    id: 'unrelated-patio-furniture-1',
    filename: 'unrelated-patio-furniture-1.jpg',
    publicUrl: '/photos/unrelated-patio-furniture-1.jpg',
    groundTruth: 'unrelated',
    description: 'Patio dining set (table + four chairs), undamaged.',
  },
  {
    id: 'unrelated-hose-1',
    filename: 'unrelated-hose-1.jpg',
    publicUrl: '/photos/unrelated-hose-1.jpg',
    groundTruth: 'unrelated',
    description: 'Coiled garden hose on wall-mounted reel, undamaged.',
  },
  {
    id: 'unrelated-porch-light-1',
    filename: 'unrelated-porch-light-1.jpg',
    publicUrl: '/photos/unrelated-porch-light-1.jpg',
    groundTruth: 'unrelated',
    description: 'Front-porch wall sconce fixture, undamaged.',
  },
  {
    id: 'unrelated-doormat-1',
    filename: 'unrelated-doormat-1.jpg',
    publicUrl: '/photos/unrelated-doormat-1.jpg',
    groundTruth: 'unrelated',
    description: 'Coir welcome mat at the front door, undamaged.',
  },
  {
    id: 'unrelated-bird-feeder-1',
    filename: 'unrelated-bird-feeder-1.jpg',
    publicUrl: '/photos/unrelated-bird-feeder-1.jpg',
    groundTruth: 'unrelated',
    description: 'Wooden bird feeder on a garden pole, undamaged.',
  },
  {
    id: 'unrelated-bicycle-1',
    filename: 'unrelated-bicycle-1.jpg',
    publicUrl: '/photos/unrelated-bicycle-1.jpg',
    groundTruth: 'unrelated',
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

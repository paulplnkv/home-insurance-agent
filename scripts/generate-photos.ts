// One-off generator that overwrites the Lorem Picsum placeholders in
// /public/photos with synthesized photos that match each manifest slot.
// Run with:
//   npm run generate-photos
//   PHOTO_MODEL='bfl/flux-pro-1.1' npm run generate-photos
//   PHOTO_IDS='roof-south-1,scale-coin-1,skylight-1' npm run generate-photos
//
// Default model: openai/gpt-image-1.5 — best photorealism observed in
// quality-check runs (coin/text rendering, glass cracking, scene depth).
// Cost is higher than FLUX (~$0.07/image medium quality). Other tested
// options on the gateway:
//   bfl/flux-pro-1.1, bfl/flux-pro-1.1-ultra,
//   google/imagen-4.0-generate-001, bytedance/seedream-5.0-lite.
//
// gpt-image-1.5 ignores both `aspectRatio` and `seed`; it uses `size`
// instead. The script passes size '1536x1024' (landscape, close to 4:3)
// when the model id starts with 'openai/gpt-image', otherwise the
// standard `aspectRatio: '4:3'` is used. Seeds in this file are kept
// for reference and will still drive determinism on FLUX/Imagen.
//
// PHOTO_IDS (optional): comma-separated list of manifest ids. When set,
// only those photos are regenerated; useful for quality-checking a new
// model on a small subset before committing to a full regen.
//
// Seeds are hardcoded per ID so re-runs are deterministic. The three
// near-duplicate slots reuse the south-slope prompt with seed offsets
// so they read as "same view, slightly different shot" — exactly what
// the Damage agent should tag with shot_types: ['redundant_view'].
//
// Output bytes are written with the manifest's original filename. The
// gateway typically returns PNG; the .jpg extension is preserved so the
// manifest stays untouched, and Next.js / the multimodal API both
// content-sniff happily.
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gateway, generateImage } from 'ai';
import {
  PHOTO_MANIFEST,
  photoFilesystemPath,
  type ScenarioPhoto,
} from '../lib/scenario/photos';

const MODEL_ID = process.env.PHOTO_MODEL ?? 'openai/gpt-image-1.5';
const ASPECT_RATIO = '4:3'; // matches the panel grid's 1024x768 placeholders
const OPENAI_LANDSCAPE_SIZE = '1536x1024'; // closest landscape preset gpt-image-1.5 supports
const IS_OPENAI_IMAGE = MODEL_ID.startsWith('openai/gpt-image');

// Optional id filter. Null = no filter (generate the full manifest).
const ID_FILTER: Set<string> | null = (() => {
  const raw = process.env.PHOTO_IDS?.trim();
  if (!raw) return null;
  const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return ids.length > 0 ? new Set(ids) : null;
})();

// Stable per-photo seeds. 1000-series for primaries; near-dups offset
// from the south-slope primary's seed so they're visibly the same scene.
// (Ignored by openai/gpt-image-1.5 — kept for FLUX/Imagen runs.)
const SEEDS = {
  ROOF_SOUTH: 1001,
  ROOF_SOUTH_2: 1002,
  ROOF_WEST: 1003,
  GUTTER: 1004,
  ROOF_SOUTH_3: 1005,
  ROOF_SOUTH_DETAIL: 1006,
  ROOF_WEST_2: 1007,
  ROOF_WEST_3: 1008,
  GUTTER_2: 1009,
  GUTTER_3: 1010,
  ROOF_SOUTH_NEAR_1: 1051,
  ROOF_SOUTH_NEAR_2: 1052,
  ROOF_SOUTH_NEAR_3: 1053,
  ROOF_SOUTH_NEAR_4: 1054,
  GUTTER_NEAR_1: 1055,
  SCALE_COIN: 1101,
  SCALE_TAPE: 1102,
  SCALE_RULER: 1103,
  SCALE_CARD: 1104,
  SKYLIGHT: 1201,
  INTERIOR_WATER: 1202,
  INTERIOR_WATER_2: 1203,
  NEIGHBOR_FENCE: 1301,
  PARKED_CAR: 1302,
  UNRELATED_MAILBOX: 1303,
  UNRELATED_POOL: 1304,
  UNRELATED_GRILL: 1305,
  UNRELATED_TRASHCAN: 1306,
  UNRELATED_DRIVEWAY: 1307,
  UNRELATED_FLOWERBED: 1308,

  // --- expansion to 60 total ---
  ROOF_RIDGE_CAP: 1011,
  ROOF_VALLEY: 1012,
  ROOF_VENT: 1013,
  ROOF_FLASHING: 1014,
  ROOF_DORMER: 1015,
  ROOF_SOFFIT: 1016,
  SIDING: 1017,
  GARAGE_DOOR: 1018,
  AC_CONDENSER: 1019,
  WINDOW_SCREEN: 1020,
  SKYLIGHT_2: 1021,
  ROOF_SOUTH_EDGE: 1022,
  INTERIOR_WATER_3: 1023,
  ROOF_WEST_NEAR_1: 1056,
  ROOF_WEST_NEAR_2: 1057,
  GUTTER_NEAR_2: 1058,
  SKYLIGHT_NEAR_1: 1059,
  INTERIOR_WATER_NEAR_1: 1060,
  SCALE_HAND: 1105,
  SCALE_KEYS: 1106,
  SCALE_PEN: 1107,
  SCALE_CALLIPERS: 1108,
  UNRELATED_SHED: 1309,
  UNRELATED_PLAYSET: 1310,
  UNRELATED_PATIO_FURNITURE: 1311,
  UNRELATED_HOSE: 1312,
  UNRELATED_PORCH_LIGHT: 1313,
  UNRELATED_DOORMAT: 1314,
  UNRELATED_BIRD_FEEDER: 1315,
  UNRELATED_BICYCLE: 1316,
} as const;

// Negative-prompt suffix appended to every prompt. The major image
// models (FLUX, Imagen, GPT-image) all benefit from explicit "not"
// guidance to suppress watermarks, text overlays, and stylization.
const NEG_TAIL =
  ' Photorealistic photograph, natural daylight, sharp focus. No text, no watermark, no logo, no signature, no people, no illustration, no rendering style.';

const ROOF_SOUTH_PRIMARY_PROMPT =
  'Wide-angle photograph of a residential asphalt-shingle roof slope (south-facing) showing severe hail damage. Multiple circular hail impact craters across the field, granule loss exposing dark shingle base, irregular distribution. Mid-morning daylight, slight downward camera angle from a ladder, suburban Texas neighborhood in background.';

const PROMPTS: Record<string, { prompt: string; seed: number }> = {
  'roof-south-1': {
    prompt: ROOF_SOUTH_PRIMARY_PROMPT,
    seed: SEEDS.ROOF_SOUTH,
  },
  'roof-south-2': {
    prompt:
      'Closer photograph of the same hail-damaged south-slope asphalt-shingle roof, taken from a steeper angle. Granule loss visible across mid-field, several round impact craters in the foreground shingles. Daylight.',
    seed: SEEDS.ROOF_SOUTH_2,
  },
  'roof-west-1': {
    prompt:
      'Photograph of a residential asphalt-shingle roof slope (west-facing) with moderate hail damage. Fewer impact craters than a fully damaged slope, but visible dents, scuffing, and granule scatter. Late-afternoon daylight, slight glare on the shingles.',
    seed: SEEDS.ROOF_WEST,
  },
  'gutter-1': {
    prompt:
      'Close-up photograph of a white-painted aluminum residential rain gutter mounted to a fascia board. Multiple visible hail dents along the front face, denting the metal inward. Daylight, suburban home siding visible in background.',
    seed: SEEDS.GUTTER,
  },

  'roof-south-3': {
    prompt:
      'Wide overhead photograph of a residential asphalt-shingle roof south slope taken from the ridge looking down toward the eaves. Dozens of round hail impact craters with granule loss create dark spots scattered across the entire field of shingles. Mid-morning daylight, suburban Texas neighborhood and other rooftops visible in background.',
    seed: SEEDS.ROOF_SOUTH_3,
  },
  'roof-south-detail-1': {
    prompt:
      'Extreme close-up macro photograph of a single hail impact crater on a brown asphalt-shingle roof surface. Round depression with dark exposed shingle base where ceramic granules were knocked off, scattered loose granules visible at the crater rim. Sharp focus, natural daylight.',
    seed: SEEDS.ROOF_SOUTH_DETAIL,
  },
  'roof-west-2': {
    prompt:
      'Closer photograph of a residential asphalt-shingle roof west slope showing moderate hail damage. Several round impact craters with visible granule loss spread across the foreground shingles, slight scuffing pattern. Late-afternoon golden-hour daylight, mild glare on the shingles.',
    seed: SEEDS.ROOF_WEST_2,
  },
  'roof-west-3': {
    prompt:
      'Photograph of the corner where two slopes meet on a residential asphalt-shingle roof. The west slope is visible on the left, the south slope on the right, both showing hail impact craters and granule loss. Daylight, suburban setting with other roofs in background.',
    seed: SEEDS.ROOF_WEST_3,
  },
  'gutter-2': {
    prompt:
      'Photograph of a white-painted aluminum residential rain gutter section seen from below at an upward angle, showing multiple deep hail dents on the front face. Brown wood fascia board visible above the gutter. Bright daylight, suburban home siding in the background.',
    seed: SEEDS.GUTTER_2,
  },
  'gutter-3': {
    prompt:
      'Photograph of a vertical white-painted aluminum downspout running down the corner of a suburban home. Visible dents along the length of the downspout from falling hail. The downspout connects to a horizontal gutter at the top. Daylight, beige siding visible in background.',
    seed: SEEDS.GUTTER_3,
  },
  'interior-water-2': {
    prompt:
      'Photograph of a residential kitchen ceiling taken from below, showing a larger area of brown water staining spreading from a rectangular skylight opening across to nearby drywall. Indicates water intrusion from above. White painted ceiling, kitchen pendant lights partially visible. Indoor daylight.',
    seed: SEEDS.INTERIOR_WATER_2,
  },

  // Near-duplicates of roof-south-1: same scene, slightly different
  // framing/lens. Same prompt, neighboring seeds → the model produces
  // recognizably the same shot with minor variation.
  'roof-south-near-1': {
    prompt: ROOF_SOUTH_PRIMARY_PROMPT,
    seed: SEEDS.ROOF_SOUTH_NEAR_1,
  },
  'roof-south-near-2': {
    prompt: ROOF_SOUTH_PRIMARY_PROMPT,
    seed: SEEDS.ROOF_SOUTH_NEAR_2,
  },
  'roof-south-near-3': {
    prompt: ROOF_SOUTH_PRIMARY_PROMPT,
    seed: SEEDS.ROOF_SOUTH_NEAR_3,
  },
  'roof-south-near-4': {
    prompt: ROOF_SOUTH_PRIMARY_PROMPT,
    seed: SEEDS.ROOF_SOUTH_NEAR_4,
  },
  'gutter-near-1': {
    prompt:
      'Close-up photograph of a white-painted aluminum residential rain gutter mounted to a fascia board. Multiple visible hail dents along the front face, denting the metal inward. Daylight, suburban home siding visible in background.',
    seed: SEEDS.GUTTER_NEAR_1,
  },

  'scale-coin-1': {
    prompt:
      'Close-up macro photograph of an asphalt-shingle roof surface with a US silver quarter coin placed flat on the shingle next to a circular hail impact crater for size reference. The crater is roughly the same diameter as the coin. Daylight, sharp focus on the coin and crater.',
    seed: SEEDS.SCALE_COIN,
  },
  'scale-tape-1': {
    prompt:
      'Close-up macro photograph of an asphalt-shingle roof surface with a yellow retractable tape measure pulled across a circular hail impact crater. The tape reads approximately 1.5 inches across the crater. Daylight, sharp focus.',
    seed: SEEDS.SCALE_TAPE,
  },
  'scale-ruler-1': {
    prompt:
      'Close-up macro photograph of an asphalt-shingle roof surface with a stainless-steel ruler laid across two adjacent circular hail impact craters for scale. The ruler is marked in inches and the craters span approximately 1.5 to 2 inches. Daylight, sharp focus on the ruler and craters.',
    seed: SEEDS.SCALE_RULER,
  },
  'scale-card-1': {
    prompt:
      'Close-up macro photograph of an asphalt-shingle roof surface with a standard credit-card-sized white plastic ID card placed flat next to a circular hail impact crater for size reference. The crater is roughly half the width of the card. Daylight, sharp focus.',
    seed: SEEDS.SCALE_CARD,
  },
  'skylight-1': {
    prompt:
      'Photograph of a damaged residential kitchen skylight unit set into a sloped asphalt-shingle roof. Cracked outer glazing with visible impact marks consistent with hail. Black metal frame, weathered sealant. Daylight.',
    seed: SEEDS.SKYLIGHT,
  },
  'interior-water-1': {
    prompt:
      'Photograph of a residential kitchen ceiling, taken from below, showing brown water-staining and discoloration around the rectangular base of a skylight opening. Indicates water intrusion from above. Indoor daylight, white painted ceiling.',
    seed: SEEDS.INTERIOR_WATER,
  },

  'neighbor-fence-1': {
    prompt:
      'Photograph of a tall wooden privacy fence between two suburban backyards. Vertical cedar planks, no visible damage. Green lawn in foreground, daylight.',
    seed: SEEDS.NEIGHBOR_FENCE,
  },
  'parked-car-1': {
    prompt:
      'Photograph of a midsize sedan parked in a suburban residential driveway. No visible damage to the vehicle. Concrete driveway, garage door in background, daylight.',
    seed: SEEDS.PARKED_CAR,
  },
  'unrelated-mailbox-1': {
    prompt:
      'Photograph of an undamaged black metal residential mailbox mounted on a wooden post at the curb of a suburban driveway. Green lawn surrounds the post, suburban home visible in the background. Bright daylight.',
    seed: SEEDS.UNRELATED_MAILBOX,
  },
  'unrelated-pool-1': {
    prompt:
      'Photograph of a backyard residential in-ground swimming pool surrounded by a concrete pool deck. Clear blue water, no damage visible to the pool or deck. Patio furniture and a wooden privacy fence in the background. Bright midday daylight.',
    seed: SEEDS.UNRELATED_POOL,
  },
  'unrelated-grill-1': {
    prompt:
      'Photograph of a stainless-steel propane gas grill on a residential back patio. Closed lid, propane tank attached on the side, no visible damage. Concrete patio surface in foreground, wooden privacy fence in background. Daylight.',
    seed: SEEDS.UNRELATED_GRILL,
  },
  'unrelated-trashcan-1': {
    prompt:
      'Photograph of two large rolling residential trash bins, one black for trash and one blue for recycling, lined up at the curb in front of a suburban home. No damage. Concrete driveway and green lawn visible. Daylight.',
    seed: SEEDS.UNRELATED_TRASHCAN,
  },
  'unrelated-driveway-1': {
    prompt:
      'Photograph of an empty residential concrete driveway leading up to a closed white two-car garage door. Brick suburban home behind. No damage visible anywhere in the frame. Bright daylight.',
    seed: SEEDS.UNRELATED_DRIVEWAY,
  },
  'unrelated-flowerbed-1': {
    prompt:
      'Photograph of a residential flowerbed near the front door of a suburban home. Brown mulched bed with green shrubs and colorful flowers, surrounded by a low stone border. No damage visible. Daylight, front porch partially visible in background.',
    seed: SEEDS.UNRELATED_FLOWERBED,
  },

  // --- expansion to 60 total ---

  // Additional hail damage: broader surface variety beyond the four canonical zones.
  'roof-ridge-cap-1': {
    prompt:
      'Photograph of the ridge cap shingles along the peak of a residential asphalt-shingle roof, taken from a low angle looking up at the ridge. Multiple round hail impact craters visible on the overlapping ridge-cap shingles, with granule loss exposing the dark base. Mid-morning daylight, suburban Texas neighborhood visible in background.',
    seed: SEEDS.ROOF_RIDGE_CAP,
  },
  'roof-valley-1': {
    prompt:
      'Photograph of the valley where two slopes of a residential asphalt-shingle roof meet, forming a V-shaped channel. Hail impact craters and granule loss are visible along both sides of the valley, with loose granules collected in the channel itself. Daylight, suburban setting.',
    seed: SEEDS.ROOF_VALLEY,
  },
  'roof-vent-1': {
    prompt:
      'Close-up photograph of a galvanized metal turbine roof vent mounted on a residential asphalt-shingle roof. The dome of the vent is dented and dimpled from hail impacts, several of the curved blades are bent. Daylight, surrounding shingles visible at the base.',
    seed: SEEDS.ROOF_VENT,
  },
  'roof-flashing-1': {
    prompt:
      'Close-up photograph of metal step-flashing where a brick chimney meets a residential asphalt-shingle roof slope. The aluminum flashing is dented and slightly lifted from hail impacts, with cracked sealant along the chimney edge. Daylight, weathered brick visible.',
    seed: SEEDS.ROOF_FLASHING,
  },
  'roof-dormer-1': {
    prompt:
      'Photograph of a small residential roof dormer with its own asphalt-shingle slope and a single window. Hail impact craters and granule loss are visible across the dormer roof face. Daylight, main roof slope visible to either side.',
    seed: SEEDS.ROOF_DORMER,
  },
  'roof-soffit-1': {
    prompt:
      'Close-up photograph of a white vinyl soffit panel mounted under a residential roof eave. The panel shows cracks and impact dents from hail, with one vented section partially split. Daylight, the underside of the fascia board and a section of gutter visible.',
    seed: SEEDS.ROOF_SOFFIT,
  },
  'siding-1': {
    prompt:
      'Photograph of a section of beige vinyl siding on the side of a suburban home, showing multiple round hail impact dings and small cracks across several courses of siding. Daylight, slight shadow cast across the wall.',
    seed: SEEDS.SIDING,
  },
  'garage-door-1': {
    prompt:
      'Photograph of a closed white steel two-car garage door on a suburban home, showing multiple round dents across the upper and middle panels from hail impacts. Bright daylight, concrete driveway visible in foreground.',
    seed: SEEDS.GARAGE_DOOR,
  },
  'ac-condenser-1': {
    prompt:
      'Close-up photograph of an outdoor residential air-conditioner condenser unit beside a suburban home. The aluminum cooling fins on the side of the unit are visibly bent and flattened in multiple spots from hail impacts. Daylight, beige house siding visible behind.',
    seed: SEEDS.AC_CONDENSER,
  },
  'window-screen-1': {
    prompt:
      'Close-up photograph of a residential window screen on the side of a suburban home. The fiberglass mesh has multiple visible tears and punctures consistent with hailstones, the white aluminum frame is slightly dented. Daylight, interior of the home faintly visible through the window.',
    seed: SEEDS.WINDOW_SCREEN,
  },
  'skylight-2': {
    prompt:
      'Photograph of a second residential skylight unit set into a sloped asphalt-shingle roof, showing moderate hail damage: small impact marks on the outer glazing and chipped paint on the metal frame, but no full crack. Daylight, surrounding shingles also showing minor granule loss.',
    seed: SEEDS.SKYLIGHT_2,
  },
  'roof-south-edge-1': {
    prompt:
      'Photograph of the shingle edge along the eave of a residential asphalt-shingle roof south slope, taken from below at an upward angle. The bottom row of shingles shows hail impact craters with granule loss, and several shingle tabs are lifted and partially torn. Daylight, white gutter visible at the bottom of the frame.',
    seed: SEEDS.ROOF_SOUTH_EDGE,
  },
  'interior-water-3': {
    prompt:
      'Photograph of a residential bedroom ceiling taken from below, showing a brown circular water stain spreading across the white painted drywall. Indicates water intrusion from above. Indoor daylight, corner of a bedroom dresser and wall partially visible.',
    seed: SEEDS.INTERIOR_WATER_3,
  },

  // Near-duplicates: same prompt as the corresponding primary, different
  // seeds → "same scene, slightly different shot" for the dedup logic.
  'roof-west-near-1': {
    prompt:
      'Photograph of a residential asphalt-shingle roof slope (west-facing) with moderate hail damage. Fewer impact craters than a fully damaged slope, but visible dents, scuffing, and granule scatter. Late-afternoon daylight, slight glare on the shingles.',
    seed: SEEDS.ROOF_WEST_NEAR_1,
  },
  'roof-west-near-2': {
    prompt:
      'Photograph of a residential asphalt-shingle roof slope (west-facing) with moderate hail damage. Fewer impact craters than a fully damaged slope, but visible dents, scuffing, and granule scatter. Late-afternoon daylight, slight glare on the shingles.',
    seed: SEEDS.ROOF_WEST_NEAR_2,
  },
  'gutter-near-2': {
    prompt:
      'Close-up photograph of a white-painted aluminum residential rain gutter mounted to a fascia board. Multiple visible hail dents along the front face, denting the metal inward. Daylight, suburban home siding visible in background.',
    seed: SEEDS.GUTTER_NEAR_2,
  },
  'skylight-near-1': {
    prompt:
      'Photograph of a damaged residential kitchen skylight unit set into a sloped asphalt-shingle roof. Cracked outer glazing with visible impact marks consistent with hail. Black metal frame, weathered sealant. Daylight.',
    seed: SEEDS.SKYLIGHT_NEAR_1,
  },
  'interior-water-near-1': {
    prompt:
      'Photograph of a residential kitchen ceiling, taken from below, showing brown water-staining and discoloration around the rectangular base of a skylight opening. Indicates water intrusion from above. Indoor daylight, white painted ceiling.',
    seed: SEEDS.INTERIOR_WATER_NEAR_1,
  },

  // Scale references: different reference objects beside a hail crater.
  'scale-hand-1': {
    prompt:
      'Close-up macro photograph of an asphalt-shingle roof surface with an adult human hand laid flat next to a circular hail impact crater for size reference. The crater is roughly the diameter of a thumbnail. Daylight, sharp focus on the hand and crater.',
    seed: SEEDS.SCALE_HAND,
  },
  'scale-keys-1': {
    prompt:
      'Close-up macro photograph of an asphalt-shingle roof surface with a black plastic car key fob placed flat beside a circular hail impact crater for size reference. The crater is roughly two-thirds the length of the fob. Daylight, sharp focus.',
    seed: SEEDS.SCALE_KEYS,
  },
  'scale-pen-1': {
    prompt:
      'Close-up macro photograph of an asphalt-shingle roof surface with a black ballpoint pen laid horizontally across a row of three circular hail impact craters for size reference. Daylight, sharp focus on the pen and craters.',
    seed: SEEDS.SCALE_PEN,
  },
  'scale-callipers-1': {
    prompt:
      'Close-up macro photograph of an asphalt-shingle roof surface with a stainless-steel digital caliper measuring the diameter of a circular hail impact crater. The caliper readout displays approximately 1.5 inches. Daylight, sharp focus on the caliper jaws and crater.',
    seed: SEEDS.SCALE_CALLIPERS,
  },

  // Unrelated: common backyard / front-of-house objects with no storm damage.
  'unrelated-shed-1': {
    prompt:
      'Photograph of a small wooden backyard storage shed with a peaked asphalt-shingle roof and double doors. No visible damage to the shed, roof, or doors. Green lawn surrounds the shed, suburban privacy fence visible in background. Daylight.',
    seed: SEEDS.UNRELATED_SHED,
  },
  'unrelated-playset-1': {
    prompt:
      'Photograph of a wooden residential backyard playset with a swing set, slide, and small platform fort. No visible damage. Green lawn underneath, suburban privacy fence in background. Bright daylight.',
    seed: SEEDS.UNRELATED_PLAYSET,
  },
  'unrelated-patio-furniture-1': {
    prompt:
      'Photograph of a residential outdoor patio dining set with a round glass-top table and four matching wicker chairs with cushions. No visible damage. Concrete patio surface, wooden privacy fence and a section of suburban home visible in background. Daylight.',
    seed: SEEDS.UNRELATED_PATIO_FURNITURE,
  },
  'unrelated-hose-1': {
    prompt:
      'Photograph of a coiled green rubber garden hose hung on a wall-mounted hose reel beside the exterior wall of a suburban home. No visible damage to the hose, reel, or wall. Concrete patio surface and beige siding visible. Daylight.',
    seed: SEEDS.UNRELATED_HOSE,
  },
  'unrelated-porch-light-1': {
    prompt:
      'Photograph of a black metal-and-glass wall-mounted porch light fixture beside the front door of a suburban home. No visible damage to the fixture or surrounding trim. Daylight, the painted front door and trim visible.',
    seed: SEEDS.UNRELATED_PORCH_LIGHT,
  },
  'unrelated-doormat-1': {
    prompt:
      'Photograph of a brown coir welcome mat placed in front of the closed white front door of a suburban home. No visible damage to the mat, door, or threshold. Daylight, painted porch flooring visible.',
    seed: SEEDS.UNRELATED_DOORMAT,
  },
  'unrelated-bird-feeder-1': {
    prompt:
      'Photograph of a wooden residential bird feeder mounted on a green metal garden pole in a suburban backyard. No visible damage to the feeder or pole. Green lawn surrounds the pole, shrubs and a wooden privacy fence in background. Daylight.',
    seed: SEEDS.UNRELATED_BIRD_FEEDER,
  },
  'unrelated-bicycle-1': {
    prompt:
      'Photograph of a blue adult bicycle leaning against the front porch railing of a suburban home. No visible damage to the bicycle, railing, or porch. Daylight, painted porch flooring and front of the home visible.',
    seed: SEEDS.UNRELATED_BICYCLE,
  },
};

async function generateOne(photo: ScenarioPhoto) {
  const spec = PROMPTS[photo.id];
  if (!spec) {
    console.warn(`[skip] no prompt for ${photo.id}`);
    return;
  }

  const fullPrompt = spec.prompt + NEG_TAIL;
  console.log(`[${photo.id}] generating (seed=${spec.seed})…`);

  // gpt-image-1.5 ignores aspectRatio + seed; it accepts size instead.
  // Force landscape so panel grid doesn't get portrait outputs.
  const dimensionParams = IS_OPENAI_IMAGE
    ? { size: OPENAI_LANDSCAPE_SIZE as `${number}x${number}` }
    : { aspectRatio: ASPECT_RATIO as `${number}:${number}` };

  const start = Date.now();
  const { image } = await generateImage({
    model: gateway.imageModel(MODEL_ID),
    prompt: fullPrompt,
    ...dimensionParams,
    seed: spec.seed,
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const outPath = resolve(photoFilesystemPath(photo));
  await writeFile(outPath, image.uint8Array);
  console.log(
    `[${photo.id}] wrote ${outPath} (${image.mediaType ?? 'unknown type'}, ${elapsed}s)`
  );
}

async function main() {
  console.log(`Model: ${MODEL_ID}`);

  const manifestIds = new Set(PHOTO_MANIFEST.map((p) => p.id));
  if (ID_FILTER) {
    for (const id of ID_FILTER) {
      if (!manifestIds.has(id)) {
        console.warn(`[warn] PHOTO_IDS contains unknown id: ${id}`);
      }
    }
  }

  const targets = ID_FILTER
    ? PHOTO_MANIFEST.filter((p) => ID_FILTER.has(p.id))
    : PHOTO_MANIFEST;

  console.log(`Generating ${targets.length} photos…\n`);

  let failed = 0;
  for (const p of targets) {
    try {
      await generateOne(p);
    } catch (err) {
      failed += 1;
      console.error(`[${p.id}] failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nDone. ${targets.length - failed}/${targets.length} succeeded.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

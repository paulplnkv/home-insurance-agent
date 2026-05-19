'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { XactimateOutput } from '@/components/workbench/xactimate-output';
import { PHOTO_MANIFEST } from '@/lib/scenario/photos';
import {
  COMPONENT_TAGS,
  DAMAGE_ZONES,
  FINDING_TAGS,
  MATERIAL_TAGS,
  NON_PERIL_TAGS,
  NO_DAMAGE_TAGS,
  PERIL_TAGS,
  PRIMARY_CLASSIFICATIONS,
  SHOT_TYPE_TAGS,
  type ComponentTag,
  type DamageAgentOutput,
  type DamageZone,
  type FindingTag,
  type MaterialTag,
  type NoDamageTag,
  type NonPerilTag,
  type PerilTag,
  type PrimaryClassification,
  type ShotTypeTag,
} from '@/lib/agents/photos/schema';
import { cn } from '@/lib/utils';

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type StreamingDamage = DeepPartial<DamageAgentOutput>;

// Closed-set lookups for partial-string streaming guards. The agent
// can emit a half-finished token mid-stream (e.g. "asphalt_arch"),
// so every tag value is validated against its enum before rendering.
const PERIL_SET = new Set<PerilTag>(PERIL_TAGS);
const NON_PERIL_SET = new Set<NonPerilTag>(NON_PERIL_TAGS);
const NO_DAMAGE_SET = new Set<NoDamageTag>(NO_DAMAGE_TAGS);
const COMPONENT_SET = new Set<ComponentTag>(COMPONENT_TAGS);
const MATERIAL_SET = new Set<MaterialTag>(MATERIAL_TAGS);
const SHOT_TYPE_SET = new Set<ShotTypeTag>(SHOT_TYPE_TAGS);
const FINDING_SET = new Set<FindingTag>(FINDING_TAGS);
const ZONE_SET = new Set<DamageZone>(DAMAGE_ZONES);
const PRIMARY_SET = new Set<PrimaryClassification>(PRIMARY_CLASSIFICATIONS);

const PERIL_LABEL: Record<PerilTag, string> = {
  hail: 'Hail',
  wind: 'Wind',
  debris_impact: 'Debris impact',
  water_intrusion: 'Water intrusion',
};

const NON_PERIL_LABEL: Record<NonPerilTag, string> = {
  wear_and_tear: 'Wear & age',
  deferred_maintenance: 'Deferred maintenance',
  mechanical_damage: 'Mechanical',
  improper_installation: 'Improper installation',
  rust_corrosion: 'Rust / corrosion',
  foot_traffic: 'Foot-traffic',
};

const NO_DAMAGE_LABEL: Record<NoDamageTag, string> = {
  no_damage_confirmed: 'No damage',
  na_component_absent: 'Out of scope',
};

const COMPONENT_LABEL: Record<ComponentTag, string> = {
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

const MATERIAL_LABEL: Record<MaterialTag, string> = {
  asphalt_architectural: 'Asphalt arch.',
  asphalt_3tab: 'Asphalt 3-tab',
  metal_galvanized: 'Galv. metal',
  aluminum: 'Aluminum',
  vinyl_siding: 'Vinyl siding',
  vinyl_soffit: 'Vinyl soffit',
  glass_glazing: 'Glass',
  steel_panel: 'Steel',
};

const SHOT_TYPE_LABEL: Record<ShotTypeTag, string> = {
  overview: 'Overview',
  mid_range: 'Mid-range',
  close_up: 'Close-up',
  macro: 'Macro',
  scale_reference_in_frame: 'Scale ref.',
  ground_level_context: 'Ground-level',
  redundant_view: 'Redundant view',
};

const FINDING_LABEL: Record<FindingTag, string> = {
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

// Only the meaningful shot-type tags get a chip — overview/mid-range/
// close-up/macro/ground-level are inferred from the image already and
// would just add visual noise.
const NOTABLE_SHOT_TYPES = new Set<ShotTypeTag>([
  'scale_reference_in_frame',
  'redundant_view',
]);

const SEVERITY_BADGE: Record<
  'minor' | 'moderate' | 'major',
  { variant: 'default' | 'secondary' | 'destructive'; label: string }
> = {
  minor: { variant: 'secondary', label: 'Minor' },
  moderate: { variant: 'default', label: 'Moderate' },
  major: { variant: 'destructive', label: 'Major' },
};

const PERIL_CONSISTENCY_BADGE: Record<
  'consistent' | 'inconsistent' | 'inconclusive',
  { variant: 'default' | 'secondary' | 'destructive'; label: string }
> = {
  consistent: { variant: 'default', label: 'Consistent with reported peril' },
  inconsistent: { variant: 'destructive', label: 'Inconsistent with peril' },
  inconclusive: { variant: 'secondary', label: 'Peril match inconclusive' },
};

const ZONE_LABELS: Record<DamageZone, string> = {
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

export function DamageOutput({
  object,
  isStreaming,
}: {
  object: StreamingDamage | undefined;
  isStreaming: boolean;
}) {
  const classifications = object?.classifications ?? [];
  const zones = object?.zones ?? [];
  const classifiedCount = classifications.filter((c) => c?.photo_id).length;

  return (
    <div className="flex flex-col gap-6 text-sm">
      <PerilRow consistency={object?.peril_consistency} streaming={isStreaming} />

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          Photo classification ({classifiedCount}/{PHOTO_MANIFEST.length})
          {isStreaming && classifiedCount < PHOTO_MANIFEST.length ? (
            <Shimmer className="text-xs normal-case tracking-normal">
              classifying…
            </Shimmer>
          ) : null}
        </h3>
        <PhotoGrid classifications={classifications} streaming={isStreaming} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          Damage manifest ({zones.length})
          {isStreaming && zones.length === 0 ? (
            <Shimmer className="text-xs normal-case tracking-normal">
              grouping zones…
            </Shimmer>
          ) : null}
        </h3>
        <ZoneManifest zones={zones} />
      </section>

      <XactimateOutput object={object} isStreaming={isStreaming} />
    </div>
  );
}

function PerilRow({
  consistency,
  streaming,
}: {
  consistency: string | undefined;
  streaming: boolean;
}) {
  if (!consistency) {
    return streaming ? (
      <Shimmer className="text-xs">
        Assessing peril consistency from photo set…
      </Shimmer>
    ) : null;
  }
  const cfg = PERIL_CONSISTENCY_BADGE[consistency as keyof typeof PERIL_CONSISTENCY_BADGE];
  if (!cfg) return null;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

function PhotoGrid({
  classifications,
  streaming,
}: {
  classifications: NonNullable<StreamingDamage['classifications']>;
  streaming: boolean;
}) {
  const byId = new Map<string, NonNullable<typeof classifications[number]>>();
  for (const c of classifications) {
    if (c?.photo_id) byId.set(c.photo_id, c);
  }

  // Out-of-scope photos sink to the bottom of the grid once classified
  // as no_damage — preserves manifest order otherwise. Stable sort so
  // unclassified photos stay where the adjuster expects them while the
  // model is still streaming.
  const ordered = [...PHOTO_MANIFEST]
    .map((p, idx) => {
      const c = byId.get(p.id);
      const primary =
        c?.primary_classification &&
        PRIMARY_SET.has(c.primary_classification as PrimaryClassification)
          ? (c.primary_classification as PrimaryClassification)
          : null;
      return { p, idx, bucket: primary === 'no_damage' ? 1 : 0 };
    })
    .sort((a, b) => a.bucket - b.bucket || a.idx - b.idx);

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {ordered.map(({ p }) => {
        const c = byId.get(p.id);
        const primary =
          c?.primary_classification && PRIMARY_SET.has(c.primary_classification as PrimaryClassification)
            ? (c.primary_classification as PrimaryClassification)
            : null;
        const shotTypes = filterValid(c?.shot_types, SHOT_TYPE_SET);
        const isOutOfScope = primary === 'no_damage';
        const isRedundant = shotTypes.includes('redundant_view');

        return (
          <li
            key={p.id}
            className={cn(
              'flex flex-col gap-1.5 overflow-hidden rounded-md border bg-card p-2 transition-opacity',
              isOutOfScope && 'opacity-50 grayscale',
              !isOutOfScope && isRedundant && 'opacity-75'
            )}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded">
              <Image
                src={p.publicUrl}
                alt={p.id}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate font-mono text-[10px] text-muted-foreground">
                {p.id}
              </code>
              {typeof c?.confidence === 'number' ? (
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {(c.confidence * 100).toFixed(0)}%
                </span>
              ) : null}
            </div>
            <PhotoChips classification={c} streaming={streaming} />
            {c?.rationale ? (
              <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                {c.rationale}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function PhotoChips({
  classification,
  streaming,
}: {
  classification:
    | NonNullable<NonNullable<StreamingDamage['classifications']>[number]>
    | undefined;
  streaming: boolean;
}) {
  if (!classification) {
    return (
      <div className="min-h-[20px]">
        {streaming ? (
          <Shimmer className="text-[10px]">classifying…</Shimmer>
        ) : null}
      </div>
    );
  }

  const perilTags = filterValid(classification.peril, PERIL_SET);
  const nonPerilTags = filterValid(classification.non_peril, NON_PERIL_SET);
  const noDamageTags = filterValid(classification.no_damage, NO_DAMAGE_SET);
  const findings = filterValid(classification.findings, FINDING_SET);
  const shotTypes = filterValid(classification.shot_types, SHOT_TYPE_SET).filter(
    (s) => NOTABLE_SHOT_TYPES.has(s)
  );
  const component =
    classification.component && COMPONENT_SET.has(classification.component as ComponentTag)
      ? (classification.component as ComponentTag)
      : null;
  const material =
    classification.material && MATERIAL_SET.has(classification.material as MaterialTag)
      ? (classification.material as MaterialTag)
      : null;

  const empty =
    perilTags.length +
      nonPerilTags.length +
      noDamageTags.length +
      findings.length +
      shotTypes.length +
      (component ? 1 : 0) +
      (material ? 1 : 0) ===
    0;

  if (empty) {
    return (
      <div className="min-h-[20px]">
        {streaming ? (
          <Shimmer className="text-[10px]">classifying…</Shimmer>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-[20px] flex-wrap gap-1">
      {perilTags.map((t) => (
        <Chip key={`p-${t}`} variant="peril">
          {PERIL_LABEL[t]}
        </Chip>
      ))}
      {nonPerilTags.map((t) => (
        <Chip key={`np-${t}`} variant="non_peril">
          {NON_PERIL_LABEL[t]}
        </Chip>
      ))}
      {noDamageTags.map((t) => (
        <Chip key={`nd-${t}`} variant="no_damage">
          {NO_DAMAGE_LABEL[t]}
        </Chip>
      ))}
      {findings.map((t) => (
        <Chip key={`f-${t}`} variant="finding">
          {FINDING_LABEL[t]}
        </Chip>
      ))}
      {component ? (
        <Chip variant="component">{COMPONENT_LABEL[component]}</Chip>
      ) : null}
      {material ? (
        <Chip variant="material">{MATERIAL_LABEL[material]}</Chip>
      ) : null}
      {shotTypes.map((t) => (
        <Chip key={`s-${t}`} variant="shot">
          {SHOT_TYPE_LABEL[t]}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  variant,
  children,
}: {
  variant:
    | 'peril'
    | 'non_peril'
    | 'no_damage'
    | 'material'
    | 'shot'
    | 'component'
    | 'finding'
    | 'metadata';
  children: React.ReactNode;
}) {
  return (
    <Badge variant={variant} className="text-[10px]">
      {children}
    </Badge>
  );
}

function filterValid<T extends string>(
  raw: unknown,
  allowed: ReadonlySet<T>
): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (v): v is T => typeof v === 'string' && allowed.has(v as T)
  );
}

function ZoneManifest({
  zones,
}: {
  zones: NonNullable<StreamingDamage['zones']>;
}) {
  if (zones.length === 0) {
    return (
      <p className="text-xs italic text-muted-foreground">No zones yet.</p>
    );
  }
  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Zone</th>
            <th className="px-3 py-2 text-left font-medium">Severity</th>
            <th className="px-3 py-2 text-left font-medium">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((z, i) => {
            // Partial-string streaming guards: severity / zone arrive
            // mid-token and can briefly be a non-key string.
            const rawSev = z?.severity;
            const sev =
              rawSev && rawSev in SEVERITY_BADGE
                ? (rawSev as keyof typeof SEVERITY_BADGE)
                : null;
            const rawZone = z?.zone;
            const zone =
              rawZone && ZONE_SET.has(rawZone as DamageZone)
                ? (rawZone as DamageZone)
                : null;
            return zone ? (
              <tr key={`${zone}-${i}`} className="border-t">
                <td className="px-3 py-2 font-medium">{ZONE_LABELS[zone]}</td>
                <td className="px-3 py-2">
                  {sev ? (
                    <Badge variant={SEVERITY_BADGE[sev].variant}>
                      {SEVERITY_BADGE[sev].label}
                    </Badge>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {z?.evidence ?? ''}
                </td>
              </tr>
            ) : null;
          })}
        </tbody>
      </table>
    </div>
  );
}

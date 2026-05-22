'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { PageCard } from '@/components/workbench/agent-page';
import { XactimateOutput } from '@/components/workbench/xactimate-output';
import { PHOTO_MANIFEST } from '@/lib/scenario/photos';
import {
  COMPONENT_TAGS,
  CONFIDENCE_ROUTING_THRESHOLD,
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
import {
  COMPONENT_LABEL,
  FINDING_LABEL,
  MATERIAL_LABEL,
  NON_PERIL_LABEL,
  NO_DAMAGE_LABEL,
  PERIL_LABEL,
  SHOT_TYPE_LABEL,
  ZONE_LABELS,
} from '@/lib/agents/photos/labels';
import { PhotoDetailDialog } from '@/components/workbench/photo-detail-dialog';
import { formatCurrency, formatDateTime } from '@/lib/scenario/claim';
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

// Only the meaningful shot-type tags get a chip — overview/mid-range/
// close-up/macro/ground-level are inferred from the image already and
// would just add visual noise.
const NOTABLE_SHOT_TYPES = new Set<ShotTypeTag>([
  'scale_reference_in_frame',
  'redundant_view',
]);

const SEVERITY_BADGE: Record<
  'minor' | 'moderate' | 'major' | 'severe',
  {
    variant:
      | 'severity_minor'
      | 'severity_moderate'
      | 'severity_major'
      | 'severity_severe';
    label: string;
  }
> = {
  minor: { variant: 'severity_minor', label: 'Minor' },
  moderate: { variant: 'severity_moderate', label: 'Moderate' },
  major: { variant: 'severity_major', label: 'Major' },
  severe: { variant: 'severity_severe', label: 'Severe' },
};

const PERIL_CONSISTENCY_BADGE: Record<
  'consistent' | 'inconsistent' | 'inconclusive',
  { variant: 'default' | 'secondary' | 'destructive'; label: string }
> = {
  consistent: { variant: 'default', label: 'Consistent with reported peril' },
  inconsistent: { variant: 'destructive', label: 'Inconsistent with peril' },
  inconclusive: { variant: 'secondary', label: 'Peril match inconclusive' },
};

export function DamageOutput({
  object,
  isStreaming,
  endedAt,
}: {
  object: StreamingDamage | undefined;
  isStreaming: boolean;
  endedAt: number | null;
}) {
  const classifications = object?.classifications ?? [];
  const zones = object?.zones ?? [];

  // Partition photos into Scope vs Out-of-scope buckets up front so each
  // sub-section can report its own count and grid layout.
  const byId = new Map<
    string,
    NonNullable<(typeof classifications)[number]>
  >();
  for (const c of classifications) {
    if (c?.photo_id) byId.set(c.photo_id, c);
  }
  type ScenarioPhoto = (typeof PHOTO_MANIFEST)[number];
  const inScope: ScenarioPhoto[] = [];
  const outOfScope: ScenarioPhoto[] = [];
  for (const photo of PHOTO_MANIFEST) {
    const c = byId.get(photo.id);
    const primary =
      c?.primary_classification &&
      PRIMARY_SET.has(c.primary_classification as PrimaryClassification)
        ? (c.primary_classification as PrimaryClassification)
        : null;
    if (primary === 'no_damage') outOfScope.push(photo);
    else inScope.push(photo);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageCard>
        <div className="flex flex-col gap-6">
          <PhotoSection
            heading={`Scope (${inScope.length})`}
            photos={inScope}
            byId={byId}
            streaming={isStreaming}
            isOutOfScope={false}
          />
          {outOfScope.length > 0 ? (
            <PhotoSection
              heading={`Out of scope (${outOfScope.length})`}
              photos={outOfScope}
              byId={byId}
              streaming={isStreaming}
              isOutOfScope
            />
          ) : null}
        </div>
      </PageCard>

      <PageCard>
        <h3 className="font-heading pb-4 text-xl font-semibold text-[var(--ink)]">
          Damage manifest ({zones.length})
          {isStreaming && zones.length === 0 ? (
            <Shimmer className="ml-2 text-sm font-normal normal-case tracking-normal">
              grouping zones…
            </Shimmer>
          ) : null}
        </h3>
        <ZoneManifest zones={zones} />
      </PageCard>

      <XactimateOutput object={object} isStreaming={isStreaming} />

      <ExtraSignals
        consistency={object?.peril_consistency}
        zones={zones}
        endedAt={endedAt}
        streaming={isStreaming}
      />
    </div>
  );
}

function PhotoSection({
  heading,
  photos,
  byId,
  streaming,
  isOutOfScope,
}: {
  heading: string;
  photos: (typeof PHOTO_MANIFEST)[number][];
  byId: Map<string, NonNullable<StreamingDamage['classifications']>[number]>;
  streaming: boolean;
  isOutOfScope: boolean;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">
        {heading}
      </h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p) => (
          <li key={p.id} className="contents">
            <PhotoCard
              photo={p}
              classification={byId.get(p.id)}
              streaming={streaming}
              isOutOfScope={isOutOfScope}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PhotoCard({
  photo,
  classification,
  streaming,
  isOutOfScope,
}: {
  photo: (typeof PHOTO_MANIFEST)[number];
  classification:
    | NonNullable<NonNullable<StreamingDamage['classifications']>[number]>
    | undefined;
  streaming: boolean;
  isOutOfScope: boolean;
}) {
  return (
    <PhotoDetailDialog
      photo={photo}
      rationale={
        typeof classification?.rationale === 'string'
          ? classification.rationale
          : undefined
      }
      triggerClassName={cn(
        'flex w-full flex-col items-start gap-2 overflow-hidden rounded-lg bg-white p-3 text-left shadow-[0_0_20px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_0_28px_rgba(0,0,0,0.12)]',
      )}
    >
      <div
        className={cn(
          'relative aspect-[4/3] w-full overflow-hidden rounded',
          isOutOfScope && 'opacity-50',
        )}
      >
        <Image
          src={photo.publicUrl}
          alt={photo.id}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <code className="font-mono text-sm text-[var(--ink-soft)]">
        {photo.id}
      </code>
      {isOutOfScope ? (
        <Badge variant="severity_minor">Out of scope</Badge>
      ) : (
        <PhotoChips classification={classification} streaming={streaming} />
      )}
      {classification?.rationale ? (
        <span className="line-clamp-3 block text-sm leading-snug text-[var(--ink-soft)]">
          {classification.rationale}
        </span>
      ) : null}
    </PhotoDetailDialog>
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
      <div className="min-h-[24px]">
        {streaming ? (
          <Shimmer className="text-sm">classifying…</Shimmer>
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
      <div className="min-h-[24px]">
        {streaming ? (
          <Shimmer className="text-sm">classifying…</Shimmer>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-[24px] flex-wrap gap-1.5">
      {perilTags.map((t) => (
        <Badge key={`p-${t}`} variant="peril" className="text-sm">
          {PERIL_LABEL[t]}
        </Badge>
      ))}
      {nonPerilTags.map((t) => (
        <Badge key={`np-${t}`} variant="non_peril" className="text-sm">
          {NON_PERIL_LABEL[t]}
        </Badge>
      ))}
      {noDamageTags.map((t) => (
        <Badge key={`nd-${t}`} variant="no_damage" className="text-sm">
          {NO_DAMAGE_LABEL[t]}
        </Badge>
      ))}
      {findings.map((t) => (
        <Badge key={`f-${t}`} variant="finding" className="text-sm">
          {FINDING_LABEL[t]}
        </Badge>
      ))}
      {component ? (
        <Badge variant="component" className="text-sm">
          {COMPONENT_LABEL[component]}
        </Badge>
      ) : null}
      {material ? (
        <Badge variant="material" className="text-sm">
          {MATERIAL_LABEL[material]}
        </Badge>
      ) : null}
      {shotTypes.map((t) => (
        <Badge key={`s-${t}`} variant="shot" className="text-sm">
          {SHOT_TYPE_LABEL[t]}
        </Badge>
      ))}
    </div>
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
      <p className="text-sm italic text-muted-foreground">No zones yet.</p>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line-soft)]">
      <table className="w-full text-sm">
        <thead className="bg-[#edf3ff] text-base">
          <tr>
            <th className="px-3 py-4 text-left font-semibold text-[var(--brand-blue)]">
              ZONE
            </th>
            <th className="w-[140px] px-3 py-4 text-left font-semibold text-[var(--brand-blue)]">
              SEVERITY
            </th>
            <th className="px-3 py-4 text-left font-semibold text-[var(--brand-blue)]">
              EVIDENCE
            </th>
          </tr>
        </thead>
        <tbody>
          {zones.map((z, i) => {
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
            const confidence =
              typeof z?.confidence === 'number' ? z.confidence : null;
            return zone ? (
              <Fragment key={`${zone}-${i}`}>
                <tr className="border-t border-[var(--line-soft)] align-top">
                  <td className="px-3 py-4 text-base text-[var(--ink)]">
                    {ZONE_LABELS[zone]}
                  </td>
                  <td className="px-3 py-4">
                    {sev ? (
                      <Badge variant={SEVERITY_BADGE[sev].variant}>
                        {SEVERITY_BADGE[sev].label}
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-3 py-4 text-base text-[var(--ink)]">
                    {z?.findings_summary ?? ''}
                  </td>
                </tr>
                {confidence !== null ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="border-t border-dashed border-[var(--line-soft)] px-3 pb-3 pt-2"
                    >
                      {confidence >= CONFIDENCE_ROUTING_THRESHOLD ? (
                        <span className="text-xs text-muted-foreground">
                          Confidence {confidence.toFixed(2)} — autonomous output
                        </span>
                      ) : (
                        <span className="text-xs text-amber-900 dark:text-amber-300">
                          <span aria-hidden>⚠️</span> Confidence{' '}
                          {confidence.toFixed(2)} — routed to adjuster review
                        </span>
                      )}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ) : null;
          })}
        </tbody>
      </table>
    </div>
  );
}

// Sections retained for backend signal (peril check, write-back receipt,
// contractor variance). Not in Figma; rendered below the Figma-defined
// blocks so they remain visible while preserving the canonical layout.
function ExtraSignals({
  consistency,
  zones,
  endedAt,
  streaming,
}: {
  consistency: string | undefined;
  zones: NonNullable<StreamingDamage['zones']>;
  endedAt: number | null;
  streaming: boolean;
}) {
  const hasPeril = Boolean(consistency);
  const hasEstimate = zones.length > 0;
  const hasWriteBack = endedAt != null;
  const showShimmer = streaming && !consistency;
  if (!hasPeril && !hasEstimate && !hasWriteBack && !showShimmer) return null;

  return (
    <PageCard>
      <div className="flex flex-col gap-4">
        {showShimmer ? (
          <Shimmer className="text-sm">
            Assessing peril consistency from photo set…
          </Shimmer>
        ) : null}
        {hasPeril ? <PerilRow consistency={consistency!} /> : null}
        {hasEstimate ? <EstimateComparison /> : null}
        {hasWriteBack ? <WriteBackStatusLine endedAt={endedAt!} /> : null}
      </div>
    </PageCard>
  );
}

function WriteBackStatusLine({ endedAt }: { endedAt: number }) {
  return (
    <p className="text-sm text-muted-foreground">
      <span aria-hidden>✅ </span>
      Damage manifest written to claim file by M6b ·{' '}
      {formatDateTime(new Date(endedAt).toISOString())}
    </p>
  );
}

function PerilRow({ consistency }: { consistency: string }) {
  const cfg =
    PERIL_CONSISTENCY_BADGE[consistency as keyof typeof PERIL_CONSISTENCY_BADGE];
  if (!cfg) return null;
  return (
    <div>
      <Badge variant={cfg.variant}>{cfg.label}</Badge>
    </div>
  );
}

function EstimateComparison() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-heading text-base font-semibold text-[var(--ink)]">
        Estimate comparison
      </h3>
      <div className="flex flex-col gap-2 rounded-lg border border-[var(--line-soft)] bg-card p-3 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-muted-foreground">
            M6b Independent Estimate (photo-based)
          </span>
          <span className="font-medium tabular-nums">
            {formatCurrency(11_240)} RCV (est.)
          </span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-muted-foreground">
            Contractor Estimate (Lone Star Premier)
          </span>
          <span className="font-medium tabular-nums">
            {formatCurrency(19_840)} RCV
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          <Badge variant="destructive" className="gap-1">
            <span aria-hidden>⚠️</span>
            VARIANCE: {formatCurrency(8_600)} (43%)
          </Badge>
          <span className="text-sm">
            Contractor scope not supported by photo evidence
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Contractor bids 32 SQ full replacement; M6b finds actionable damage on
          south slope only (~12 SQ). Recommend carrier-prepared estimate before
          approving contractor scope.
        </p>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { XactimateOutput } from '@/components/workbench/xactimate-output';
import { PHOTO_MANIFEST } from '@/lib/scenario/photos';
import type {
  DamageAgentOutput,
  PHOTO_LABELS,
} from '@/lib/agents/photos/schema';
import { cn } from '@/lib/utils';

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type StreamingDamage = DeepPartial<DamageAgentOutput>;

type PhotoLabel = (typeof PHOTO_LABELS)[number];

const LABEL_BADGE: Record<
  PhotoLabel,
  { variant: 'default' | 'secondary' | 'destructive'; label: string }
> = {
  hail_damage: { variant: 'destructive', label: 'Hail damage' },
  scale_reference: { variant: 'default', label: 'Scale reference' },
  near_duplicate: { variant: 'secondary', label: 'Near-duplicate' },
  unrelated: { variant: 'secondary', label: 'Unrelated' },
};

const SEVERITY_BADGE: Record<
  'minor' | 'moderate' | 'major',
  { variant: 'default' | 'secondary' | 'destructive'; label: string }
> = {
  minor: { variant: 'secondary', label: 'Minor' },
  moderate: { variant: 'default', label: 'Moderate' },
  major: { variant: 'destructive', label: 'Major' },
};

const PERIL_BADGE: Record<
  'consistent' | 'inconsistent' | 'inconclusive',
  { variant: 'default' | 'secondary' | 'destructive'; label: string }
> = {
  consistent: { variant: 'default', label: 'Consistent with reported peril' },
  inconsistent: { variant: 'destructive', label: 'Inconsistent with peril' },
  inconclusive: { variant: 'secondary', label: 'Peril match inconclusive' },
};

const ZONE_LABELS: Record<string, string> = {
  roof_south_slope: 'Roof — south slope',
  roof_west_slope: 'Roof — west slope',
  gutter_front: 'Front gutter',
  skylight_kitchen: 'Kitchen skylight',
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
  const cfg = PERIL_BADGE[consistency as keyof typeof PERIL_BADGE];
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

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {PHOTO_MANIFEST.map((p) => {
        const c = byId.get(p.id);
        // While streaming, `c.label` can briefly be a partial string
        // (e.g. "hail_dam") before the model finishes the token. Only
        // treat it as a real label once it's a known key.
        const rawLabel = c?.label;
        const label =
          rawLabel && rawLabel in LABEL_BADGE
            ? (rawLabel as PhotoLabel)
            : null;
        const isUnrelated = label === 'unrelated';
        const isNearDup = label === 'near_duplicate';
        return (
          <li
            key={p.id}
            className={cn(
              'flex flex-col gap-1.5 overflow-hidden rounded-md border bg-card p-2 transition-opacity',
              isUnrelated && 'opacity-50 grayscale',
              isNearDup && 'opacity-75'
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
            <div className="min-h-[20px]">
              {label ? (
                <Badge
                  variant={LABEL_BADGE[label].variant}
                  className="text-[10px]"
                >
                  {LABEL_BADGE[label].label}
                </Badge>
              ) : streaming ? (
                <Shimmer className="text-[10px]">classifying…</Shimmer>
              ) : null}
            </div>
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
            // Same partial-string guard as classifications: severity
            // arrives mid-token and can be a non-key string briefly.
            const rawSev = z?.severity;
            const sev =
              rawSev && rawSev in SEVERITY_BADGE
                ? (rawSev as keyof typeof SEVERITY_BADGE)
                : null;
            return z?.zone ? (
              <tr key={`${z.zone}-${i}`} className="border-t">
                <td className="px-3 py-2 font-medium">
                  {ZONE_LABELS[z.zone] ?? z.zone}
                </td>
                <td className="px-3 py-2">
                  {sev ? (
                    <Badge variant={SEVERITY_BADGE[sev].variant}>
                      {SEVERITY_BADGE[sev].label}
                    </Badge>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {z.evidence ?? ''}
                </td>
              </tr>
            ) : null;
          })}
        </tbody>
      </table>
    </div>
  );
}


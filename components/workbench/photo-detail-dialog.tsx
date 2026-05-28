'use client';

import * as React from 'react';
import Image from 'next/image';
import { PencilIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Shimmer } from '@/components/ai-elements/shimmer';
import type { ScenarioPhoto } from '@/lib/scenario/photos';
import {
  COMPONENT_LABEL,
  FINDING_LABEL,
  MATERIAL_LABEL,
  NON_PERIL_LABEL,
  NO_DAMAGE_LABEL,
  PERIL_LABEL,
  PRIMARY_LABEL,
  SHOT_TYPE_LABEL,
  ZONE_LABELS,
} from '@/lib/agents/photos/labels';
import type { PhotoMetadata } from '@/app/api/photos/[id]/metadata/route';
import { cn } from '@/lib/utils';

type FetchState =
  | { status: 'idle' }
  | { status: 'ready'; data: PhotoMetadata }
  | { status: 'error' };

export function PhotoDetailDialog({
  photo,
  rationale,
  confidence,
  triggerClassName,
  children,
}: {
  photo: ScenarioPhoto;
  /** Agent's per-photo rationale (truncated on the card, shown in full
   * here). Falls back to the manifest description when absent. */
  rationale?: string;
  /** Per-photo classification confidence (0–1) from the agent output. */
  confidence?: number;
  triggerClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [fetchState, setFetchState] = React.useState<FetchState>({
    status: 'idle',
  });
  // 'loading' is derived: open && status === 'idle'. Keeping it implicit
  // avoids a setState-in-effect cascading render.
  const isLoading = open && fetchState.status === 'idle';

  React.useEffect(() => {
    if (!open || fetchState.status !== 'idle') return;
    let cancelled = false;
    fetch(`/api/photos/${encodeURIComponent(photo.id)}/metadata`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as PhotoMetadata;
      })
      .then((data) => {
        if (!cancelled) setFetchState({ status: 'ready', data });
      })
      .catch(() => {
        if (!cancelled) setFetchState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [open, fetchState.status, photo.id]);

  const gt = photo.groundTruth;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          'cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          triggerClassName,
        )}
      >
        {children}
      </DialogTrigger>
      <DialogContent className="grid max-h-[90vh] w-full gap-4 overflow-y-auto sm:max-w-3xl">
        <div className="flex flex-col gap-3 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="font-mono text-sm">{photo.id}</DialogTitle>
            {typeof confidence === 'number' ? (
              <Badge variant="metadata" className="text-xs tabular-nums">
                Confidence {(confidence * 100).toFixed(0)}%
              </Badge>
            ) : null}
          </div>
          <DialogDescription className="sr-only">
            {rationale ?? photo.description}
          </DialogDescription>
          <p className="text-sm leading-relaxed">
            {rationale ?? photo.description}
          </p>
        </div>

        <div className="relative mx-auto aspect-[4/3] max-h-[45vh] w-full overflow-hidden rounded-md bg-muted">
          <Image
            src={photo.publicUrl}
            alt={photo.id}
            fill
            sizes="(max-width: 768px) 90vw, 720px"
            className="object-contain"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <GroundTruthSection groundTruth={gt} />
          <FileMetadataSection state={fetchState} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GroundTruthSection({
  groundTruth,
}: {
  groundTruth: ScenarioPhoto['groundTruth'];
}) {
  const {
    primary_classification,
    peril,
    non_peril,
    no_damage,
    component,
    material,
    shot_types,
    findings,
    zone,
  } = groundTruth;

  return (
    <section className="flex flex-col gap-3 rounded-md bg-card p-3 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
          AI Classification
        </h3>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Edit classification"
        >
          <PencilIcon />
        </Button>
      </div>
      <dl className="flex flex-col gap-2.5 text-sm">
        {primary_classification ? (
          <Row label="Classification">
            <Badge variant={primary_classification}>
              {PRIMARY_LABEL[primary_classification]}
            </Badge>
          </Row>
        ) : null}
        {peril.length > 0 ? (
          <Row label="Peril">
            {peril.map((t) => (
              <Badge key={t} variant="peril">
                {PERIL_LABEL[t]}
              </Badge>
            ))}
          </Row>
        ) : null}
        {non_peril.length > 0 ? (
          <Row label="Non-peril">
            {non_peril.map((t) => (
              <Badge key={t} variant="non_peril">
                {NON_PERIL_LABEL[t]}
              </Badge>
            ))}
          </Row>
        ) : null}
        {no_damage.length > 0 ? (
          <Row label="No-damage">
            {no_damage.map((t) => (
              <Badge key={t} variant="no_damage">
                {NO_DAMAGE_LABEL[t]}
              </Badge>
            ))}
          </Row>
        ) : null}
        {component ? (
          <Row label="Component">
            <Badge variant="component">{COMPONENT_LABEL[component]}</Badge>
          </Row>
        ) : null}
        {material ? (
          <Row label="Material">
            <Badge variant="material">{MATERIAL_LABEL[material]}</Badge>
          </Row>
        ) : null}
        {findings.length > 0 ? (
          <Row label="Findings">
            {findings.map((t) => (
              <Badge key={t} variant="finding">
                {FINDING_LABEL[t]}
              </Badge>
            ))}
          </Row>
        ) : null}
        {shot_types.length > 0 ? (
          <Row label="Shot types">
            {shot_types.map((t) => (
              <Badge key={t} variant="shot">
                {SHOT_TYPE_LABEL[t]}
              </Badge>
            ))}
          </Row>
        ) : null}
        {zone ? (
          <Row label="Zone">
            <Badge variant="metadata">{ZONE_LABELS[zone]}</Badge>
          </Row>
        ) : null}
      </dl>
    </section>
  );
}

function FileMetadataSection({
  state,
  isLoading,
}: {
  state: FetchState;
  isLoading: boolean;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-md bg-card p-3 ring-1 ring-foreground/10">
      <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
        File metadata
      </h3>
      <dl className="flex flex-col gap-2.5 text-sm">
        {isLoading ? (
          <Row label="Details">
            <Shimmer className="text-xs">reading file…</Shimmer>
          </Row>
        ) : null}

        {state.status === 'error' ? (
          <Row label="Details">
            <span className="text-xs italic text-muted-foreground">
              File metadata unavailable.
            </span>
          </Row>
        ) : null}

        {state.status === 'ready' ? (
          <>
            {state.data.width != null && state.data.height != null ? (
              <Row label="Dimensions">
                <span className="tabular-nums">
                  {state.data.width}×{state.data.height} px
                </span>
              </Row>
            ) : null}
            <Row label="Size">
              <span className="tabular-nums">
                {formatBytes(state.data.bytes)}
              </span>
            </Row>
            {state.data.type ? (
              <Row label="Format">
                <span className="uppercase">{state.data.type}</span>
              </Row>
            ) : null}
            <Row label="Modified">
              <span className="tabular-nums text-xs text-muted-foreground">
                04/23/2026
              </span>
            </Row>
            {state.data.exif ? (
              <ExifBlock exif={state.data.exif} />
            ) : (
              <Row label="EXIF">
                <span className="text-xs italic text-muted-foreground">
                  None
                </span>
              </Row>
            )}
          </>
        ) : null}
      </dl>
    </section>
  );
}

function ExifBlock({
  exif,
}: {
  exif: NonNullable<PhotoMetadata['exif']>;
}) {
  return (
    <>
      {exif.make || exif.model ? (
        <Row label="Camera">
          <span>
            {[exif.make, exif.model].filter(Boolean).join(' ').trim()}
          </span>
        </Row>
      ) : null}
      {exif.dateTimeOriginal ? (
        <Row label="Captured">
          <span className="tabular-nums text-xs">
            {formatDateTime(exif.dateTimeOriginal)}
          </span>
        </Row>
      ) : null}
      {exif.gps ? (
        <Row label="GPS">
          <span className="tabular-nums text-xs">
            {exif.gps.lat.toFixed(5)}, {exif.gps.lng.toFixed(5)}
          </span>
        </Row>
      ) : null}
      {typeof exif.orientation === 'number' ? (
        <Row label="Orientation">
          <span className="tabular-nums text-xs">{exif.orientation}</span>
        </Row>
      ) : null}
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-start gap-2">
      <dt className="pt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="flex flex-wrap items-center gap-1.5">{children}</dd>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

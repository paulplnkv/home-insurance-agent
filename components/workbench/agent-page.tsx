'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AgentState } from './agent-panel';

const STATE_LABEL: Record<AgentState, string> = {
  idle: 'Pending',
  running: 'Running',
  complete: 'Complete',
  error: 'Error',
};

const STATE_VARIANT: Record<
  AgentState,
  'secondary' | 'default' | 'destructive'
> = {
  idle: 'secondary',
  running: 'secondary',
  complete: 'default',
  error: 'destructive',
};

interface AgentPageBodyProps {
  title: string;
  // String form is split on " · " into segments; array form is used as-is.
  // Each segment renders as a pill of muted copy joined by a 4 px dot, matching
  // the Figma subtitle pattern (see the dashboard header for the canonical use).
  description: string | readonly string[];
  // Accepts a plain string (rendered as italic muted copy) or a React
  // node when a page needs richer pre-run content like a scaffold table.
  idlePlaceholder: React.ReactNode;
  state: AgentState;
  startedAt: number | null;
  endedAt: number | null;
  error: { message: string } | null;
  onRun: () => void;
  onStop?: () => void;
  onReset?: () => void;
  // Live-activity slot rendered as a sticky sidebar on the left at lg+.
  activity?: React.ReactNode;
  // Optional badge rendered beside the title so the audience can map
  // the page to its agent identity (e.g. "M2 · Coverage Agent · Tier 3").
  identityBadge?: React.ReactNode;
  // Optional pre-run context card rendered between the header and the
  // output panel. Visible only while state === 'idle' — hides as soon
  // as output begins to render.
  preRunContext?: React.ReactNode;
  // Optional content rendered in the left column under the activity
  // feed (e.g. Coverages' "Queued documents" card).
  leftAside?: React.ReactNode;
  // Optional sibling card rendered below the main right-column card —
  // used by Documents for the standalone File summary card.
  rightFooter?: React.ReactNode;
  // When true, the right-column children render as their own cards (the
  // wrapper Card is dropped). Used by Coverages to render the output as a
  // stack of separate cards per the Figma design.
  ownsRightColumnCards?: boolean;
  children?: React.ReactNode;
}

// Full-page agent layout used on /agents/<name>. Top row carries the
// title and toolbar; below it the activity feed is pinned to a sticky
// left column at lg+ while the streaming output fills the right
// column. On narrower screens both stack vertically.
export function AgentPageBody({
  title,
  description,
  idlePlaceholder,
  state,
  startedAt,
  endedAt,
  error,
  onRun,
  onStop,
  onReset,
  activity,
  identityBadge,
  preRunContext,
  leftAside,
  rightFooter,
  ownsRightColumnCards = false,
  children,
}: AgentPageBodyProps) {
  // Live elapsed counter — only ticks while running so we don't burn
  // renders the rest of the time.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (state !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [state]);

  const elapsedMs = startedAt
    ? (endedAt ?? (state === 'running' ? now : startedAt)) - startedAt
    : 0;
  const seconds = elapsedMs ? (elapsedMs / 1000).toFixed(1) : null;
  const pillLabel =
    (state === 'running' || state === 'complete') && seconds
      ? `${STATE_LABEL[state]} · ${seconds}s`
      : STATE_LABEL[state];

  const descriptionSegments =
    typeof description === 'string'
      ? description.split(' · ').filter(Boolean)
      : description;

  // For running/complete, callers may want to own card chrome themselves
  // (Coverages renders a stack of separate cards per the Figma design).
  const renderChildrenFlat =
    ownsRightColumnCards && (state === 'running' || state === 'complete');

  const pillButtonClasses =
    'h-12 rounded-full px-10 text-base font-semibold';

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-[var(--ink)]">
              {title}
            </h1>
            {identityBadge}
          </div>
          <DescriptionRow segments={descriptionSegments} />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {state === 'running' || state === 'error' ? (
            <Badge
              variant={STATE_VARIANT[state]}
              className="font-medium uppercase tracking-wide"
            >
              {pillLabel}
            </Badge>
          ) : null}
          {state === 'running' ? (
            <Button
              variant="outline"
              onClick={onStop}
              disabled={!onStop}
              className={pillButtonClasses}
            >
              Stop
            </Button>
          ) : (
            <Button onClick={onRun} className={pillButtonClasses}>
              Run
            </Button>
          )}
          {onReset ? (
            <Button
              variant="outline"
              onClick={onReset}
              className={pillButtonClasses}
            >
              Reset
            </Button>
          ) : null}
        </div>
      </header>

      {state === 'idle' && preRunContext ? preRunContext : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(300px,443px)_1fr] lg:items-start">
        {activity || leftAside ? (
          <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            {activity ? (
              <PageCard>
                <h2 className="font-heading pb-4 text-xl font-semibold leading-snug text-[var(--ink)]">
                  Live activity
                </h2>
                {activity}
              </PageCard>
            ) : null}
            {leftAside}
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {state === 'error' && error ? (
            <PageCard>
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {title} failed: {error.message}
              </p>
            </PageCard>
          ) : state === 'idle' ? (
            <PageCard>
              {typeof idlePlaceholder === 'string' ? (
                <p className="text-sm italic text-muted-foreground">
                  {idlePlaceholder}
                </p>
              ) : (
                idlePlaceholder
              )}
            </PageCard>
          ) : renderChildrenFlat ? (
            children
          ) : (
            <PageCard>{children}</PageCard>
          )}
          {state !== 'idle' && state !== 'error' ? rightFooter : null}
        </div>
      </div>
    </div>
  );
}

// Shared white card wrapper used across agent pages — matches the Figma
// "rounded-2xl, soft-gray border" treatment. Exported so output sections
// that own their own card chrome (Damages, Coverages, Documents) can
// stack visually consistent siblings.
export function PageCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[var(--line-soft)] bg-white p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}

function DescriptionRow({
  segments,
}: {
  segments: string | readonly string[];
}) {
  const list = Array.isArray(segments) ? segments : [segments as string];
  if (list.length === 0) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--ink-soft)]">
      {list.map((segment, i) => (
        <span key={`${segment}-${i}`} className="flex items-center gap-2">
          {i > 0 ? (
            <span
              aria-hidden
              className="block size-1 rounded-full bg-[var(--ink-soft)]"
            />
          ) : null}
          <span>{segment}</span>
        </span>
      ))}
    </p>
  );
}

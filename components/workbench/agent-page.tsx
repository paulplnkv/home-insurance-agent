'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  description: string;
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
  children,
}: AgentPageBodyProps) {
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

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 px-6 py-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-semibold leading-tight">{title}</h1>
              {identityBadge}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {state !== 'complete' ? (
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
                size="sm"
                onClick={onStop}
                disabled={!onStop}
              >
                Stop
              </Button>
            ) : state === 'complete' ? (
              <>
                <Button variant="outline" size="sm" onClick={onRun}>
                  Run
                </Button>
                {onReset ? (
                  <Button variant="ghost" size="sm" onClick={onReset}>
                    Reset
                  </Button>
                ) : null}
              </>
            ) : state === 'error' ? (
              <Button variant="outline" size="sm" onClick={onReset ?? onRun}>
                Reset
              </Button>
            ) : (
              <Button size="sm" onClick={onRun}>
                Run analysis
              </Button>
            )}
          </div>
        </div>
      </Card>

      {state === 'idle' && preRunContext ? preRunContext : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(300px,360px)_1fr] lg:items-start">
        {activity ? (
          <Card className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 pb-2 text-[10px] uppercase tracking-wide text-muted-foreground/80">
                <span>Live activity</span>
              </div>
              {activity}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="py-4">
            {state === 'error' && error ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {title} failed: {error.message}
              </p>
            ) : state === 'idle' ? (
              typeof idlePlaceholder === 'string' ? (
                <p className="text-sm italic text-muted-foreground">
                  {idlePlaceholder}
                </p>
              ) : (
                idlePlaceholder
              )
            ) : (
              children
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

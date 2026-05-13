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
  idlePlaceholder: string;
  state: AgentState;
  startedAt: number | null;
  endedAt: number | null;
  error: { message: string } | null;
  onRun: () => void;
  onStop?: () => void;
  onReset?: () => void;
  children?: React.ReactNode;
}

// Full-page agent layout used on /agents/<name>. Mirrors the toolbar
// portion of <AgentPanel> but renders the output flush in the main
// column instead of inside a Collapsible.
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
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-6 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-semibold leading-tight">{title}</h1>
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
      <CardContent className="pt-4">
        {state === 'error' && error ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {title} failed: {error.message}
          </p>
        ) : state === 'idle' ? (
          <p className="text-sm italic text-muted-foreground">
            {idlePlaceholder}
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export type AgentState = 'idle' | 'running' | 'complete' | 'error';

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

// Collapsible panel wrapper for a single agent. The header row (title,
// sub-line, status pill, Run/Stop/Re-run button) stays visible at all
// times; clicking the title/sub-line area toggles the body open or
// closed. The body auto-opens when the agent starts running so the
// audience sees the streamed output without an extra click.
export function AgentPanel({
  title,
  description,
  state,
  startedAt,
  endedAt,
  error,
  idlePlaceholder,
  onRun,
  onStop,
  onReset,
  activity,
  children,
}: {
  title: string;
  description: string;
  state: AgentState;
  startedAt: number | null;
  endedAt: number | null;
  error?: { message: string } | null;
  idlePlaceholder: string;
  onRun: () => void;
  onStop?: () => void;
  onReset?: () => void;
  // Optional live-activity slot rendered above the agent output. Used
  // to show tool-call timelines while the agent runs.
  activity?: React.ReactNode;
  children?: React.ReactNode;
}) {
  // Live elapsed counter — only ticks while running so we don't burn
  // renders the rest of the time.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (state !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [state]);

  // Collapsible state. Closed by default; auto-opens when the user
  // clicks Run/Re-run so the demo audience sees the stream without
  // requiring two clicks. User can manually collapse anytime via the
  // header trigger.
  const [open, setOpen] = useState(false);
  const handleRun = () => {
    setOpen(true);
    onRun();
  };

  const elapsedMs = startedAt
    ? (endedAt ?? (state === 'running' ? now : startedAt)) - startedAt
    : 0;
  const seconds = elapsedMs ? (elapsedMs / 1000).toFixed(1) : null;

  const pillLabel =
    state === 'running' || state === 'complete'
      ? seconds
        ? `${STATE_LABEL[state]} · ${seconds}s`
        : STATE_LABEL[state]
      : STATE_LABEL[state];

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex flex-wrap items-start justify-between gap-3 px-6 py-3">
          <CollapsibleTrigger className="group flex flex-1 items-start gap-3 rounded-md text-left transition-colors hover:bg-accent/40 -mx-2 px-2 py-1">
            <ChevronDownIcon
              className={cn(
                'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform',
                'group-data-[panel-open]:rotate-180'
              )}
            />
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold leading-tight">{title}</h2>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </CollapsibleTrigger>
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
              <Button variant="outline" size="sm" onClick={onStop} disabled={!onStop}>
                Stop
              </Button>
            ) : state === 'complete' ? (
              <Button variant="outline" size="sm" onClick={handleRun}>
                Run
              </Button>
            ) : state === 'error' ? (
              <Button variant="outline" size="sm" onClick={onReset ?? handleRun}>
                Reset
              </Button>
            ) : (
              <Button size="sm" onClick={handleRun}>
                Run analysis
              </Button>
            )}
          </div>
        </div>
        <CollapsibleContent>
          <CardContent className="flex flex-col gap-4 border-t pt-4">
            {activity && state !== 'idle' ? activity : null}
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

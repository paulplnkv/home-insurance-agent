'use client';

import { Loader2Icon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import { Shimmer } from '@/components/ai-elements/shimmer';
import {
  labelForTool,
  type ActivityEvent,
  type NarrationEvent,
  type ToolCall,
  type ToolEvent,
} from '@/lib/agents/activity/events';
import { getDocumentById } from '@/lib/scenario/documents';
import { getPhotoById } from '@/lib/scenario/photos';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  events: ActivityEvent[];
  isStreaming: boolean;
  pendingCopy?: string;
}

type RowState = 'pending' | 'done' | 'error';

// Live timeline of the agent's work. Renders two row types:
//   - tool groups   (one row per tool name; collapses parallel calls)
//   - narration rows (synthesized status from the finalize input)
// Each row has a numbered step circle on the left and a Done/Pending pill
// on the right, matching the Figma design.
export function ActivityFeed({
  events,
  isStreaming,
  pendingCopy = 'Preparing…',
}: ActivityFeedProps) {
  const items = useMemo(() => events, [events]);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground">
        {isStreaming ? (
          <>
            <Loader2Icon className="size-3.5 animate-spin" />
            <span>{pendingCopy}</span>
          </>
        ) : (
          <span className="italic">No activity recorded yet.</span>
        )}
      </div>
    );
  }

  const lastIndex = items.length - 1;

  return (
    <ol className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {items.map((event, idx) => (
          <motion.li
            key={event.id}
            layout="position"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <EventRow
              event={event}
              stepNumber={idx + 1}
              isStreaming={isStreaming}
              isLast={idx === lastIndex}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}

function EventRow({
  event,
  stepNumber,
  isStreaming,
  isLast,
}: {
  event: ActivityEvent;
  stepNumber: number;
  isStreaming: boolean;
  isLast: boolean;
}) {
  switch (event.kind) {
    case 'tool':
      return (
        <ToolRow
          event={event}
          stepNumber={stepNumber}
          isStreaming={isStreaming}
          isLast={isLast}
        />
      );
    case 'narration':
      return <NarrationRow event={event} stepNumber={stepNumber} />;
  }
}

function ToolRow({
  event,
  stepNumber,
  isStreaming,
  isLast,
}: {
  event: ToolEvent;
  stepNumber: number;
  isStreaming: boolean;
  isLast: boolean;
}) {
  const label = labelForTool(event.toolName);
  const { calls } = event;

  const anyPending = calls.some((c) => c.state === 'pending');
  const anyError = calls.some((c) => c.state === 'error');
  const doneCount = calls.filter((c) => c.state === 'done').length;
  const declaredTotal = label.totalCount?.();
  // Hold the row in pending state between parallel batches: when this
  // group is still the latest activity and the agent is still streaming,
  // assume the model may dispatch more calls to the same tool. Without
  // this the row flaps "Inspecting → Inspected → Inspecting" as each
  // wave of parallel calls settles before the next arrives.
  const expectingMore =
    isStreaming &&
    isLast &&
    (declaredTotal !== undefined
      ? doneCount < declaredTotal
      : calls.length > 1);
  const overallState: RowState = anyError
    ? 'error'
    : anyPending || expectingMore
      ? 'pending'
      : 'done';

  const pendingVerb =
    calls.length > 1 ? (label.verbPlural ?? label.verb) : label.verb;
  // Prefer the tool's declared total (e.g. 60 photos) over calls.length
  // — the latter climbs as the model streams more parallel calls.
  const total = declaredTotal ?? calls.length;
  const count = total > 1 ? `${doneCount}/${total}` : null;
  const subtitle = describeCalls(event.toolName, calls);
  const errorText = calls.find((c) => c.errorText)?.errorText;

  return (
    <StepRow
      stepNumber={stepNumber}
      title={pendingVerb}
      state={overallState}
      count={count}
      subtitle={subtitle}
      errorText={overallState === 'error' ? errorText : null}
    />
  );
}

function NarrationRow({
  event,
  stepNumber,
}: {
  event: NarrationEvent;
  stepNumber: number;
}) {
  return (
    <StepRow
      stepNumber={stepNumber}
      title={event.done ? stripTrailingEllipsis(event.text) : event.text}
      state={event.done ? 'done' : 'pending'}
    />
  );
}

// Shared visual: numbered circle + title + count pill + Done/Pending pill,
// with optional subtitle and error message below.
function StepRow({
  stepNumber,
  title,
  state,
  count,
  subtitle,
  errorText,
}: {
  stepNumber: number;
  title: string;
  state: RowState;
  count?: string | null;
  subtitle?: string | null;
  errorText?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2.5">
        <StepCircle number={stepNumber} state={state} />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
          {state === 'pending' ? (
            <Shimmer as="span" className="text-sm font-medium leading-snug">
              {title}
            </Shimmer>
          ) : (
            <span
              className={cn(
                'text-sm font-medium leading-snug',
                state === 'error' ? 'text-destructive' : 'text-foreground',
              )}
            >
              {title}
            </span>
          )}
          {count ? <CountPill>{count}</CountPill> : null}
          <StatusPill state={state} />
        </div>
      </div>
      {subtitle ? (
        <p className="pl-[34px] text-xs leading-snug text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
      {errorText ? (
        <p className="pl-[34px] text-xs leading-snug text-destructive/80">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}

function StepCircle({
  number,
  state,
}: {
  number: number;
  state: RowState;
}) {
  // Figma uses a neutral outlined circle regardless of state — color is
  // carried entirely by the status pill on the right.
  const tone =
    state === 'error'
      ? 'border-destructive/40 text-destructive'
      : 'border-border bg-background text-muted-foreground';
  return (
    <span
      aria-hidden
      className={cn(
        'mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums',
        tone,
      )}
    >
      {number}
    </span>
  );
}

function CountPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide tabular-nums text-muted-foreground">
      {children}
    </span>
  );
}

function StatusPill({ state }: { state: RowState }) {
  if (state === 'done') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
        <span aria-hidden>✅</span> Done
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
        <span aria-hidden>⚠️</span> Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
      <span aria-hidden>⏳</span> Pending
    </span>
  );
}

function stripTrailingEllipsis(text: string): string {
  return text.replace(/…$/, '');
}

// Build a human subtitle out of a tool group's calls.
//   - 1 call: the call's own subtitle
//   - 2-3 calls: comma-joined
//   - 4+ calls: first two names + "+N more"
function describeCalls(toolName: string, calls: ToolCall[]): string | null {
  const subtitles = calls
    .map((c) => describeToolInput(toolName, c.input))
    .filter((s): s is string => Boolean(s));
  if (subtitles.length === 0) return null;
  if (subtitles.length === 1) return subtitles[0];
  if (subtitles.length <= 3) return subtitles.join(', ');
  return `${subtitles.slice(0, 2).join(', ')} +${subtitles.length - 2} more`;
}

function describeToolInput(toolName: string, input: unknown): string | null {
  if (input == null || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;

  if (toolName === 'read_document') {
    const id = typeof obj.id === 'string' ? obj.id : null;
    if (!id) return null;
    const doc = getDocumentById(id);
    return doc ? doc.title : id;
  }

  if (toolName === 'inspect_photo') {
    const id = typeof obj.id === 'string' ? obj.id : null;
    if (!id) return null;
    const photo = getPhotoById(id);
    return photo ? photo.id : id;
  }

  if (toolName === 'search_policy') {
    const query = typeof obj.query === 'string' ? obj.query : null;
    return query ? `“${query}”` : null;
  }

  return null;
}

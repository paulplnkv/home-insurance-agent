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

// Live timeline of the agent's work. Renders two row types:
//   - tool groups   (one row per tool name; collapses parallel calls)
//   - narration rows (synthesized status from the finalize input)
// Pending state is conveyed by muted text + the in-copy trailing ellipsis;
// no per-row iconography.
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
    <ol className="flex flex-col gap-2">
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
  isStreaming,
  isLast,
}: {
  event: ActivityEvent;
  isStreaming: boolean;
  isLast: boolean;
}) {
  switch (event.kind) {
    case 'tool':
      return (
        <ToolRow event={event} isStreaming={isStreaming} isLast={isLast} />
      );
    case 'narration':
      return <NarrationRow event={event} />;
  }
}

function ToolRow({
  event,
  isStreaming,
  isLast,
}: {
  event: ToolEvent;
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
  // wave of parallel calls settles before the next arrives. We require
  // *some* multi-call signal so single-shot tools (list_documents,
  // list_photos) flip to done immediately on settle:
  //   - declaredTotal known → wait until doneCount reaches it
  //   - otherwise → only hold once we've seen 2+ calls in the group
  const expectingMore =
    isStreaming &&
    isLast &&
    (declaredTotal !== undefined
      ? doneCount < declaredTotal
      : calls.length > 1);
  const overallState: 'pending' | 'done' | 'error' = anyError
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
    <div className="flex flex-col gap-0.5 py-0.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {overallState === 'pending' ? (
          <Shimmer
            as="span"
            className="text-sm font-medium leading-snug"
          >
            {pendingVerb}
          </Shimmer>
        ) : (
          <span
            className={cn(
              'text-sm font-medium leading-snug',
              overallState === 'error'
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
          >
            {pendingVerb}
          </span>
        )}
        {count ? (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
            {count}
          </span>
        ) : null}
        {overallState === 'done' ? (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
            Done
          </span>
        ) : null}
        {subtitle ? (
          <span className="text-xs text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </div>
      {overallState === 'error' && errorText ? (
        <p className="text-xs leading-snug text-destructive/80">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}

function NarrationRow({ event }: { event: NarrationEvent }) {
  return (
    <div className="py-0.5">
      {event.done ? (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium leading-snug text-muted-foreground">
            {stripTrailingEllipsis(event.text)}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
            Done
          </span>
        </div>
      ) : (
        <Shimmer as="span" className="text-sm font-medium leading-snug">
          {event.text}
        </Shimmer>
      )}
    </div>
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

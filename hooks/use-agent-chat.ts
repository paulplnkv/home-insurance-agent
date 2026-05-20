'use client';

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  getToolName,
  isToolUIPart,
  type DeepPartial,
  type UIMessagePart,
} from 'ai';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ZodType } from 'zod';
import {
  isFinalizeTool,
  narrationsForFinalize,
  type ActivityEvent,
  type ToolCall,
} from '@/lib/agents/activity/events';
import type { AgentState } from '@/components/workbench/agent-panel';
import {
  clearAgentResult,
  loadAgentResult,
  saveAgentResult,
  type PersistedAgentResult,
} from '@/lib/storage/agent-results';

export interface UseAgentChatOptions<T> {
  api: string;
  schema: ZodType<T>;
  storageKey: string;
  // Text sent as the kickoff user message. The server agent ignores
  // message bodies (it builds its own prompt) — this just triggers the
  // request.
  kickoff?: string;
}

export interface UseAgentChatResult<T> {
  object: DeepPartial<T> | undefined;
  events: ActivityEvent[];
  state: AgentState;
  startedAt: number | null;
  endedAt: number | null;
  error: { message: string } | null;
  resetKey: number;
  submit: () => void;
  stop: () => void;
  reset: () => void;
}

type AnyPart = UIMessagePart<Record<string, never>, Record<string, never>>;

// Walk the assistant message parts and produce the flat timeline the
// ActivityFeed renders. Two things happen here:
//   1. tool calls collapse into ToolEvent groups — consecutive calls of
//      the same tool name share one row (so six parallel read_document
//      calls render as ONE "Reading documents · 6" row that lists them)
//   2. finalize tool calls don't render as a row — instead the partial
//      input is exploded into narration events ("Drafting file
//      summary…", "Determining routing decision…")
// Step boundaries, free-form text, and reasoning are intentionally
// dropped — the feed focuses on tool activity and structured narration.
// Re-derived on every render. Pure w.r.t. its inputs.
function deriveEventsAndObject<T>(
  parts: ReadonlyArray<AnyPart> | undefined
): { events: ActivityEvent[]; finalizeInput: DeepPartial<T> | undefined } {
  const events: ActivityEvent[] = [];
  let finalizeInput: DeepPartial<T> | undefined;

  if (!parts) return { events, finalizeInput };

  for (const part of parts) {
    if (isToolUIPart(part)) {
      const toolName = getToolName(part);
      const toolCallId = (part as { toolCallId: string }).toolCallId;
      const partState = (part as { state: string }).state;
      const input = (part as { input?: unknown }).input;

      // Finalize tools: capture the structured answer + emit narration
      // events for each field that has started streaming. Don't render
      // them as a tool row — the narration tells the story better.
      if (isFinalizeTool(toolName)) {
        if (input !== undefined) {
          finalizeInput = input as DeepPartial<T>;
        }
        // Treat the finalize tool as "done" the moment the model has
        // finished streaming the structured answer (input-available),
        // not when the server-side identity execute returns
        // (output-available). The two are equivalent for these tools —
        // execute is `async (input) => input` — but on Vercel the
        // output-available chunk doesn't always reach the client before
        // the stream is considered complete, leaving the trailing
        // narration shimmering forever. output-error is included so the
        // row settles into a non-shimmer state on error too.
        const finalizeSettled =
          partState === 'input-available' ||
          partState === 'output-available' ||
          partState === 'output-error';
        const narrations = narrationsForFinalize(
          toolName,
          input,
          finalizeSettled
        );
        for (const narration of narrations) {
          events.push(narration);
        }
        continue;
      }

      let callState: ToolCall['state'] = 'pending';
      let output: unknown;
      let errorText: string | undefined;
      if (partState === 'output-available') {
        callState = 'done';
        output = (part as { output: unknown }).output;
      } else if (partState === 'output-error') {
        callState = 'error';
        errorText = (part as { errorText: string }).errorText;
      }

      const call: ToolCall = {
        toolCallId,
        state: callState,
        input,
        output,
        errorText,
      };

      // Collapse into the most-recent ToolEvent group if it's the same
      // tool name — otherwise start a new group. (Narration entries
      // from finalize tools naturally break a group.)
      const last = events[events.length - 1];
      if (last && last.kind === 'tool' && last.toolName === toolName) {
        last.calls.push(call);
      } else {
        events.push({
          kind: 'tool',
          id: `tool-${toolCallId}`,
          toolName,
          calls: [call],
        });
      }
      continue;
    }
  }

  return { events, finalizeInput };
}

export function useAgentChat<T>({
  api,
  schema,
  storageKey,
  kickoff = 'Begin.',
}: UseAgentChatOptions<T>): UseAgentChatResult<T> {
  const transport = useMemo(
    () => new DefaultChatTransport({ api }),
    [api]
  );

  // Hydrate the persisted snapshot once on mount. The setState-in-
  // effect lint flag here is a known false-positive for one-shot
  // localStorage hydration — useState's initializer can't safely touch
  // window during SSR, so we read in an effect instead. Single tab in
  // front of the conference audience means no cross-tab sync needed.
  const [persisted, setPersisted] = useState<PersistedAgentResult<T> | null>(
    null
  );
  useEffect(() => {
    const loaded = loadAgentResult<T>(storageKey, schema);
    if (loaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPersisted(loaded);
    }
  }, [storageKey, schema]);

  const [resetKey, setResetKey] = useState(0);
  const [localRun, setLocalRun] = useState<{
    startedAt: number;
    endedAt: number | null;
  } | null>(null);
  const startedAtRef = useRef<number | null>(null);

  // useChat keeps onFinish/onError fresh internally via its own
  // callbacksRef — closures over the latest React state are safe here.
  const { messages, status, error, sendMessage, stop, setMessages } =
    useChat({
      transport,
      onFinish: ({ message, isAbort, isError }) => {
        const endedAt = Date.now();
        setLocalRun((prev) =>
          prev && prev.endedAt === null ? { ...prev, endedAt } : prev
        );
        if (isAbort || isError) return;

        const { finalizeInput, events: snapshotEvents } =
          deriveEventsAndObject<T>(
            message.parts as ReadonlyArray<AnyPart>
          );
        if (finalizeInput === undefined) return;
        const parsed = schema.safeParse(finalizeInput);
        if (!parsed.success) return;

        const payload: PersistedAgentResult<T> = {
          object: parsed.data,
          startedAt: startedAtRef.current ?? endedAt,
          endedAt,
          events: snapshotEvents,
        };
        saveAgentResult(storageKey, payload);
        setPersisted(payload);
      },
      onError: () => {
        setLocalRun((prev) =>
          prev && prev.endedAt === null
            ? { ...prev, endedAt: Date.now() }
            : prev
        );
      },
    });

  // Find the last assistant message — that's the one being streamed
  // into. Older runs (if any) accumulate harmlessly in the message log.
  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i];
    }
    return undefined;
  }, [messages]);

  const { events: liveEvents, finalizeInput } = useMemo(
    () =>
      deriveEventsAndObject<T>(
        lastAssistant?.parts as ReadonlyArray<AnyPart> | undefined
      ),
    [lastAssistant]
  );

  const isLive = status === 'submitted' || status === 'streaming';
  const state: AgentState = error
    ? 'error'
    : isLive
      ? 'running'
      : localRun?.endedAt != null || persisted
        ? 'complete'
        : 'idle';

  const submit = useCallback(() => {
    const startedAt = Date.now();
    startedAtRef.current = startedAt;
    setMessages([]);
    setLocalRun({ startedAt, endedAt: null });
    setResetKey((k) => k + 1);
    void sendMessage({ text: kickoff });
  }, [kickoff, sendMessage, setMessages]);

  const reset = useCallback(() => {
    if (status === 'submitted' || status === 'streaming') {
      void stop();
    }
    setMessages([]);
    startedAtRef.current = null;
    setLocalRun(null);
    setResetKey((k) => k + 1);
    setPersisted(null);
    clearAgentResult(storageKey);
  }, [setMessages, status, stop, storageKey]);

  const handleStop = useCallback(() => {
    void stop();
  }, [stop]);

  // Live values take over the moment a fresh run starts; persisted
  // values are only used when nothing has run in this component yet.
  const hasLive = localRun !== null;
  const displayEvents: ActivityEvent[] = hasLive
    ? liveEvents
    : ((persisted?.events as ActivityEvent[] | undefined) ?? []);
  const displayObject: DeepPartial<T> | undefined = hasLive
    ? finalizeInput
    : (persisted?.object as DeepPartial<T> | undefined);
  const startedAt = localRun?.startedAt ?? persisted?.startedAt ?? null;
  const endedAt = hasLive
    ? (localRun?.endedAt ?? null)
    : (persisted?.endedAt ?? null);

  return {
    object: displayObject,
    events: displayEvents,
    state,
    startedAt,
    endedAt,
    error: error ? { message: error.message } : null,
    resetKey,
    submit,
    stop: handleStop,
    reset,
  };
}

// Live activity feed events — shared shape across all three agents.
// Derived client-side from the UIMessagePart[] surfaced by useChat and
// rendered by <ActivityFeed />. Each entry models one row of the
// timeline; the underlying tool calls collapse into a single row when
// the model fires several of the same tool in parallel.
import { PHOTO_MANIFEST } from '@/lib/scenario/photos';

export type ActivityEvent = ToolEvent | NarrationEvent;

// One row per logical tool action. A single row can represent multiple
// concrete tool calls of the same name (e.g., six parallel
// read_document calls collapse into one ToolEvent with six entries in
// `calls`).
export interface ToolEvent {
  kind: 'tool';
  id: string;
  toolName: string;
  calls: ToolCall[];
}

export interface ToolCall {
  toolCallId: string;
  state: 'pending' | 'done' | 'error';
  input: unknown;
  output?: unknown;
  errorText?: string;
}

// Synthesized rows that translate the agent's internal progress into
// human-readable status — drawn from the finalize tool's partial input
// as the model commits to its structured answer. Lets the audience read
// "Drafting file summary…" instead of "Recording findings".
export interface NarrationEvent {
  kind: 'narration';
  id: string;
  text: string;
  done: boolean;
}

export interface ToolLabel {
  verb: string;
  verbPlural?: string;
  // Static denominator for the "N/total" count badge. Without this,
  // the badge falls back to calls.length — which climbs as the model
  // streams more parallel calls. Use this when the agent inspects a
  // known-size set (e.g. every photo in the manifest).
  totalCount?: () => number;
}

export const TOOL_LABELS: Record<string, ToolLabel> = {
  list_documents: {
    verb: 'Listing documents',
  },
  read_document: {
    verb: 'Reading document',
    verbPlural: 'Reading documents',
  },

  search_policy: {
    verb: 'Searching policy',
    verbPlural: 'Searching policy',
  },

  list_photos: {
    verb: 'Listing photos',
  },
  inspect_photo: {
    verb: 'Inspecting photo',
    verbPlural: 'Inspecting photos',
    totalCount: () => PHOTO_MANIFEST.length,
  },
};

export function labelForTool(toolName: string): ToolLabel {
  return TOOL_LABELS[toolName] ?? { verb: toolName };
}

// Finalize tools whose `input` carries the streamed structured answer.
// The hook reads `input` from this tool's part both to populate the
// `object` returned to the UI panel AND to emit per-field narration
// events into the activity feed.
export const FINALIZE_TOOL_NAMES = new Set([
  'report_findings',
  'report_position',
  'report_assessment',
]);

export function isFinalizeTool(toolName: string): boolean {
  return FINALIZE_TOOL_NAMES.has(toolName);
}

// Per-finalize-tool human narration for each top-level field of its
// structured input. Order matters — narrations appear in the order
// declared here. As later fields begin streaming, earlier fields are
// considered done; rendering greys the label and appends a Done chip.
export interface NarrationLabel {
  pending: string;
}

export const FINALIZE_FIELD_NARRATIONS: Record<
  string,
  Record<string, NarrationLabel>
> = {
  report_findings: {
    document_inventory: { pending: 'Classifying documents…' },
    findings: { pending: 'Cross-referencing documents…' },
    routing: { pending: 'Determining AI recommendation…' },
    summary_markdown: { pending: 'Drafting file summary…' },
  },
  report_position: {
    position: { pending: 'Choosing coverage position…' },
    confidence: { pending: 'Scoring confidence…' },
    applicable_deductible: { pending: 'Identifying applicable deductible…' },
    cited_clauses: { pending: 'Citing policy clauses…' },
    flags: { pending: 'Surfacing review flags…' },
    memo_markdown: { pending: 'Drafting coverage memo…' },
  },
  report_assessment: {
    classifications: { pending: 'Classifying photos…' },
    zones: { pending: 'Grouping into damage zones…' },
    peril_consistency: { pending: 'Assessing peril consistency…' },
    estimate_line_items: { pending: 'Building Xactimate estimate…' },
  },
};

// Build the narration events that correspond to the current partial
// input of a finalize tool. `finished` flips the last in-progress row
// to done once the finalize tool's input has been fully streamed —
// i.e. the model is done writing the structured answer. We do not key
// off the tool's output-available because the finalize execute is
// identity (`async (input) => input`) and the output-available chunk
// has been observed to not reach the client on Vercel before the
// stream ends, which would otherwise leave the trailing row shimmering
// forever.
export function narrationsForFinalize(
  toolName: string,
  input: unknown,
  finished: boolean
): NarrationEvent[] {
  const fieldMap = FINALIZE_FIELD_NARRATIONS[toolName];
  if (!fieldMap || typeof input !== 'object' || input === null) return [];

  const fields = Object.keys(fieldMap);
  const presentByField = new Map<string, boolean>();
  for (const field of fields) {
    const value = (input as Record<string, unknown>)[field];
    const present =
      value !== undefined &&
      // empty arrays / strings don't yet count as "started"
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === 'string' && value.length === 0);
    presentByField.set(field, present);
  }

  const result: NarrationEvent[] = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (!presentByField.get(field)) continue;
    const laterFieldStarted = fields
      .slice(i + 1)
      .some((f) => presentByField.get(f));
    const isDone = finished || laterFieldStarted;
    result.push({
      kind: 'narration',
      id: `narr-${toolName}-${field}`,
      text: fieldMap[field].pending,
      done: isDone,
    });
  }
  return result;
}

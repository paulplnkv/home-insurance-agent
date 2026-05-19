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
  // Past-tense result label rendered once every call has settled.
  // Receives the full call list so it can sum hits / count items.
  describeResult?: (calls: ToolCall[]) => string;
  // Static denominator for the "N/total" count badge. Without this,
  // the badge falls back to calls.length — which climbs as the model
  // streams more parallel calls. Use this when the agent inspects a
  // known-size set (e.g. every photo in the manifest).
  totalCount?: () => number;
}

function countOutputItems(call: ToolCall | undefined): number {
  return Array.isArray(call?.output) ? call.output.length : 0;
}

function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export const TOOL_LABELS: Record<string, ToolLabel> = {
  list_documents: {
    verb: 'Listing documents',
    describeResult: (calls) =>
      `Found ${pluralize(countOutputItems(calls[0]), 'document', 'documents')}`,
  },
  read_document: {
    verb: 'Reading document',
    verbPlural: 'Reading documents',
    describeResult: (calls) => {
      const n = calls.filter((c) => c.state === 'done').length;
      return `Read ${pluralize(n, 'document', 'documents')}`;
    },
  },

  search_policy: {
    verb: 'Searching policy',
    verbPlural: 'Searching policy',
    describeResult: (calls) => {
      const hits = calls.reduce((sum, c) => sum + countOutputItems(c), 0);
      return `Found ${pluralize(hits, 'policy clause', 'policy clauses')}`;
    },
  },

  list_photos: {
    verb: 'Listing photos',
    describeResult: (calls) =>
      `Found ${pluralize(countOutputItems(calls[0]), 'photo', 'photos')}`,
  },
  inspect_photo: {
    verb: 'Inspecting photo',
    verbPlural: 'Inspecting photos',
    totalCount: () => PHOTO_MANIFEST.length,
    describeResult: (calls) => {
      const n = calls.filter((c) => c.state === 'done').length;
      return `Inspected ${pluralize(n, 'photo', 'photos')}`;
    },
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
// considered done and flip from the present-tense `pending` label to
// the past-tense `done` label.
export interface NarrationLabel {
  pending: string;
  done: string;
}

export const FINALIZE_FIELD_NARRATIONS: Record<
  string,
  Record<string, NarrationLabel>
> = {
  report_findings: {
    document_inventory: {
      pending: 'Classifying documents…',
      done: 'Classified documents',
    },
    findings: {
      pending: 'Cross-referencing documents…',
      done: 'Cross-referenced documents',
    },
    routing: {
      pending: 'Determining routing decision…',
      done: 'Determined routing decision',
    },
    summary_markdown: {
      pending: 'Drafting file summary…',
      done: 'Drafted file summary',
    },
  },
  report_position: {
    position: {
      pending: 'Choosing coverage position…',
      done: 'Chose coverage position',
    },
    confidence: {
      pending: 'Scoring confidence…',
      done: 'Scored confidence',
    },
    applicable_deductible: {
      pending: 'Identifying applicable deductible…',
      done: 'Identified applicable deductible',
    },
    cited_clauses: {
      pending: 'Citing policy clauses…',
      done: 'Cited policy clauses',
    },
    flags: {
      pending: 'Surfacing review flags…',
      done: 'Surfaced review flags',
    },
    memo_markdown: {
      pending: 'Drafting coverage memo…',
      done: 'Drafted coverage memo',
    },
  },
  report_assessment: {
    classifications: {
      pending: 'Classifying photos…',
      done: 'Classified photos',
    },
    zones: {
      pending: 'Grouping into damage zones…',
      done: 'Grouped into damage zones',
    },
    peril_consistency: {
      pending: 'Assessing peril consistency…',
      done: 'Assessed peril consistency',
    },
    estimate_line_items: {
      pending: 'Building Xactimate estimate…',
      done: 'Built Xactimate estimate',
    },
  },
};

// Build the narration events that correspond to the current partial
// input of a finalize tool. `finished` flips the last in-progress row
// to done when the tool's output-available arrives.
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
      text: isDone ? fieldMap[field].done : fieldMap[field].pending,
      done: isDone,
    });
  }
  return result;
}

import { z, type ZodType } from 'zod';

export interface PersistedAgentResult<T> {
  object: T;
  startedAt: number;
  endedAt: number;
}

const envelopeSchema = z.object({
  object: z.unknown(),
  startedAt: z.number(),
  endedAt: z.number(),
});

export function loadAgentResult<T>(
  storageKey: string,
  schema: ZodType<T>
): PersistedAgentResult<T> | null {
  if (typeof window === 'undefined') return null;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
  const envelope = envelopeSchema.safeParse(parsed);
  if (!envelope.success) {
    window.localStorage.removeItem(storageKey);
    return null;
  }
  const object = schema.safeParse(envelope.data.object);
  if (!object.success) {
    window.localStorage.removeItem(storageKey);
    return null;
  }
  return {
    object: object.data,
    startedAt: envelope.data.startedAt,
    endedAt: envelope.data.endedAt,
  };
}

export function saveAgentResult<T>(
  storageKey: string,
  payload: PersistedAgentResult<T>
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Quota errors or disabled storage — silently skip; the in-memory
    // state still reflects the result for this session.
  }
}

export function clearAgentResult(storageKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
}

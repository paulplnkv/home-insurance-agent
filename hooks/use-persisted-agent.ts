'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { ZodType } from 'zod';
import type { DeepPartial } from 'ai';
import type { AgentState } from '@/components/workbench/agent-panel';
import {
  clearAgentResult,
  loadAgentResult,
  saveAgentResult,
  type PersistedAgentResult,
} from '@/lib/storage/agent-results';

interface RunMeta {
  startedAt: number;
  endedAt: number | null;
}

// Module-level store keyed by storageKey. Holds the cached parsed
// payload, the schema (needed to re-validate after a cross-tab storage
// event), and the set of React subscribers. This is what
// `useSyncExternalStore` reads from — the single source of truth for
// persisted agent results inside this tab.
interface KeyStore {
  value: PersistedAgentResult<unknown> | null;
  hydrated: boolean;
  schema: ZodType<unknown> | null;
  subscribers: Set<() => void>;
}

const stores = new Map<string, KeyStore>();
let storageListenerInstalled = false;

function getOrCreateStore(storageKey: string): KeyStore {
  let store = stores.get(storageKey);
  if (!store) {
    store = {
      value: null,
      hydrated: false,
      schema: null,
      subscribers: new Set(),
    };
    stores.set(storageKey, store);
  }
  return store;
}

function notify(store: KeyStore) {
  store.subscribers.forEach((sub) => sub());
}

function installStorageListenerOnce() {
  if (storageListenerInstalled || typeof window === 'undefined') return;
  storageListenerInstalled = true;
  window.addEventListener('storage', (event) => {
    if (!event.key) return;
    const store = stores.get(event.key);
    if (!store || !store.schema) return;
    store.value = loadAgentResult(event.key, store.schema);
    store.hydrated = true;
    notify(store);
  });
}

function subscribe(
  storageKey: string,
  schema: ZodType<unknown>,
  callback: () => void
): () => void {
  const store = getOrCreateStore(storageKey);
  store.schema = schema;
  if (!store.hydrated && typeof window !== 'undefined') {
    store.value = loadAgentResult(storageKey, schema);
    store.hydrated = true;
  }
  store.subscribers.add(callback);
  installStorageListenerOnce();
  return () => {
    store.subscribers.delete(callback);
  };
}

function getSnapshot<T>(
  storageKey: string
): PersistedAgentResult<T> | null {
  const store = stores.get(storageKey);
  return (store?.value ?? null) as PersistedAgentResult<T> | null;
}

function getServerSnapshot(): null {
  return null;
}

function writeStore<T>(
  storageKey: string,
  payload: PersistedAgentResult<T> | null
) {
  const store = getOrCreateStore(storageKey);
  store.value = payload as PersistedAgentResult<unknown> | null;
  store.hydrated = true;
  if (payload) {
    saveAgentResult(storageKey, payload);
  } else {
    clearAgentResult(storageKey);
  }
  notify(store);
}

export interface UsePersistedAgentOptions<T> {
  api: string;
  schema: ZodType<T>;
  storageKey: string;
}

export interface UsePersistedAgentResult<T> {
  object: DeepPartial<T> | undefined;
  state: AgentState;
  startedAt: number | null;
  endedAt: number | null;
  error: { message: string } | null;
  resetKey: number;
  submit: () => void;
  stop: () => void;
  reset: () => void;
}

export function usePersistedAgent<T>({
  api,
  schema,
  storageKey,
}: UsePersistedAgentOptions<T>): UsePersistedAgentResult<T> {
  const subscribeForKey = useCallback(
    (cb: () => void) =>
      subscribe(storageKey, schema as ZodType<unknown>, cb),
    [storageKey, schema]
  );
  const getSnapshotForKey = useCallback(
    () => getSnapshot<T>(storageKey),
    [storageKey]
  );

  const persisted = useSyncExternalStore(
    subscribeForKey,
    getSnapshotForKey,
    getServerSnapshot
  );

  // Run metadata for the *current* React tree. Hydrates from the
  // persisted payload when there's nothing in-flight locally; a fresh
  // local submit overrides it for the duration of the run.
  const [localRun, setLocalRun] = useState<RunMeta | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const lastSeenPersistedRef = useRef<PersistedAgentResult<T> | null>(persisted);

  const { object, submit, stop, clear, isLoading, error } = useObject({
    api,
    schema,
    onFinish: ({ object: finalObject }) => {
      const endedAt = Date.now();
      setLocalRun((prev) =>
        prev && prev.endedAt === null ? { ...prev, endedAt } : prev
      );
      if (finalObject) {
        const startedAt = startedAtRef.current ?? endedAt;
        const payload: PersistedAgentResult<T> = {
          object: finalObject,
          startedAt,
          endedAt,
        };
        lastSeenPersistedRef.current = payload;
        writeStore<T>(storageKey, payload);
      }
    },
    onError: () => {
      setLocalRun((prev) =>
        prev && prev.endedAt === null
          ? { ...prev, endedAt: Date.now() }
          : prev
      );
    },
  });

  // React to persisted-state changes that didn't originate from this
  // hook instance (other view in the same tab, or another tab). When
  // the persisted reference changes externally, drop any locally
  // streamed object so the external value renders cleanly.
  useEffect(() => {
    if (persisted === lastSeenPersistedRef.current) return;
    lastSeenPersistedRef.current = persisted;
    clear();
    setLocalRun(null);
    setResetKey((k) => k + 1);
    startedAtRef.current = null;
  }, [persisted, clear]);

  const handleSubmit = useCallback(() => {
    const startedAt = Date.now();
    startedAtRef.current = startedAt;
    setLocalRun({ startedAt, endedAt: null });
    setResetKey((k) => k + 1);
    submit({});
  }, [submit]);

  const handleReset = useCallback(() => {
    if (isLoading) stop();
    clear();
    setLocalRun(null);
    setResetKey((k) => k + 1);
    startedAtRef.current = null;
    lastSeenPersistedRef.current = null;
    writeStore<T>(storageKey, null);
  }, [clear, isLoading, stop, storageKey]);

  const state: AgentState = error
    ? 'error'
    : isLoading
      ? 'running'
      : localRun || persisted
        ? 'complete'
        : 'idle';

  const startedAt = localRun?.startedAt ?? persisted?.startedAt ?? null;
  const endedAt =
    localRun?.endedAt !== undefined
      ? localRun.endedAt
      : (persisted?.endedAt ?? null);

  const displayObject: DeepPartial<T> | undefined =
    isLoading || object !== undefined
      ? object
      : (persisted?.object as DeepPartial<T> | undefined);

  return {
    object: displayObject,
    state,
    startedAt,
    endedAt,
    error: error ? { message: error.message } : null,
    resetKey,
    submit: handleSubmit,
    stop,
    reset: handleReset,
  };
}

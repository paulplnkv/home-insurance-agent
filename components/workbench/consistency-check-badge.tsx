'use client';

import { useSyncExternalStore } from 'react';
import { Badge } from '@/components/ui/badge';
import { REAL_CLAIM_AGENT_KEYS } from '@/lib/scenario/dashboard-claims';
import { loadAgentResult } from '@/lib/storage/agent-results';
import { crossDocFindingsSchema } from '@/lib/agents/documents/schema';

const DOCUMENTS_KEY = REAL_CLAIM_AGENT_KEYS.documents;

type Snapshot =
  | { kind: 'pending' }
  | { kind: 'clean' }
  | { kind: 'flagged'; count: number };

const SERVER_SNAPSHOT: Snapshot = { kind: 'pending' };

let cachedSnapshot: Snapshot = SERVER_SNAPSHOT;

function readSnapshot(): Snapshot {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  const result = loadAgentResult(DOCUMENTS_KEY, crossDocFindingsSchema);
  const next: Snapshot = !result
    ? { kind: 'pending' }
    : result.object.findings.length === 0
      ? { kind: 'clean' }
      : { kind: 'flagged', count: result.object.findings.length };
  if (
    next.kind !== cachedSnapshot.kind ||
    (next.kind === 'flagged' &&
      cachedSnapshot.kind === 'flagged' &&
      next.count !== cachedSnapshot.count)
  ) {
    cachedSnapshot = next;
  }
  return cachedSnapshot;
}

function subscribe(notify: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === null || event.key === DOCUMENTS_KEY) notify();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

export function ConsistencyCheckBadge({ className }: { className?: string }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    readSnapshot,
    getServerSnapshot,
  );

  if (snapshot.kind === 'pending') {
    return (
      <Badge
        variant="outline"
        className={`gap-1 font-normal text-amber-700 dark:text-amber-400 ${className ?? ''}`.trim()}
      >
        <span aria-hidden>⚠️</span>
        Consistency Check Pending
      </Badge>
    );
  }

  if (snapshot.kind === 'clean') {
    return (
      <Badge variant="secondary" className={`gap-1 font-normal ${className ?? ''}`.trim()}>
        <span aria-hidden>✅</span>
        No issues found
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className={`gap-1 font-normal ${className ?? ''}`.trim()}>
      <span aria-hidden>🚨</span>
      {snapshot.count} {snapshot.count === 1 ? 'flag' : 'flags'} raised
    </Badge>
  );
}

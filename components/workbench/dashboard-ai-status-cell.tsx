'use client';

import { useSyncExternalStore } from 'react';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
} from 'lucide-react';
import { REAL_CLAIM_AGENT_KEYS } from '@/lib/scenario/dashboard-claims';
import { TIER3_CONFIRMED_KEY } from '@/lib/scenario/tier3';
import { cn } from '@/lib/utils';

type AiStatus = 'pending' | 'running' | 'complete' | 'action_needed';

// Keys observed by `useSyncExternalStore` snapshot. Subscribed via the
// `storage` event so updates from other tabs/pages re-render this cell.
const WATCHED_KEYS: readonly string[] = [
  REAL_CLAIM_AGENT_KEYS.coverage,
  REAL_CLAIM_AGENT_KEYS.damage,
  REAL_CLAIM_AGENT_KEYS.documents,
  TIER3_CONFIRMED_KEY,
];

function subscribe(notify: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === null || WATCHED_KEYS.includes(event.key)) notify();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function readStatus(): AiStatus {
  if (typeof window === 'undefined') return 'pending';
  const hasCoverage = window.localStorage.getItem(REAL_CLAIM_AGENT_KEYS.coverage) != null;
  const hasDamage = window.localStorage.getItem(REAL_CLAIM_AGENT_KEYS.damage) != null;
  const hasDocuments = window.localStorage.getItem(REAL_CLAIM_AGENT_KEYS.documents) != null;
  const completedCount = Number(hasCoverage) + Number(hasDamage) + Number(hasDocuments);
  if (completedCount === 0) return 'pending';
  if (completedCount === 3) {
    const tier3Confirmed = window.localStorage.getItem(TIER3_CONFIRMED_KEY) != null;
    return tier3Confirmed ? 'complete' : 'action_needed';
  }
  return 'complete';
}

function getServerSnapshot(): AiStatus {
  return 'pending';
}

const STATUS_PRESENTATION: Record<
  AiStatus,
  { icon: typeof ClockIcon; title: string; className: string; spin?: boolean }
> = {
  pending: {
    icon: ClockIcon,
    title: 'AI: Pending',
    className: 'text-muted-foreground',
  },
  running: {
    icon: Loader2Icon,
    title: 'AI: Running',
    className: 'text-blue-600',
    spin: true,
  },
  complete: {
    icon: CheckCircle2Icon,
    title: 'AI: Complete',
    className: 'text-emerald-600',
  },
  action_needed: {
    icon: AlertCircleIcon,
    title: 'AI: Action needed',
    className: 'text-amber-600',
  },
};

export function DashboardAiStatusCell({ isReal }: { isReal: boolean }) {
  const liveStatus = useSyncExternalStore(subscribe, readStatus, getServerSnapshot);
  const status: AiStatus = isReal ? liveStatus : 'pending';
  const { icon: Icon, title, className, spin } = STATUS_PRESENTATION[status];

  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <Icon className={cn('h-4 w-4', spin && 'animate-spin')} aria-hidden />
    </span>
  );
}

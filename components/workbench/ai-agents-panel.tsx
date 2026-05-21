'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import {
  ArrowRightIcon,
  FileSearchIcon,
  HammerIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { REAL_CLAIM_AGENT_KEYS } from '@/lib/scenario/dashboard-claims';
import { TIER3_CONFIRMED_KEY } from '@/lib/scenario/tier3';
import { formatDateTime } from '@/lib/scenario/claim';

type Action = {
  href: string;
  title: string;
  description: string;
  icon: typeof ShieldCheckIcon;
};

const ACTIONS: ReadonlyArray<Action> = [
  {
    href: '/agents/coverage',
    title: 'Run coverage check',
    description: 'Verify the HO-3 covers hail to roof, gutters, and skylight.',
    icon: ShieldCheckIcon,
  },
  {
    href: '/agents/damage',
    title: 'Assess damages',
    description: 'Score field photos and call out replacement candidates.',
    icon: HammerIcon,
  },
  {
    href: '/agents/documents',
    title: 'Review documents',
    description: 'Cross-check the file for inconsistencies and missing paperwork.',
    icon: FileSearchIcon,
  },
];

type EndedAtMap = Record<string, number | null>;

const AGENT_KEYS = [
  REAL_CLAIM_AGENT_KEYS.coverage,
  REAL_CLAIM_AGENT_KEYS.damage,
  REAL_CLAIM_AGENT_KEYS.documents,
] as const;
const WATCHED = [...AGENT_KEYS, TIER3_CONFIRMED_KEY];

type Snapshot = {
  endedAt: EndedAtMap;
  tier3Confirmed: boolean;
};

const SERVER_SNAPSHOT: Snapshot = {
  endedAt: {
    [REAL_CLAIM_AGENT_KEYS.coverage]: null,
    [REAL_CLAIM_AGENT_KEYS.damage]: null,
    [REAL_CLAIM_AGENT_KEYS.documents]: null,
  },
  tier3Confirmed: false,
};

let cachedSnapshot: Snapshot = SERVER_SNAPSHOT;

function readEndedAt(key: string): number | null {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { endedAt?: unknown };
    return typeof parsed.endedAt === 'number' ? parsed.endedAt : null;
  } catch {
    return null;
  }
}

function readSnapshot(): Snapshot {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  const endedAt: EndedAtMap = {
    [REAL_CLAIM_AGENT_KEYS.coverage]: readEndedAt(REAL_CLAIM_AGENT_KEYS.coverage),
    [REAL_CLAIM_AGENT_KEYS.damage]: readEndedAt(REAL_CLAIM_AGENT_KEYS.damage),
    [REAL_CLAIM_AGENT_KEYS.documents]: readEndedAt(REAL_CLAIM_AGENT_KEYS.documents),
  };
  const tier3Confirmed =
    window.localStorage.getItem(TIER3_CONFIRMED_KEY) != null;
  const changed =
    tier3Confirmed !== cachedSnapshot.tier3Confirmed ||
    AGENT_KEYS.some((k) => endedAt[k] !== cachedSnapshot.endedAt[k]);
  if (changed) {
    cachedSnapshot = { endedAt, tier3Confirmed };
  }
  return cachedSnapshot;
}

function subscribe(notify: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === null || WATCHED.includes(event.key)) notify();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function formatTimestamp(ms: number): string {
  return formatDateTime(new Date(ms).toISOString());
}

type StatusLine =
  | { kind: 'awaiting' }
  | { kind: 'written'; label: string };

function statusFor(href: string, snapshot: Snapshot): StatusLine | null {
  if (href === '/agents/coverage') {
    const endedAt = snapshot.endedAt[REAL_CLAIM_AGENT_KEYS.coverage];
    if (endedAt == null) return null;
    if (!snapshot.tier3Confirmed) return { kind: 'awaiting' };
    return {
      kind: 'written',
      label: `M2 output written to Coverages tab · ${formatTimestamp(endedAt)}`,
    };
  }
  if (href === '/agents/damage') {
    const endedAt = snapshot.endedAt[REAL_CLAIM_AGENT_KEYS.damage];
    if (endedAt == null) return null;
    return {
      kind: 'written',
      label: `M6b manifest written to Damages tab · ${formatTimestamp(endedAt)}`,
    };
  }
  if (href === '/agents/documents') {
    const endedAt = snapshot.endedAt[REAL_CLAIM_AGENT_KEYS.documents];
    if (endedAt == null) return null;
    return {
      kind: 'written',
      label: `M6e findings written to Documents tab · ${formatTimestamp(endedAt)}`,
    };
  }
  return null;
}

export function AiAgentsPanel() {
  const snapshot = useSyncExternalStore(
    subscribe,
    readSnapshot,
    getServerSnapshot,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">AI agents</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pb-4">
        {ACTIONS.map((action) => {
          const status = statusFor(action.href, snapshot);
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-3 rounded-md border bg-card p-3 transition-colors hover:border-foreground/30 hover:bg-accent/40"
            >
              <action.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">{action.title}</span>
                <span className="text-xs text-muted-foreground">
                  {action.description}
                </span>
                {status ? (
                  <span
                    className={
                      status.kind === 'awaiting'
                        ? 'mt-1 text-[11px] text-amber-700 dark:text-amber-400'
                        : 'mt-1 text-[11px] text-muted-foreground'
                    }
                  >
                    {status.kind === 'awaiting' ? (
                      <>
                        <span aria-hidden>⏳ </span>
                        Awaiting adjuster confirmation before writing to claim file.
                      </>
                    ) : (
                      <>
                        <span aria-hidden>✅ </span>
                        {status.label}
                      </>
                    )}
                  </span>
                ) : null}
              </div>
              <ArrowRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { ArrowRightIcon } from 'lucide-react';
import {
  CoverageAgentIcon,
  DamageAgentIcon,
  DocumentAgentIcon,
} from '@/components/icons/ai-agent-icons';
import { REAL_CLAIM_AGENT_KEYS } from '@/lib/scenario/dashboard-claims';
import { TIER3_CONFIRMED_KEY } from '@/lib/scenario/tier3';
import { CLAIM, formatDateTime } from '@/lib/scenario/claim';
import { SectionCard, SectionTitle } from './section-card';

type Action = {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const ACTIONS: ReadonlyArray<Action> = [
  {
    href: `/claims/${CLAIM.claim_number}/coverages`,
    title: 'Run coverage check',
    description: 'Verify the HO-3 covers hail to roof, gutters, and skylight.',
    icon: CoverageAgentIcon,
  },
  {
    href: `/claims/${CLAIM.claim_number}/damages`,
    title: 'Assess damages',
    description: 'Score field photos and call out replacement candidates.',
    icon: DamageAgentIcon,
  },
  {
    href: `/claims/${CLAIM.claim_number}/documents`,
    title: 'Review documents',
    description: 'Cross-check the file for inconsistencies and missing paperwork.',
    icon: DocumentAgentIcon,
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
  if (href.endsWith('/coverages')) {
    const endedAt = snapshot.endedAt[REAL_CLAIM_AGENT_KEYS.coverage];
    if (endedAt == null) return null;
    if (!snapshot.tier3Confirmed) return { kind: 'awaiting' };
    return {
      kind: 'written',
      label: `M2 output written to Coverages tab · ${formatTimestamp(endedAt)}`,
    };
  }
  if (href.endsWith('/damages')) {
    const endedAt = snapshot.endedAt[REAL_CLAIM_AGENT_KEYS.damage];
    if (endedAt == null) return null;
    return {
      kind: 'written',
      label: `M6b manifest written to Damages tab · ${formatTimestamp(endedAt)}`,
    };
  }
  if (href.endsWith('/documents')) {
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
    <SectionCard>
      <SectionTitle>AI agents</SectionTitle>
      <div className="flex flex-col gap-4">
        {ACTIONS.map((action) => {
          const status = statusFor(action.href, snapshot);
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start justify-between gap-3 rounded-[8px] bg-white p-4 shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#fafbff]"
            >
              <action.icon className="mt-0.5 size-6 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="text-[16px] font-semibold text-[var(--ink)]">
                  {action.title}
                </span>
                <span className="text-[14px] text-[var(--ink)]">
                  {action.description}
                </span>
                {status ? (
                  <span
                    className={
                      status.kind === 'awaiting'
                        ? 'text-[14px] text-[var(--status-review-fg)]'
                        : 'text-[14px] text-[var(--ink-soft)]'
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
              <ArrowRightIcon className="mt-1 size-4 shrink-0 text-[var(--ink-soft)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--ink)]" />
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}

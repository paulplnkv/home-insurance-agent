'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { REAL_CLAIM_AGENT_KEYS } from '@/lib/scenario/dashboard-claims';
import { TIER3_CONFIRMED_KEY } from '@/lib/scenario/tier3';
import { CLAIM } from '@/lib/scenario/claim';
import { SectionCard, SectionTitle } from './section-card';

const COVERAGE_KEY = REAL_CLAIM_AGENT_KEYS.coverage;
const WATCHED = [COVERAGE_KEY, TIER3_CONFIRMED_KEY];

type Snapshot = { m2Ran: boolean; tier3Confirmed: boolean };

const SERVER_SNAPSHOT: Snapshot = { m2Ran: false, tier3Confirmed: false };

let cachedSnapshot: Snapshot = SERVER_SNAPSHOT;

function readSnapshot(): Snapshot {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  const next: Snapshot = {
    m2Ran: window.localStorage.getItem(COVERAGE_KEY) != null,
    tier3Confirmed: window.localStorage.getItem(TIER3_CONFIRMED_KEY) != null,
  };
  if (
    next.m2Ran !== cachedSnapshot.m2Ran ||
    next.tier3Confirmed !== cachedSnapshot.tier3Confirmed
  ) {
    cachedSnapshot = next;
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

function confirmTier3() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TIER3_CONFIRMED_KEY, new Date().toISOString());
  window.dispatchEvent(
    new StorageEvent('storage', { key: TIER3_CONFIRMED_KEY }),
  );
}

export function ClaimPendingApprovals() {
  const { m2Ran, tier3Confirmed } = useSyncExternalStore(
    subscribe,
    readSnapshot,
    getServerSnapshot,
  );

  const showItem = m2Ran && !tier3Confirmed;

  return (
    <SectionCard>
      <SectionTitle>Pending approvals</SectionTitle>
      {showItem ? (
        <div className="flex flex-col gap-3 rounded-[8px] bg-white p-4 shadow-[0_0_20px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-1">
            <span className="text-[16px] font-semibold leading-tight text-[var(--ink)]">
              <span aria-hidden>⏳ </span>
              Coverage position requires adjuster confirmation
            </span>
            <span className="text-[14px] text-[var(--ink-soft)]">
              M2 · Coverage Agent · Tier 3
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={confirmTier3}>
              Confirm
            </Button>
            <Link
              href={`/claims/${CLAIM.claim_number}/coverages`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              Review
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-[var(--ink-soft)]">
          No items pending — run AI agents to generate approval items
        </p>
      )}
    </SectionCard>
  );
}

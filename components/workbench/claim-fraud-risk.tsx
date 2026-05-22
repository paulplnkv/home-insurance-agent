'use client';

import { useSyncExternalStore } from 'react';
import { REAL_CLAIM_AGENT_KEYS } from '@/lib/scenario/dashboard-claims';
import { SectionCard, SectionTitle } from './section-card';

const DOCUMENTS_KEY = REAL_CLAIM_AGENT_KEYS.documents;

function subscribe(notify: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === null || event.key === DOCUMENTS_KEY) notify();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DOCUMENTS_KEY) != null;
}

function getServerSnapshot(): boolean {
  return false;
}

export function ClaimFraudRisk() {
  const m6eRan = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <SectionCard>
      <SectionTitle>Fraud Risk</SectionTitle>

      <Row label="RISK SCORE">
        <span className="inline-flex items-center rounded-full border border-[var(--status-cat-fg)] bg-[var(--status-cat-bg)] px-2 py-1 text-[14px] text-[var(--status-cat-fg)]">
          Medium
        </span>
      </Row>
      <Divider />
      <Row label="ISO CLAIMSEARCH">
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-review-fg)] bg-[var(--status-review-bg)] px-2 py-1 text-[14px] text-[var(--status-review-fg)]">
          <span aria-hidden>⏳</span> Pending
        </span>
      </Row>
      <Divider />
      <Row label="SIU REFERRAL STATUS">
        {m6eRan ? (
          <span className="inline-flex items-center rounded-full border border-[var(--status-danger-fg)] bg-[var(--status-danger-bg)] px-2 py-1 text-[14px] text-[var(--status-danger-fg)]">
            Open — 2 Critical findings
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-review-fg)] bg-[var(--status-review-bg)] px-2 py-1 text-[14px] text-[var(--status-review-fg)]">
            <span aria-hidden>⏳</span> Pending
          </span>
        )}
      </Row>
      <Divider />
      <Row label="FLAG COUNT">
        <span className="text-[14px] text-[var(--ink)]">0 active</span>
      </Row>
    </SectionCard>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px] text-[var(--ink-soft)]">{label}</span>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[var(--line-soft)]" />;
}

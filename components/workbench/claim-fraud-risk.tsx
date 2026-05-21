'use client';

import { useSyncExternalStore } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { REAL_CLAIM_AGENT_KEYS } from '@/lib/scenario/dashboard-claims';

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Fraud Risk</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pb-4">
        <Row label="Risk Score">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            Medium
          </span>
        </Row>
        <Row label="ISO ClaimSearch">
          <span className="text-sm text-muted-foreground">Pending</span>
        </Row>
        <Row label="SIU Referral Status">
          {m6eRan ? (
            <span className="text-sm font-medium text-red-600">
              Open — 2 Critical findings
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Pending — awaiting M6e output
            </span>
          )}
        </Row>
        <Row label="Flag count">
          <span className="text-sm text-muted-foreground">0 active</span>
        </Row>
      </CardContent>
    </Card>
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
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

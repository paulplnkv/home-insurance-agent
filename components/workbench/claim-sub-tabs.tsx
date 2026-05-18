'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CLAIM } from '@/lib/scenario/claim';

const TABS: ReadonlyArray<{ label: string; href?: string }> = [
  { label: 'Summary', href: `/claims/${CLAIM.claim_number}` },
  { label: 'Coverages', href: '/agents/coverage' },
  { label: 'Damages', href: '/agents/damage' },
  { label: 'Documents', href: '/agents/documents' },
  { label: 'Notes' },
  { label: 'Diary' },
];

function isActive(pathname: string, href: string | undefined): boolean {
  if (!href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ClaimSubTabs() {
  const pathname = usePathname();
  return (
    <div className="border-b bg-card">
      <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-6 text-sm">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          const className = active
            ? 'border-b-2 border-foreground py-2 font-medium text-foreground'
            : tab.href
              ? 'py-2 text-muted-foreground transition-colors hover:text-foreground'
              : 'py-2 text-muted-foreground/60';
          return tab.href ? (
            <Link key={tab.label} href={tab.href} className={className}>
              {tab.label}
            </Link>
          ) : (
            <span key={tab.label} className={className}>
              {tab.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

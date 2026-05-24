'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CLAIM } from '@/lib/scenario/claim';

const TABS: ReadonlyArray<{ label: string; href?: string; exact?: boolean }> = [
  { label: 'Summary', href: `/claims/${CLAIM.claim_number}`, exact: true },
  { label: 'Coverages', href: `/claims/${CLAIM.claim_number}/coverages` },
  { label: 'Damages', href: `/claims/${CLAIM.claim_number}/damages` },
  { label: 'Documents', href: `/claims/${CLAIM.claim_number}/documents` },
  { label: 'Notes' },
  { label: 'Diary' },
];

function isActive(
  pathname: string,
  href: string | undefined,
  exact?: boolean,
): boolean {
  if (!href) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ClaimSubTabs() {
  const pathname = usePathname();
  return (
    <div className="sticky top-[49px] z-20 border-b border-[var(--line-soft)] bg-[var(--surface-tab-track)]">
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-10 text-xs">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href, tab.exact);
          const className = active
            ? 'border-b-2 border-[var(--brand-blue)] py-4 font-normal text-[var(--ink)]'
            : tab.href
              ? 'py-4 text-[var(--ink)] transition-colors hover:text-[var(--brand-blue)]'
              : 'py-4 text-[var(--ink)]';
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

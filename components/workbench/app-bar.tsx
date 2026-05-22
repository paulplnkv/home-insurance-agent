import { CLAIM } from '@/lib/scenario/claim';

const GLOBAL_NAV = ['Dashboard', 'Queue', 'Reports'] as const;

export function AppBar() {
  return (
    <div className="border-b border-[var(--line-soft)] bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-6 px-10 py-4 text-xs">
        <div className="flex items-center">
          <span className="font-bold tracking-wider text-[var(--brand-blue)]">
            PACIFIC STATES MUTUAL
          </span>
          <div className="ml-12 flex items-center gap-6">
            <span className="text-[var(--brand-blue)]">Claims</span>
            {GLOBAL_NAV.map((item) => (
              <span key={item} className="text-[var(--ink)]">
                {item}
              </span>
            ))}
          </div>
        </div>
        <span className="text-[var(--ink)]">{CLAIM.adjuster.name}</span>
      </div>
    </div>
  );
}

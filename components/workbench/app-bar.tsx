import { CLAIM } from '@/lib/scenario/claim';

const GLOBAL_NAV = ['Dashboard', 'Queue', 'Reports'] as const;

export function AppBar() {
  return (
    <div className="border-b bg-card">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-6 py-2.5 text-xs">
        <div className="flex items-center gap-5">
          <span className="font-semibold uppercase tracking-wider text-foreground">
            Pacific States Mutual
          </span>
          <span className="text-muted-foreground">Claims</span>
          {GLOBAL_NAV.map((item) => (
            <span key={item} className="text-muted-foreground/60">
              {item}
            </span>
          ))}
        </div>
        <span className="text-muted-foreground">{CLAIM.adjuster.name}</span>
      </div>
    </div>
  );
}

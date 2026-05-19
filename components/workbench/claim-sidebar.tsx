import Link from 'next/link';
import {
  ArrowRightIcon,
  CameraIcon,
  ClockIcon,
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
import { CLAIM, formatDateTime } from '@/lib/scenario/claim';
import { PHOTO_MANIFEST } from '@/lib/scenario/photos';

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

export function ClaimSidebar() {
  return (
    <aside className="flex flex-col gap-4">
      <NextActions />
      <Parties />
      <Timeline />
    </aside>
  );
}

function NextActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">AI agents</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pb-4">
        {ACTIONS.map((action) => (
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
            </div>
            <ArrowRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Parties() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Parties</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pb-4">
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
          >
            {initials(CLAIM.adjuster.name)}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Adjuster
            </span>
            <span className="text-sm font-medium leading-tight">
              {CLAIM.adjuster.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {CLAIM.adjuster.email}
            </span>
            <span className="text-xs text-muted-foreground">
              {CLAIM.adjuster.phone}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-md border border-dashed bg-muted/30 p-3">
          <div
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground"
          >
            <HammerIcon className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Field contractor
            </span>
            <span className="text-sm font-medium leading-tight text-muted-foreground">
              Pending assignment
            </span>
            <span className="text-xs text-muted-foreground">
              Auto-dispatch after damage assessment runs.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type TimelineEvent = {
  icon: typeof ClockIcon;
  title: string;
  detail: string;
  meta: string;
  muted?: boolean;
};

function Timeline() {
  const events: TimelineEvent[] = [
    {
      icon: ClockIcon,
      title: 'FNOL filed',
      detail: `Reported via ${CLAIM.insured.preferred_contact} by ${CLAIM.insured.name}.`,
      meta: formatDateTime(CLAIM.loss.fnol_filed_at),
    },
    {
      icon: CameraIcon,
      title: 'Field photos uploaded',
      detail: `${PHOTO_MANIFEST.length} photos staged for damage assessment.`,
      meta: 'Today',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Awaiting agent runs',
      detail: 'Coverage, damage, and document agents have not run yet.',
      meta: 'Pending',
      muted: true,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Claim timeline</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
          {events.map((event) => (
            <li key={event.title} className="relative">
              <span
                aria-hidden
                className="absolute -left-[1.55rem] top-0.5 flex size-4 items-center justify-center rounded-full border bg-background"
              >
                <event.icon
                  className={
                    event.muted
                      ? 'size-2.5 text-muted-foreground'
                      : 'size-2.5 text-foreground'
                  }
                />
              </span>
              <div className="flex flex-col gap-0.5">
                <span
                  className={
                    event.muted
                      ? 'text-sm font-medium text-muted-foreground'
                      : 'text-sm font-medium'
                  }
                >
                  {event.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {event.detail}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
                  {event.meta}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

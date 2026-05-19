import {
  AlertTriangleIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Field } from './field';
import { StatusBadge } from './status-badge';
import {
  CLAIM,
  daysSince,
  formatDate,
  formatDateTime,
} from '@/lib/scenario/claim';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ClaimHeader() {
  const open = daysSince(CLAIM.loss.fnol_filed_at);
  const reportedVia =
    CLAIM.insured.preferred_contact === 'SMS'
      ? 'SMS · Insured'
      : `${CLAIM.insured.preferred_contact} · Insured`;

  return (
    <header className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-6 px-6 py-5">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span>Claim</span>
            <span aria-hidden>·</span>
            <span>Policy {CLAIM.policy.number}</span>
          </div>
          <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xl font-semibold leading-tight">
            <span>{CLAIM.claim_number}</span>
            <span className="text-muted-foreground">·</span>
            <span>{CLAIM.insured.name}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              {CLAIM.insured.address}
            </span>
            <Badge
              variant="outline"
              className="gap-1 font-normal text-amber-700 dark:text-amber-400"
            >
              <AlertTriangleIcon className="size-3" />
              {CLAIM.loss.cat_event}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={CLAIM.status} className="text-xs" />
          <AdjusterCard />
        </div>
      </div>

      <Separator />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-4 sm:grid-cols-3 md:grid-cols-6">
        <Field label="Peril" value={CLAIM.loss.peril} />
        <Field
          label="Date of loss"
          value={formatDate(CLAIM.loss.date_of_loss)}
        />
        <Field
          label="FNOL filed"
          value={formatDateTime(CLAIM.loss.fnol_filed_at)}
        />
        <Field label="Days open" value={`${open} ${open === 1 ? 'day' : 'days'}`} />
        <Field label="Reported via" value={reportedVia} />
        <Field label="Loss state" value={CLAIM.loss.location_state} />
      </dl>
    </header>
  );
}

function AdjusterCard() {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-background/40 px-3 py-2">
      <div
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground"
      >
        {initials(CLAIM.adjuster.name)}
      </div>
      <div className="flex flex-col gap-0.5 text-left">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Assigned adjuster
        </span>
        <span className="text-sm font-medium leading-tight">
          {CLAIM.adjuster.name}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {CLAIM.adjuster.team}
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          <a
            href={`tel:${CLAIM.adjuster.phone}`}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <PhoneIcon className="size-3" />
            {CLAIM.adjuster.phone}
          </a>
          <a
            href={`mailto:${CLAIM.adjuster.email}`}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <MailIcon className="size-3" />
            {CLAIM.adjuster.email}
          </a>
        </div>
      </div>
    </div>
  );
}

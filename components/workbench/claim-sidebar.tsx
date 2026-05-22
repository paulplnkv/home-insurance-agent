import {
  CameraIcon,
  ClockIcon,
  HammerIcon,
  MailIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { AiAgentsPanel } from './ai-agents-panel';
import { ClaimRegulatoryDeadlines } from './claim-regulatory-deadlines';
import { ClaimFraudRisk } from './claim-fraud-risk';
import { ClaimPendingApprovals } from './claim-pending-approvals';
import { FieldTile, SectionCard, SectionTitle } from './section-card';
import { CLAIM, formatCurrency, formatDate, formatDateTime } from '@/lib/scenario/claim';
import { PHOTO_MANIFEST } from '@/lib/scenario/photos';

export function ClaimSidebar() {
  return (
    <aside className="flex flex-col gap-4">
      <AiAgentsPanel />
      <Reserve />
      <ClaimRegulatoryDeadlines />
      <ClaimFraudRisk />
      <ClaimPendingApprovals />
      <Parties />
      <Timeline />
    </aside>
  );
}

function Reserve() {
  return (
    <SectionCard>
      <SectionTitle>Reserve</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <FieldTile label="INITIAL RESERVE" value={formatCurrency(22_000)} />
        <FieldTile label="CURRENT RESERVE" value={formatCurrency(22_000)} />
        <FieldTile label="LAST UPDATED" value={formatDate('2026-04-23')} />
        <FieldTile label="RESERVE ADEQUACY" value="Under review" />
      </div>
    </SectionCard>
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
    <SectionCard>
      <SectionTitle>Parties</SectionTitle>

      <div className="flex items-start gap-4">
        <div
          aria-hidden
          className="flex size-[71px] shrink-0 items-center justify-center rounded-full border border-[var(--line-soft)] bg-[#edf3ff] text-[24px] font-semibold text-[var(--brand-blue)]"
        >
          {initials(CLAIM.adjuster.name)}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[14px] text-[var(--ink)]">ADJUSTER</span>
          <span className="text-[24px] font-semibold leading-tight text-[var(--ink)]">
            {CLAIM.adjuster.name}
          </span>
          <a
            href={`tel:${CLAIM.adjuster.phone}`}
            className="inline-flex items-center gap-1 text-[14px] text-[var(--brand-blue)] hover:underline"
          >
            <PhoneIcon className="size-4" />
            {CLAIM.adjuster.phone}
          </a>
          <a
            href={`mailto:${CLAIM.adjuster.email}`}
            className="inline-flex items-center gap-1 text-[14px] text-[var(--brand-blue)] hover:underline"
          >
            <MailIcon className="size-4" />
            {CLAIM.adjuster.email}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-[8px] bg-white p-4 shadow-[0_0_20px_rgba(0,0,0,0.1)]">
        <HammerIcon className="size-6 shrink-0 text-[var(--ink-soft)]" />
        <div className="flex flex-col gap-1">
          <span className="text-[14px] text-[var(--ink-soft)]">
            FIELD CONTRACTOR
          </span>
          <span className="text-[16px] font-semibold text-[var(--ink)]">
            Pending Assignment
          </span>
          <span className="text-[14px] text-[var(--ink)]">
            Auto-dispatch after damage assessment runs.
          </span>
        </div>
      </div>
    </SectionCard>
  );
}

type TimelineEvent = {
  icon: typeof ClockIcon;
  title: string;
  detail: string;
  meta: string;
  pending?: boolean;
};

function Timeline() {
  const events: TimelineEvent[] = [
    {
      icon: ClockIcon,
      title: 'FNOL filed',
      detail: `Reported via ${CLAIM.insured.preferred_contact} by ${CLAIM.insured.name}`,
      meta: formatDateTime(CLAIM.loss.fnol_filed_at).toUpperCase(),
    },
    {
      icon: CameraIcon,
      title: 'Field photos uploaded',
      detail: `${PHOTO_MANIFEST.length} photos staged for damage assessment`,
      meta: 'TODAY',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Awaiting agent runs',
      detail: 'Coverage, damage, and document agents have not run yet',
      meta: '',
      pending: true,
    },
  ];

  return (
    <SectionCard>
      <SectionTitle>Claim timeline</SectionTitle>
      <ol className="flex flex-col gap-6">
        {events.map((event, idx) => {
          const last = idx === events.length - 1;
          return (
            <li key={event.title} className="relative flex gap-4">
              {!last ? (
                <span
                  aria-hidden
                  className="absolute left-[15px] top-8 h-[calc(100%+0.75rem)] w-px bg-[var(--line-soft)]"
                />
              ) : null}
              <span
                aria-hidden
                className={
                  event.pending
                    ? 'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--brand-blue)] bg-[#edf3ff] text-[var(--brand-blue)]'
                    : 'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white'
                }
              >
                <event.icon className="size-4" />
              </span>
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[16px] font-semibold text-[var(--ink)]">
                  {event.title}
                </span>
                <span className="text-[14px] text-[var(--ink)]">
                  {event.detail}
                </span>
                {event.meta ? (
                  <span className="text-[14px] text-[var(--ink-soft)]">
                    {event.meta}
                  </span>
                ) : null}
                {event.pending ? (
                  <span className="inline-flex w-fit items-center gap-1 rounded-full border border-[var(--status-review-fg)] bg-[var(--status-review-bg)] px-2 py-1 text-[14px] text-[var(--status-review-fg)]">
                    <span aria-hidden>⏳</span> Pending
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}

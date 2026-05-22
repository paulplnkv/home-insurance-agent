import { MailIcon, MapPinIcon, MessageSquareIcon, PhoneIcon } from 'lucide-react';
import { CLAIM, formatDate, formatDateTime } from '@/lib/scenario/claim';
import { SectionCard, SectionTitle } from './section-card';

const PREFERRED_ICON = {
  SMS: MessageSquareIcon,
  Email: MailIcon,
  Phone: PhoneIcon,
} as const;

export function ClaimInsuredLoss() {
  const PreferredIcon = PREFERRED_ICON[CLAIM.insured.preferred_contact];

  return (
    <SectionCard>
      <SectionTitle>Insured &amp; loss</SectionTitle>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex w-full flex-col gap-4 rounded-[8px] bg-white p-6 shadow-[0_0_20px_rgba(0,0,0,0.1)] md:w-[262px] md:shrink-0">
          <h3 className="text-[16px] font-semibold text-[var(--ink)]">
            Policy Holder
          </h3>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-open-fg)] bg-[var(--status-open-bg)] px-2 py-1 text-[14px] text-[var(--status-open-fg)]">
              <PreferredIcon className="size-4" />
              Prefers {CLAIM.insured.preferred_contact}
            </span>
          </div>
          <span className="text-[18px] font-semibold text-[var(--ink)]">
            {CLAIM.insured.name}
          </span>
          <span className="inline-flex items-start gap-1 text-[14px] text-[var(--ink-soft)]">
            <MapPinIcon className="mt-0.5 size-4 shrink-0" />
            <span>{CLAIM.insured.address}</span>
          </span>
          <a
            href={`tel:${CLAIM.insured.phone}`}
            className="inline-flex items-center gap-1 text-[14px] text-[var(--brand-blue)] hover:underline"
          >
            <PhoneIcon className="size-4" />
            {CLAIM.insured.phone}
          </a>
          <a
            href={`mailto:${CLAIM.insured.email}`}
            className="inline-flex items-center gap-1 text-[14px] text-[var(--brand-blue)] hover:underline"
          >
            <MailIcon className="size-4" />
            {CLAIM.insured.email}
          </a>
        </div>

        <div className="flex w-full flex-col gap-5 rounded-[8px] bg-white p-6 shadow-[0_0_20px_rgba(0,0,0,0.1)]">
          <h3 className="text-[16px] font-semibold text-[var(--ink)]">
            Loss details
          </h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2">
            <LossField label="PERIL" value={CLAIM.loss.peril} />
            <LossField
              label="DATE OF LOSS"
              value={formatDate(CLAIM.loss.date_of_loss)}
            />
            <LossField
              label="FNOL FILED"
              value={formatDateTime(CLAIM.loss.fnol_filed_at)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[14px] text-[var(--ink-soft)]">
              INSURED STATEMENT
            </span>
            <p className="text-[16px] leading-snug text-[var(--ink)]">
              {CLAIM.loss.description}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function LossField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[14px] text-[var(--ink-soft)]">{label}</span>
      <span className="text-[16px] text-[var(--ink)]">{value}</span>
    </div>
  );
}

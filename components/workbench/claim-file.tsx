import Link from 'next/link';
import {
  CameraIcon,
  ExternalLinkIcon,
  FileTextIcon,
  MailIcon,
} from 'lucide-react';
import {
  DOCUMENT_KIND_LABELS,
  SCENARIO_DOCUMENTS,
} from '@/lib/scenario/documents';
import { CLAIM, formatDate } from '@/lib/scenario/claim';
import {
  CORRESPONDENCE_LOG,
  type CorrespondenceEmail,
} from '@/lib/scenario/correspondence';
import { PHOTO_MANIFEST } from '@/lib/scenario/photos';
import { SectionCard, SectionTitle } from './section-card';

const POLICY_PDF_URL = '/documents/policy-ho3.pdf';

export function ClaimFile() {
  return (
    <>
      <SectionCard>
        <SectionTitle>Documents in this file</SectionTitle>
        <ul className="flex flex-col gap-3">
          <DocRow
            title="HO-3 Policy — Pacific States Mutual"
            kindLabel="POLICY CONTRACT · 18 PAGES"
            href={POLICY_PDF_URL}
          />
          {SCENARIO_DOCUMENTS.map((d) => (
            <DocRow
              key={d.id}
              title={d.title}
              kindLabel={DOCUMENT_KIND_LABELS[d.kind].toUpperCase()}
              href={d.pdfUrl}
            />
          ))}
        </ul>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Field photos ({PHOTO_MANIFEST.length})</SectionTitle>
        <div className="flex items-center justify-between gap-4 rounded-[8px] bg-white p-4 shadow-[0_0_20px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4">
            <CameraIcon className="size-6 text-[var(--ink)]" />
            <div className="flex flex-col gap-1">
              <span className="text-[16px] font-semibold text-[var(--ink)]">
                {PHOTO_MANIFEST.length} photos staged
              </span>
              <span className="text-[14px] text-[var(--ink-soft)]">
                Pending classification
              </span>
            </div>
          </div>
          <Link
            href={`/claims/${CLAIM.claim_number}/damages`}
            className="inline-flex items-center gap-1 text-[14px] text-[var(--brand-blue)] hover:underline"
          >
            <ExternalLinkIcon className="size-4" />
            View photos
          </Link>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>
          Correspondence log ({CORRESPONDENCE_LOG.length})
        </SectionTitle>
        <ul className="flex flex-col gap-3">
          {CORRESPONDENCE_LOG.map((email) => (
            <MailRow key={email.id} email={email} />
          ))}
        </ul>
      </SectionCard>
    </>
  );
}

function MailRow({ email }: { email: CorrespondenceEmail }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-[8px] bg-white p-4 shadow-[0_0_20px_rgba(0,0,0,0.1)]">
      <div className="flex min-w-0 items-center gap-4">
        <MailIcon className="size-6 shrink-0 text-[var(--ink)]" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[16px] font-semibold text-[var(--ink)]">
            {email.subject}
          </span>
          <span className="truncate text-[14px] text-[var(--ink-soft)]">
            From {email.from_name} · {email.from_role}
          </span>
        </div>
      </div>
      <span className="shrink-0 text-[14px] text-[var(--ink-soft)]">
        {formatDate(email.sent_at)}
      </span>
    </li>
  );
}

function DocRow({
  title,
  kindLabel,
  href,
}: {
  title: string;
  kindLabel: string;
  href: string;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-4 rounded-[8px] bg-white p-4 shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#fafbff]"
      >
        <div className="flex items-center gap-4">
          <FileTextIcon className="size-6 shrink-0 text-[var(--ink)]" />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-[16px] font-semibold text-[var(--ink)]">
              {title}
            </span>
            <span className="text-[14px] text-[var(--ink-soft)]">
              {kindLabel}
            </span>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[14px] text-[var(--brand-blue)] group-hover:underline">
          <ExternalLinkIcon className="size-4" />
          Open PDF
        </span>
      </a>
    </li>
  );
}

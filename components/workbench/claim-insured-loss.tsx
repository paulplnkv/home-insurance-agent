import { MailIcon, MapPinIcon, MessageSquareIcon, PhoneIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Field } from './field';
import { CLAIM, formatDate, formatDateTime } from '@/lib/scenario/claim';

const PREFERRED_ICON = {
  SMS: MessageSquareIcon,
  Email: MailIcon,
  Phone: PhoneIcon,
} as const;

export function ClaimInsuredLoss() {
  const PreferredIcon = PREFERRED_ICON[CLAIM.insured.preferred_contact];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Insured & loss</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pb-6 md:flex-row md:gap-8">
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <h3 className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Policyholder
          </h3>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{CLAIM.insured.name}</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5" />
              {CLAIM.insured.address}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href={`tel:${CLAIM.insured.phone}`}
              className="inline-flex items-center gap-2 text-foreground hover:underline"
            >
              <PhoneIcon className="size-3.5 text-muted-foreground" />
              {CLAIM.insured.phone}
            </a>
            <a
              href={`mailto:${CLAIM.insured.email}`}
              className="inline-flex items-center gap-2 text-foreground hover:underline"
            >
              <MailIcon className="size-3.5 text-muted-foreground" />
              {CLAIM.insured.email}
            </a>
          </div>
          <div>
            <Badge variant="secondary" className="gap-1 font-normal">
              <PreferredIcon className="size-3" />
              Prefers {CLAIM.insured.preferred_contact}
            </Badge>
          </div>
        </section>

        <Separator className="hidden md:block" orientation="vertical" />
        <Separator className="md:hidden" />

        <section className="flex min-w-0 flex-[1.4] flex-col gap-4">
          <h3 className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Loss details
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            <Field label="Peril" value={CLAIM.loss.peril} />
            <Field
              label="Date of loss"
              value={formatDate(CLAIM.loss.date_of_loss)}
            />
            <Field
              label="FNOL filed"
              value={formatDateTime(CLAIM.loss.fnol_filed_at)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Insured statement
            </span>
            <p className="text-sm leading-relaxed text-foreground">
              {CLAIM.loss.description}
            </p>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

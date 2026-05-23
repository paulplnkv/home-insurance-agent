export interface CorrespondenceEmail {
  id: string;
  from_name: string;
  from_role: string;
  subject: string;
  sent_at: string;
}

export const CORRESPONDENCE_LOG: readonly CorrespondenceEmail[] = [
  {
    id: 'email-5',
    from_name: 'John Hendricks',
    from_role: 'Field Adjuster · North TX',
    subject: 'Inspection summary and next steps',
    sent_at: '2026-04-28T16:42:00-05:00',
  },
  {
    id: 'email-4',
    from_name: 'Maria Chen',
    from_role: 'Policyholder',
    subject: 'Photos from inside the kitchen ceiling',
    sent_at: '2026-04-25T18:21:00-05:00',
  },
  {
    id: 'email-3',
    from_name: 'John Hendricks',
    from_role: 'Field Adjuster · North TX',
    subject: 'Inspection scheduled for 4/25 at 9:00 AM',
    sent_at: '2026-04-24T09:15:00-05:00',
  },
  {
    id: 'email-2',
    from_name: 'Maria Chen',
    from_role: 'Policyholder',
    subject: 'Re: Claim received — leak is getting worse',
    sent_at: '2026-04-23T17:08:00-05:00',
  },
  {
    id: 'email-1',
    from_name: 'John Hendricks',
    from_role: 'Field Adjuster · North TX',
    subject: 'Claim received — I will be your adjuster',
    sent_at: '2026-04-23T15:02:00-05:00',
  },
] as const;

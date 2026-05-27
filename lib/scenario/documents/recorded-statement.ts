import { dateOffsetFromLoss, timestampOffsetFromLoss } from '../claim';

// Recorded statement was taken 5 days after the loss.
const INTERVIEW_DATE = dateOffsetFromLoss(5);
const INTERVIEW_STARTED_AT = timestampOffsetFromLoss(5, '14:05:00');
const INTERVIEW_ENDED_AT = timestampOffsetFromLoss(5, '14:38:00');

const recordedStatement = {
  id: 'recorded-statement',
  kind: 'recorded_statement',
  title: 'Recorded Statement — Insured (Maria Chen)',
  filename: `RecordedStatement_Chen_${INTERVIEW_DATE}.txt`,
  metadata: {
    claim_number: 'HO-2026-04-04217',
    interview_type: 'Recorded statement (telephonic)',
    recording_id: 'RS-2026-04217-01',
    interview_date: INTERVIEW_DATE,
    interview_started_at: INTERVIEW_STARTED_AT,
    interview_ended_at: INTERVIEW_ENDED_AT,
    interview_duration_seconds: 1980,
    interviewer: 'Maria Wells',
    interviewer_title: 'Senior Adjuster, Property Claims',
    interviewee: 'Maria Chen',
    interviewee_role: 'Insured / Named on policy',
    consent_to_record: true,
    consent_capture_text:
      'I, Maria Chen, consent to this conversation being recorded for the purposes of investigating claim HO-2026-04-04217.',
  },
  preamble:
    "This is a recorded statement taken in connection with claim HO-2026-04-04217. The insured has acknowledged the recording. Statements provided here are made under the policy's cooperation clause.",
  transcript: [
    {
      speaker: 'Adjuster',
      text: 'Maria, thanks for taking this call. As we discussed, this conversation is being recorded. Can you confirm you consent to being recorded?',
    },
    { speaker: 'Insured', text: 'Yes, I consent.' },
    { speaker: 'Adjuster', text: 'Please state your full name and address for the record.' },
    { speaker: 'Insured', text: 'Maria Chen, 4521 Oak Ridge Drive, Plano, Texas, 75024.' },
    {
      speaker: 'Adjuster',
      text: "Thank you. I'd like to walk through the day of the loss. Can you describe what happened?",
    },
    {
      speaker: 'Insured',
      text: "Sure. I had been at my sister's place in Frisco that afternoon. I came home and saw the damage. The roof looked terrible — shingles down in the yard, the skylight was cracked. I called my husband first, then called you all the next morning.",
    },
    {
      speaker: 'Adjuster',
      text: "So just to clarify — you weren't at the property when the hailstorm occurred?",
    },
    {
      speaker: 'Insured',
      text: "No, I wasn't there during the storm. I came home afterwards. I think I got back around six in the evening.",
    },
    { speaker: 'Adjuster', text: 'And what date was that?' },
    { speaker: 'Insured', text: 'It was the day I called in. The day before yesterday.' },
    { speaker: 'Adjuster', text: 'OK. Was anyone home during the storm?' },
    {
      speaker: 'Insured',
      text: 'No, the house was empty. My husband was at work and my son was at school.',
    },
    { speaker: 'Adjuster', text: 'Can you describe the damage as you found it?' },
    {
      speaker: 'Insured',
      text: 'The south side of the roof was the worst — I could see chunks of shingles on the lawn. The skylight in the kitchen was cracked through. There was already water on the kitchen counter from where it had dripped. The front gutter was bent up.',
    },
    { speaker: 'Adjuster', text: 'Was any mitigation done after you discovered the damage?' },
    {
      speaker: 'Insured',
      text: 'Yes. We had a roofer named Lone Star come out the next morning and tarp the skylight.',
    },
    { speaker: 'Adjuster', text: 'Do you have a receipt for that mitigation work?' },
    {
      speaker: 'Insured',
      text: "I think it was paid by credit card. I'll have to check. I don't think I have a paper receipt yet.",
    },
    {
      speaker: 'Adjuster',
      text: "OK, please send anything you can find. Last question — is the contractor estimate from Lone Star Premier Roofing the only estimate you've obtained?",
    },
    { speaker: 'Insured', text: 'Yes, just the one.' },
    {
      speaker: 'Adjuster',
      text: 'Understood. That concludes my questions for today. Thank you for your cooperation.',
    },
    { speaker: 'Insured', text: 'Thank you.' },
  ],
} as const;

export default recordedStatement;

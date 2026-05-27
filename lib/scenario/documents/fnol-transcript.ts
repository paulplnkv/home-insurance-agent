import { CLAIM, lossDateMonthOrdinal } from '../claim';

// The FNOL was filed the day after the loss; CSR call ran ~5 hours
// earlier than the system-recorded `fnol_filed_at` timestamp — the
// difference is the seed for the LOW "FNOL filed time inconsistency"
// finding the cross-doc agent surfaces.
const FNOL_DATE = CLAIM.loss.fnol_filed_at.slice(0, 10);
const CALL_STARTED_AT = `${FNOL_DATE}T09:14:02-05:00`;
const CALL_ENDED_AT = `${FNOL_DATE}T09:21:47-05:00`;
const LOSS_PROSE = lossDateMonthOrdinal();

const fnolTranscript = {
  id: 'fnol-transcript',
  kind: 'fnol_transcript',
  title: 'First Notice of Loss — Recorded Intake Call (Transcript)',
  filename: `FNOL_Chen_Maria_${FNOL_DATE}.txt`,
  metadata: {
    claim_number: 'HO-2026-04-04217',
    intake_channel: 'Inbound phone — 1-800 claims',
    call_recorded: true,
    call_id: 'FNOL-CALL-887412',
    call_started_at: CALL_STARTED_AT,
    call_ended_at: CALL_ENDED_AT,
    call_duration_seconds: 465,
    csr_name: 'Daniel Ortega',
    csr_employee_id: 'CSR-1188',
    insured_name: 'Maria Chen',
    policy_number: 'HO-TX-9924-7716',
    loss_location: '4521 Oak Ridge Dr, Plano TX 75024',
    reported_peril: 'Hail',
    reported_date_of_loss: CLAIM.loss.date_of_loss,
  },
  transcript: [
    {
      speaker: 'CSR',
      text: 'Thank you for calling. This is Daniel, can I get your full name and policy number to start?',
    },
    { speaker: 'Insured', text: 'Yes, Maria Chen. The policy is HO-TX-9924-7716.' },
    {
      speaker: 'CSR',
      text: 'Thanks Maria. I have you at 4521 Oak Ridge Drive in Plano, is that correct?',
    },
    { speaker: 'Insured', text: "Correct, that's the property." },
    { speaker: 'CSR', text: 'What are you calling about today?' },
    {
      speaker: 'Insured',
      text: "We had a really bad hailstorm yesterday afternoon. Roof is hammered. Some hail came through the kitchen skylight too — there's water on the ceiling now.",
    },
    { speaker: 'CSR', text: "I'm sorry to hear that. Can you confirm the date of loss for me?" },
    {
      speaker: 'Insured',
      text: `${LOSS_PROSE.replace(/^./, (c) => c.toUpperCase())}. Yesterday. It started around four in the afternoon.`,
    },
    { speaker: 'CSR', text: 'Were you on the property when it happened?' },
    {
      speaker: 'Insured',
      text: 'Yes. I was home when it hit. It was loud — it sounded like rocks on the roof.',
    },
    { speaker: 'CSR', text: 'Did anyone get hurt?' },
    { speaker: 'Insured', text: 'No, no injuries. Just property.' },
    {
      speaker: 'CSR',
      text: 'Have you taken any steps to mitigate further damage — tarping, covering the skylight?',
    },
    {
      speaker: 'Insured',
      text: "We had a roofer come out and tarp the skylight area the next morning. There's a receipt for that, I'll send it over with everything else.",
    },
    { speaker: 'CSR', text: 'Great. What damage have you observed visually?' },
    {
      speaker: 'Insured',
      text: 'The whole south side of the roof looks chewed up. The west side too, but maybe less. The front gutter is dented. Skylight in the kitchen is cracked. Water staining on the kitchen ceiling under it.',
    },
    { speaker: 'CSR', text: 'Have you contacted a contractor for an estimate?' },
    {
      speaker: 'Insured',
      text: "Yes — Lone Star Premier Roofing came out today. They told me they'd send the bid by end of week.",
    },
    {
      speaker: 'CSR',
      text: "Understood. I'm assigning this to adjuster Maria Wells. She'll reach out within one business day. Anything else for now?",
    },
    { speaker: 'Insured', text: "No, that's everything. Thanks." },
    {
      speaker: 'CSR',
      text: 'Thank you. Claim number is HO-2026-04-04217. Have a good day.',
    },
  ],
} as const;

export default fnolTranscript;

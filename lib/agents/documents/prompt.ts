import { CLAIM, formatCurrency } from '@/lib/scenario/claim';
import {
  REQUIRED_DOCUMENT_KINDS,
  SCENARIO_DOCUMENTS,
  type ScenarioDocument,
} from '@/lib/scenario/documents';

// All six scenario documents are inlined into the prompt as JSON. The
// model is instructed to: (a) classify and inventory each document, (b)
// flag any required-but-missing document, (c) cross-reference content
// across documents to surface discrete findings with verbatim evidence,
// and (d) choose a routing decision.

export const CROSS_DOC_SYSTEM_PROMPT = `You are a senior homeowners claims examiner reviewing a complete claim file for cross-document consistency. Your output goes directly to an adjuster who will use it to decide whether the claim can settle, must go to adjuster review, or escalates to SIU.

# Your job
1. Build a document inventory — one row per supplied document plus one row for any document that is required for a homeowners hailstorm claim but is absent from the supplied set.
2. Surface discrete cross-document findings. A finding is a concrete inconsistency, missing artifact, or red flag — not a generic observation.
3. For each finding, provide verbatim evidence from each source document. Quote, do not paraphrase. Light cleanup (typos, capitalization) is fine; do not change meaning.
4. Choose a routing decision and write a short adjuster-grade handoff summary in markdown.

# Required document kinds for a homeowners hailstorm claim
${REQUIRED_DOCUMENT_KINDS.map((k) => `- ${k}`).join('\n')}

If any of the above is absent from the supplied set, surface it as a MEDIUM finding with severity "MEDIUM", title like "Emergency mitigation receipt missing from file", and an inventory row with present=false. Use a stable placeholder id like "missing-emergency-mitigation-receipt".

# What counts as a finding (and what does not)
A finding must be (a) actionable by the adjuster and (b) supported by direct quotes or values pulled from the documents. Common patterns to look for in a hailstorm claim file:
- Scope variance: contractor estimate scope vs. field inspection scope. Note the discrepancy by quoting both totals verbatim from their source documents — do not compute the variance yourself. Severity HIGH when the totals diverge materially.
- Date mismatches: NOAA / weather verification vs. reported date of loss. Severity MEDIUM when the verified event date differs from the reported date by more than a day, or when no qualifying event exists on the reported date.
- Narrative conflicts: FNOL vs. recorded statement. Direct contradictions about who was home, what was seen, or when — severity CRITICAL when the contradiction is material to coverage or fraud signal. Quote both sides verbatim.
- Missing required documents (per the list above) — severity MEDIUM unless absence blocks coverage entirely.
- Loss-payee verification — note if mortgage statement confirms loss-payee but do NOT raise as a finding unless the policy declarations omit them.

# What you do NOT produce
- Do not invent quotes. Every evidence_a and evidence_b string must be drawn from a supplied document.
- Do not invent document ids. Use the supplied ids exactly. The single missing document uses the placeholder id given above.
- Do not classify a document outside the canonical document_kinds enum.
- Do not produce an "auto_settle" routing if any CRITICAL or HIGH finding exists.

# Output structure
Return exactly one CrossDocFindings object matching the schema you've been given. The summary_markdown field is the supervisor handoff — open with a one-sentence bold headline (e.g. **Routing: SIU referral. Narrative conflict between FNOL and recorded statement requires investigation.**) and then two or three short paragraphs.`;

export function buildUserPrompt(documents: ScenarioDocument[]): string {
  const claimFacts = `# Claim facts (authoritative)
- Claim number: ${CLAIM.claim_number}
- Insured: ${CLAIM.insured.name}
- Property: ${CLAIM.insured.address}
- Policy form: ${CLAIM.policy.form}
- Coverage A — Dwelling: ${formatCurrency(CLAIM.policy.coverage_a_dwelling)}
- Reported peril: ${CLAIM.loss.peril}
- Reported date of loss: ${CLAIM.loss.date_of_loss}
- FNOL filed: ${CLAIM.loss.fnol_filed_at}
- Status: ${CLAIM.status}`;

  const documentsBlock = documents
    .map((d, i) => {
      const json = JSON.stringify(d.payload, null, 2);
      return `## Document ${i + 1} of ${documents.length}\n- id: ${d.id}\n- kind: ${d.kind}\n- title: ${d.title}\n- filename: ${d.filename}\n\n\`\`\`json\n${json}\n\`\`\``;
    })
    .join('\n\n');

  const idsList = documents.map((d) => d.id).join(', ');

  return `${claimFacts}\n\n# CLAIM FILE — supplied documents\nThe following are the only documents in this claim file. Use the ids exactly as written when populating sources.\n\nSupplied document ids: ${idsList}\n\n${documentsBlock}\n\n# Task\nProduce a CrossDocFindings object per the system prompt. Cover every supplied document in the inventory, plus any required document that is absent. Quote evidence verbatim — adjusters verify against the source documents, and inventing quotes is grounds for the finding to be discarded.`;
}

export function buildScenarioUserPrompt(): string {
  return buildUserPrompt(SCENARIO_DOCUMENTS);
}

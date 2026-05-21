import { z } from 'zod';
import { DOCUMENT_KINDS } from '@/lib/scenario/documents';

// CrossDocFindings — the contract between the Cross-Document Consistency
// agent and the Document Review panel. Per PRD § Schemas. Validated on
// every streamed update.

export const FINDING_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export const ROUTING_OPTIONS = [
  'auto_settle',
  'adjuster_review',
  'siu_referral',
] as const;

export const crossDocFindingsSchema = z.object({
  document_inventory: z
    .array(
      z.object({
        id: z
          .string()
          .describe(
            'The id from the supplied document set. For the missing emergency_mitigation_receipt, use a stable placeholder like "missing-emergency-mitigation-receipt".'
          ),
        kind: z
          .enum(DOCUMENT_KINDS)
          .describe(
            'Document type. Pick from the canonical kinds — do not invent new ones.'
          ),
        title: z
          .string()
          .describe(
            'Human-readable title for the inventory row, e.g. "FNOL transcript" or "Emergency mitigation receipt (missing)".'
          ),
        present: z
          .boolean()
          .describe(
            'true if the document was supplied; false if it is required for this loss type but absent.'
          ),
      })
    )
    .describe(
      'One row per document considered. Include all six supplied documents AND any required documents that are missing.'
    ),
  findings: z
    .array(
      z.object({
        severity: z.enum(FINDING_SEVERITIES),
        title: z
          .string()
          .describe(
            'Short imperative title, e.g. "Narrative conflict between FNOL and recorded statement".'
          ),
        sources: z
          .array(z.string())
          .describe(
            'Document ids the finding is drawn from. Use the ids from the supplied set; for missing-document findings use the placeholder id.'
          ),
        evidence_a: z
          .string()
          .describe(
            'Verbatim quote (or near-verbatim with light cleanup) from the first source. Cite the source id and field at the start, e.g. "[fnol-transcript / Insured]: \\"...\\"".'
          ),
        evidence_b: z
          .string()
          .describe(
            'Verbatim quote (or near-verbatim with light cleanup) from the second source, formatted like evidence_a. Use empty string only when the finding is single-sourced (e.g., a missing document).'
          ),
        evidence_c: z
          .string()
          .default('')
          .describe(
            'Third verbatim source quote, formatted like evidence_a. Use empty string when the finding is two-sourced. Reserved for three-way discrepancies (e.g., mortgagee verification across claim record, policy declarations, and mortgage statement).'
          ),
        financial_impact: z
          .string()
          .describe(
            'One short phrase describing the dollar exposure or settlement risk, e.g. "+$5,602 contractor scope inflation" or "Possible coverage denial; pending verification".'
          ),
        suggested_action: z
          .string()
          .describe(
            'One imperative sentence the adjuster can act on, e.g. "Open SIU referral for narrative inconsistency" or "Request emergency mitigation receipt from insured".'
          ),
      })
    )
    .describe(
      'Discrete findings — each one a distinct issue an adjuster must resolve before settlement.'
    ),
  routing: z
    .enum(ROUTING_OPTIONS)
    .describe(
      'Final routing decision. Choose siu_referral when any CRITICAL finding includes a narrative or fraud signal; adjuster_review when only HIGH/MEDIUM findings remain; auto_settle only when no findings exist.'
    ),
  summary_markdown: z
    .string()
    .describe(
      'Adjuster-grade handoff summary in markdown. Open with a one-sentence headline. Then 2-3 short paragraphs walking a supervisor through the findings, the recommended routing, and what is still missing from the file.'
    ),
});

export type CrossDocFindings = z.infer<typeof crossDocFindingsSchema>;

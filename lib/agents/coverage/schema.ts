import { z } from 'zod';

// CoveragePosition — the contract between the Coverage Verification
// agent and the Coverage Analysis panel. Per PRD § Schemas. Validated on
// every streamed update.

export const coveragePositionSchema = z.object({
  position: z
    .enum(['COVERED', 'PARTIALLY_COVERED', 'EXCLUDED', 'NEEDS_REVIEW'])
    .describe('Overall coverage determination for this loss.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Model self-rated confidence in the position, 0 to 1.'),
  applicable_deductible: z
    .object({
      kind: z
        .enum(['AOP_STANDARD', 'WIND_HAIL_PERCENT', 'HURRICANE_PERCENT', 'OTHER'])
        .describe('Which deductible structure applies to this loss.'),
      citation: z
        .string()
        .describe(
          'Section reference from the retrieved policy text, e.g. "Endorsement HE-7 — Wind/Hail Percentage Deductible §2".'
        ),
    })
    .describe('The deductible the adjuster should apply on this loss.'),
  cited_clauses: z
    .array(
      z.object({
        section: z
          .string()
          .describe(
            'Section/subsection label from the retrieved policy chunks.'
          ),
        excerpt: z
          .string()
          .describe(
            'Verbatim or near-verbatim excerpt drawn from the retrieved policy chunks. Do not paraphrase to the point of changing meaning.'
          ),
      })
    )
    .describe('Every clause the memo or position depends on.'),
  memo_markdown: z
    .string()
    .describe(
      'Plain-language coverage memo for the file, in markdown. Reference cited clauses inline by section name. Two to four short paragraphs.'
    ),
  coverage_lines: z
    .array(
      z.object({
        code: z.enum(['A', 'B', 'C', 'D', 'HE7', 'HO0490', 'HO0441']),
        status: z.enum([
          'COVERED',
          'PARTIALLY_COVERED',
          'EXCLUDED',
          'NEEDS_REVIEW',
        ]),
      })
    )
    .describe(
      'Per-coverage-line evaluation, one entry per scaffold row. The UI mirrors the pre-run scaffold post-run with these statuses replacing the Pending badges.'
    ),
  flags: z
    .array(
      z.object({
        severity: z.enum(['INFO', 'REVIEW', 'BLOCK']),
        title: z.string(),
        rationale: z.string(),
      })
    )
    .describe(
      'Considerations the adjuster must not miss: endorsement applicability, ACV vs RCV implications, anti-concurrent causation interactions, etc.'
    ),
});

export type CoveragePosition = z.infer<typeof coveragePositionSchema>;

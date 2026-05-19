// Tools for the Coverage Verification agent. The model decides which
// policy queries to search for — replacing the hardcoded
// RETRIEVAL_QUERIES list with model-chosen queries that stream as
// live activity to the UI.
import { tool } from 'ai';
import { z } from 'zod';
import { retrieveClauses } from '@/lib/policy/retriever';
import { coveragePositionSchema } from './schema';

export const coverageTools = {
  search_policy: tool({
    description:
      'Search the HO-3 policy index for clauses matching a natural-language query. Returns the top-k chunks ranked by similarity. Each chunk has a section name and verbatim text — use ONLY this text when citing the policy in the final memo. Call this multiple times with different queries to cover deductibles, exclusions, loss-settlement basis, and any endorsements that may apply.',
    inputSchema: z.object({
      query: z
        .string()
        .min(3)
        .describe(
          'A short natural-language query, e.g. "wind hail percentage deductible HE-7", "anti-concurrent causation exclusion", "roof surfacing ACV depreciation".'
        ),
      k: z
        .number()
        .int()
        .min(1)
        .max(8)
        .optional()
        .describe('Number of chunks to return. Defaults to 4.'),
    }),
    execute: async ({ query, k }) => {
      const chunks = await retrieveClauses({ query, k: k ?? 4 });
      return chunks.map((c) => ({
        id: c.id,
        section: c.section,
        subsection: c.subsection,
        text: c.text,
        similarity: Number(c.similarity.toFixed(3)),
      }));
    },
  }),

  report_position: tool({
    description:
      'Submit the final CoveragePosition object. Call this exactly once, after you have searched the policy for the clauses you need. The input you pass IS the agent output — the UI renders it directly.',
    inputSchema: coveragePositionSchema,
    execute: async (input) => input,
  }),
} as const;

// Coverage Verification agent. Per PRD §Modules: an agent function is a
// deep module wrapping prompt construction, RAG retrieval, the AI SDK
// call, and schema validation. The route handler is a thin streaming
// adapter on top.
import { Output, streamText } from 'ai';
import { SONNET_MODEL } from '@/lib/ai/models';
import { retrieveClauses, type RetrievedClause } from '@/lib/policy/retriever';
import {
  buildUserPrompt,
  COVERAGE_SYSTEM_PROMPT,
  RETRIEVAL_QUERIES,
} from './prompt';
import { coveragePositionSchema } from './schema';

const RETRIEVE_K = 4;

async function gatherEvidence(): Promise<RetrievedClause[]> {
  const queryResults = await Promise.all(
    RETRIEVAL_QUERIES.map((query) => retrieveClauses({ query, k: RETRIEVE_K }))
  );

  const seen = new Set<string>();
  const merged: RetrievedClause[] = [];
  for (const results of queryResults) {
    for (const r of results) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      merged.push(r);
    }
  }
  // Order by best similarity across queries.
  merged.sort((a, b) => b.similarity - a.similarity);
  return merged;
}

export async function streamCoverageAgent() {
  const retrieved = await gatherEvidence();
  const prompt = buildUserPrompt(retrieved);

  return streamText({
    model: SONNET_MODEL,
    system: COVERAGE_SYSTEM_PROMPT,
    temperature: 0.2,
    output: Output.object({ schema: coveragePositionSchema }),
    prompt,
  });
}

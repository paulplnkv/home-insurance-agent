// Runtime retriever for the indexed HO-3 policy. Loads embeddings.json
// once at module init and runs cosine similarity in plain JS — no vector
// DB, no network call beyond embedding the query itself.
//
// Per PRD: ~50 chunks, in-memory cosine retrieval, total retrieval
// latency target ~50ms warm.
import { embed, cosineSimilarity } from 'ai';
import { EMBEDDING_MODEL } from '@/lib/ai/models';
import indexFile from './embeddings.json';
import type { PolicyChunk } from './chunker';

interface IndexedChunk extends PolicyChunk {
  embedding: number[];
}

interface PolicyIndex {
  model: string;
  indexed_at: string;
  chunks: IndexedChunk[];
}

const INDEX = indexFile as PolicyIndex;

if (INDEX.model !== EMBEDDING_MODEL) {
  console.warn(
    `[policy-retriever] Index built with ${INDEX.model} but runtime expects ` +
      `${EMBEDDING_MODEL}. Re-run scripts/index-policy.ts.`
  );
}

export interface RetrievedClause {
  id: string;
  section: string;
  subsection: string | null;
  text: string;
  similarity: number;
}

export async function retrieveClauses({
  query,
  k = 5,
}: {
  query: string;
  k?: number;
}): Promise<RetrievedClause[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: query,
  });

  const scored = INDEX.chunks.map((chunk) => ({
    id: chunk.id,
    section: chunk.section,
    subsection: chunk.subsection,
    text: chunk.text,
    similarity: cosineSimilarity(embedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, k);
}

export function getAllChunks(): IndexedChunk[] {
  return INDEX.chunks;
}

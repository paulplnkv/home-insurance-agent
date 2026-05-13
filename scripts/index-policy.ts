// One-off indexer. Run with:
//   npx tsx scripts/index-policy.ts
// Reads lib/scenario/policy/HO-3.txt, chunks on section headings, embeds
// each chunk via the AI Gateway, and writes the result to
// lib/policy/embeddings.json. Idempotent — safe to re-run.
import { embedMany } from 'ai';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { EMBEDDING_MODEL } from '../lib/ai/models';
import { chunkPolicy, type PolicyChunk } from '../lib/policy/chunker';

const POLICY_PATH = resolve('lib/scenario/policy/HO-3.txt');
const OUTPUT_PATH = resolve('lib/policy/embeddings.json');

interface EmbeddedChunk extends PolicyChunk {
  embedding: number[];
}

async function main() {
  const text = await readFile(POLICY_PATH, 'utf-8');
  const chunks = chunkPolicy(text);
  console.log(`Chunked policy into ${chunks.length} chunks.`);

  const { embeddings, usage } = await embedMany({
    model: EMBEDDING_MODEL,
    values: chunks.map((c) => c.text),
  });

  const indexed: EmbeddedChunk[] = chunks.map((c, i) => ({
    ...c,
    embedding: embeddings[i],
  }));

  await writeFile(OUTPUT_PATH, JSON.stringify({
    model: EMBEDDING_MODEL,
    indexed_at: new Date().toISOString(),
    chunks: indexed,
  }, null, 2));

  console.log(
    `Embedded ${indexed.length} chunks (${usage.tokens} tokens) → ${OUTPUT_PATH}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

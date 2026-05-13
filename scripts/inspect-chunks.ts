import { chunkPolicy } from '../lib/policy/chunker';
import { readFileSync } from 'node:fs';

const text = readFileSync('lib/scenario/policy/HO-3.txt', 'utf-8');
const chunks = chunkPolicy(text);
console.log(`Total chunks: ${chunks.length}`);
console.log('---');
for (const c of chunks) {
  const preview = c.text
    .split('\n')
    .slice(0, 3)
    .join(' / ')
    .slice(0, 140);
  console.log(`[${c.id}] (${c.text.length}ch) ${preview}`);
}

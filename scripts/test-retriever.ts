import { retrieveClauses } from '../lib/policy/retriever';

async function main() {
  const queries = [
    'wind hail deductible',
    'ordinance or law endorsement',
    'anti-concurrent causation',
    'roof actual cash value depreciation',
    'Coverage A dwelling limit',
  ];

  for (const query of queries) {
    const results = await retrieveClauses({ query, k: 3 });
    console.log(`\n[${query}]`);
    for (const r of results) {
      const heading = r.subsection
        ? `${r.section} — ${r.subsection}`
        : r.section;
      console.log(`  ${r.similarity.toFixed(3)}  ${heading}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Generates a credible-looking PDF for each scenario document so the
// audience can open the underlying artifacts during the demo. Run with:
//   npm run generate-pdfs
// Idempotent — safe to re-run after JSON edits. Outputs land in
// public/documents/<id>.pdf.
import ReactPDF, { type DocumentProps } from '@react-pdf/renderer';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ReactElement } from 'react';
import { CLAIM } from '../lib/scenario/claim';
import { SCENARIO_DOCUMENTS } from '../lib/scenario/documents';
import { ContractorEstimatePdf } from './pdf/contractor-estimate';
import { FieldInspectionPdf } from './pdf/field-inspection';
import { FnolPdf } from './pdf/fnol';
import { MortgageStatementPdf } from './pdf/mortgage-statement';
import { NoaaWeatherPdf } from './pdf/noaa-weather';
import { PolicyPdf } from './pdf/policy';
import { RecordedStatementPdf } from './pdf/recorded-statement';

const OUTPUT_DIR = resolve('public/documents');
const POLICY_TXT_PATH = resolve('lib/scenario/policy/HO-3.txt');
const POLICY_PDF_PATH = resolve('public/documents/policy-ho3.pdf');
const POLICY_PAGE_MAP_PATH = resolve('lib/policy/page-map.json');
// Per-document text→page maps keyed by scenario doc id. The Document
// Review panel uses these to deep-link evidence quotes to `#page=N`,
// mirroring the policy page-map used by the Coverage panel.
const DOC_PAGE_MAPS_DIR = resolve('lib/scenario/documents/page-maps');

type ContentCallback = (text: string, page: number) => void;

// Each scenario document maps to one template. New documents need a new
// entry here. The cast on `payload` is deliberate — the JSON shapes are
// stable in this repo and each template validates its own prop type.
type Template = (
  payload: unknown,
  onContent: ContentCallback
) => ReactElement<DocumentProps>;

const TEMPLATES: Record<string, Template> = {
  fnol_transcript: (p, onContent) => (
    <FnolPdf
      doc={p as Parameters<typeof FnolPdf>[0]['doc']}
      onContent={onContent}
    />
  ),
  contractor_estimate: (p, onContent) => (
    <ContractorEstimatePdf
      doc={p as Parameters<typeof ContractorEstimatePdf>[0]['doc']}
      onContent={onContent}
    />
  ),
  field_inspection_report: (p, onContent) => (
    <FieldInspectionPdf
      doc={p as Parameters<typeof FieldInspectionPdf>[0]['doc']}
      onContent={onContent}
    />
  ),
  weather_verification: (p, onContent) => (
    <NoaaWeatherPdf
      doc={p as Parameters<typeof NoaaWeatherPdf>[0]['doc']}
      onContent={onContent}
    />
  ),
  recorded_statement: (p, onContent) => (
    <RecordedStatementPdf
      doc={p as Parameters<typeof RecordedStatementPdf>[0]['doc']}
      onContent={onContent}
    />
  ),
  mortgage_statement: (p, onContent) => (
    <MortgageStatementPdf
      doc={p as Parameters<typeof MortgageStatementPdf>[0]['doc']}
      onContent={onContent}
    />
  ),
};

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(DOC_PAGE_MAPS_DIR, { recursive: true });

  for (const doc of SCENARIO_DOCUMENTS) {
    const template = TEMPLATES[doc.kind];
    if (!template) {
      console.warn(`No template registered for kind=${doc.kind} (id=${doc.id}); skipping.`);
      continue;
    }
    const outPath = resolve(OUTPUT_DIR, `${doc.id}.pdf`);
    // react-pdf's `render` prop can fire multiple times during reflow —
    // last write wins, which is the final laid-out page for the block.
    const pageMap = new Map<string, number>();
    const onContent: ContentCallback = (text, page) => {
      pageMap.set(text, page);
    };
    const element = template(doc.payload, onContent);
    await ReactPDF.renderToFile(element, outPath);
    const mapPath = resolve(DOC_PAGE_MAPS_DIR, `${doc.id}.json`);
    await writeFile(
      mapPath,
      JSON.stringify(Object.fromEntries(pageMap), null, 2) + '\n'
    );
    console.log(
      `✓ ${doc.id} → ${outPath} (${pageMap.size} content entries → ${mapPath})`
    );
  }

  // The HO-3 policy is not in SCENARIO_DOCUMENTS — it's the underlying
  // contract the Coverage agent retrieves from, separate from the claim
  // file. Render it from the same plain-text source the indexer uses.
  // While rendering, capture the page number for every top-level heading
  // so the workbench can deep-link citation chips into the PDF via
  // `#page=N`. react-pdf's `render` prop can fire multiple times during
  // layout reflow — last invocation wins, which gives the final page.
  const policyText = await readFile(POLICY_TXT_PATH, 'utf-8');
  const pageMap = new Map<string, number>();
  await ReactPDF.renderToFile(
    <PolicyPdf
      text={policyText}
      policyNumber={CLAIM.claim_number}
      namedInsured={CLAIM.insured.name}
      formId="ISO HO 00 03 (10/00)"
      onHeadingPage={(heading, page) => pageMap.set(heading, page)}
    />,
    POLICY_PDF_PATH
  );
  console.log(`✓ policy-ho3 → ${POLICY_PDF_PATH}`);

  await writeFile(
    POLICY_PAGE_MAP_PATH,
    JSON.stringify(Object.fromEntries(pageMap), null, 2) + '\n'
  );
  console.log(
    `✓ policy page map (${pageMap.size} headings) → ${POLICY_PAGE_MAP_PATH}`
  );

  console.log(
    `\nGenerated ${SCENARIO_DOCUMENTS.length + 1} PDFs under ${OUTPUT_DIR}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

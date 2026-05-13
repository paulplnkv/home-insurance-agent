// HO-3 policy facsimile. The same plain-text source the agent reads is
// rendered as a credibly-formatted multi-page document so the audience
// can open the underlying "47-page policy" during the demo.
import { Document, Text, View } from '@react-pdf/renderer';
import { Header, PageFrame, styles } from './frame';

interface PolicyPdfProps {
  text: string;
  policyNumber: string;
  namedInsured: string;
  formId: string;
  // Fires once per h1 (top-level ALL-CAPS heading) with the final page
  // number where the heading was rendered. Used by generate-pdfs to emit
  // a heading→page map so the workbench can deep-link citations into the
  // PDF via `#page=N`.
  onHeadingPage?: (heading: string, page: number) => void;
}

// Top-level ALL-CAPS headings, e.g. "SECTION I — PROPERTY COVERAGES".
const TOP_HEADING_REGEX = /^([A-Z][A-Z0-9 \-—,/]+)$/;

type Block =
  | { kind: 'h1'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'numbered'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'spacer' };

function parsePolicy(raw: string): Block[] {
  const lines = raw.split(/\r?\n/);
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ kind: 'p', text: paragraph.join(' ').trim() });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      flushParagraph();
      // Collapse runs of blank lines into a single spacer.
      if (
        blocks.length > 0 &&
        blocks[blocks.length - 1].kind !== 'spacer'
      ) {
        blocks.push({ kind: 'spacer' });
      }
      continue;
    }

    // Top-level ALL-CAPS heading line.
    if (TOP_HEADING_REGEX.test(trimmed) && trimmed.length >= 5) {
      flushParagraph();
      blocks.push({ kind: 'h1', text: trimmed });
      continue;
    }

    // Inline-bold subsection markers in the source: "1. **Loss Settlement.**"
    const boldMatch = trimmed.match(/^(\d+\.|[A-Z]\.)\s+\*\*([^*]+)\*\*\s*(.*)$/);
    if (boldMatch) {
      flushParagraph();
      const [, marker, title, rest] = boldMatch;
      blocks.push({ kind: 'h2', text: `${marker} ${title}` });
      if (rest.trim()) paragraph.push(rest.trim());
      continue;
    }

    // Bullet line.
    if (/^[-*•]\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({ kind: 'bullet', text: trimmed.replace(/^[-*•]\s+/, '') });
      continue;
    }

    // Numbered list line — "1. Foo" or "a. Foo" — only when preceded by a
    // blank line / heading (so we don't break paragraph flow on inline numbers).
    const numberedMatch = trimmed.match(/^((?:\d+|[a-zA-Z])\.)\s+(.*)$/);
    if (numberedMatch && (paragraph.length === 0 || paragraph.join('').endsWith(':'))) {
      flushParagraph();
      blocks.push({ kind: 'numbered', text: trimmed });
      continue;
    }

    // Default: append to current paragraph.
    paragraph.push(trimmed);
  }
  flushParagraph();

  return blocks;
}

// Strip markdown-style inline emphasis (`**bold**`) — react-pdf has no
// inline formatting parser so we drop the markers and let the text flow.
function stripInlineMd(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1');
}

export function PolicyPdf({
  text,
  policyNumber,
  namedInsured,
  formId,
  onHeadingPage,
}: PolicyPdfProps) {
  const blocks = parsePolicy(text);

  return (
    <Document
      title={`HO-3 Policy — ${namedInsured}`}
      author="Pacific States Mutual Insurance"
      creator="Claims Workbench Demo"
    >
      {/* Cover */}
      <PageFrame
        footerLeft="Pacific States Mutual · Homeowners Policy"
        footerRight={`Policy ${policyNumber}`}
      >
        <Header
          brand="Pacific States Mutual Insurance"
          brandSubline="Homeowners 3 — Special Form (ISO HO 00 03)"
          claimNumber={policyNumber}
        />
        <View style={{ marginTop: 60 }}>
          <Text
            style={{
              fontFamily: 'Helvetica-Bold',
              fontSize: 26,
              marginBottom: 6,
            }}
          >
            HOMEOWNERS POLICY
          </Text>
          <Text style={{ fontSize: 14, color: '#444', marginBottom: 32 }}>
            Form HO-3 · {formId}
          </Text>

          <CoverRow label="Policy number" value={policyNumber} />
          <CoverRow label="Named insured" value={namedInsured} />
          <CoverRow label="Form" value={`HO-3 (${formId}) Special Form`} />
          <CoverRow label="Issued by" value="Pacific States Mutual Insurance" />
        </View>

        <View style={{ marginTop: 80, borderTopWidth: 0.5, borderColor: '#bbb', paddingTop: 8 }}>
          <Text style={{ fontSize: 9, color: '#666', lineHeight: 1.5 }}>
            This policy contains all the terms, conditions, and limitations of
            the homeowners insurance contract between the named insured and
            the company. Please read this policy carefully and keep it with
            your important records.
          </Text>
        </View>
      </PageFrame>

      {/* Body — wraps across as many pages as needed. */}
      <PageFrame
        footerLeft="Pacific States Mutual · Homeowners Policy"
        footerRight={`Policy ${policyNumber}`}
      >
        <Header
          brand="Pacific States Mutual Insurance"
          brandSubline={`Homeowners 3 — Special Form · Policy ${policyNumber}`}
          claimNumber={policyNumber}
        />
        {blocks.map((block, i) => (
          <Block key={i} block={block} onHeadingPage={onHeadingPage} />
        ))}
      </PageFrame>
    </Document>
  );
}

function CoverRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: 6,
        paddingBottom: 6,
        borderBottomWidth: 0.5,
        borderColor: '#ddd',
      }}
    >
      <Text style={{ width: 130, color: '#666', fontSize: 10 }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 11, color: '#111' }}>{value}</Text>
    </View>
  );
}

function Block({
  block,
  onHeadingPage,
}: {
  block: Block;
  onHeadingPage?: (heading: string, page: number) => void;
}) {
  switch (block.kind) {
    case 'h1': {
      // react-pdf's `render` prop fires during layout. It can fire more
      // than once if the layout reflows — last invocation wins, which is
      // what we want: the final page number.
      const heading = block.text;
      return (
        <Text
          style={{
            fontFamily: 'Helvetica-Bold',
            fontSize: 13,
            marginTop: 14,
            marginBottom: 6,
            color: '#111',
            letterSpacing: 0.4,
          }}
          render={({ pageNumber }) => {
            onHeadingPage?.(heading, pageNumber);
            return heading;
          }}
        />
      );
    }
    case 'h2':
      return (
        <Text
          style={{
            fontFamily: 'Helvetica-Bold',
            fontSize: 10.5,
            marginTop: 8,
            marginBottom: 3,
            color: '#222',
          }}
        >
          {stripInlineMd(block.text)}
        </Text>
      );
    case 'bullet':
      return (
        <View
          style={{
            flexDirection: 'row',
            paddingLeft: 8,
            marginBottom: 2,
          }}
        >
          <Text style={{ width: 10, ...styles.body }}>•</Text>
          <Text style={{ flex: 1, ...styles.body }}>
            {stripInlineMd(block.text)}
          </Text>
        </View>
      );
    case 'numbered':
      return (
        <Text style={[styles.body, { marginLeft: 8, marginBottom: 2 }]}>
          {stripInlineMd(block.text)}
        </Text>
      );
    case 'p':
      return (
        <Text style={[styles.body, { marginBottom: 4 }]}>
          {stripInlineMd(block.text)}
        </Text>
      );
    case 'spacer':
      return <View style={{ height: 4 }} />;
  }
}

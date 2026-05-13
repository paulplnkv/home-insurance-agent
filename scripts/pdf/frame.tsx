// Shared PDF chrome + styles for the scenario claim documents. Per-doc
// templates compose <Frame>, <Section>, <MetaRow>, and the styles object
// to keep the visual language consistent across the six artifacts that
// land in the audience's view during the demo.
import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { ReactNode } from 'react';

// Callback fired once per tracked text block with the final page number
// where it was laid out. react-pdf's `render` prop can fire multiple
// times during reflow — last invocation wins, matching the final page.
export type TrackPage = (text: string, page: number) => void;

const NEUTRAL = {
  text: '#111111',
  muted: '#555555',
  faint: '#888888',
  border: '#cccccc',
  rule: '#999999',
  bandBg: '#eeeeee',
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 44,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: NEUTRAL.text,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.rule,
    paddingBottom: 8,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brand: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: NEUTRAL.muted,
  },
  brandLine: {
    fontSize: 8,
    color: NEUTRAL.faint,
    marginTop: 2,
  },
  claimBadge: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: NEUTRAL.muted,
    borderWidth: 0.6,
    borderColor: NEUTRAL.rule,
    paddingVertical: 3,
    paddingHorizontal: 6,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 10,
    color: NEUTRAL.muted,
    marginTop: 2,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: NEUTRAL.muted,
    marginBottom: 4,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.45,
  },
  bodyMuted: {
    fontSize: 10,
    lineHeight: 1.45,
    color: NEUTRAL.muted,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaCell: {
    width: '50%',
    paddingRight: 8,
    marginBottom: 2,
    flexDirection: 'row',
  },
  metaLabel: {
    width: 110,
    color: NEUTRAL.muted,
    fontSize: 9,
  },
  metaValue: {
    flex: 1,
    color: NEUTRAL.text,
    fontSize: 9,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL.bandBg,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: NEUTRAL.rule,
  },
  th: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: NEUTRAL.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.3,
    borderColor: NEUTRAL.border,
  },
  td: {
    fontSize: 9,
    color: NEUTRAL.text,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderTopWidth: 0.5,
    borderColor: NEUTRAL.rule,
  },
  totalsLabel: {
    fontSize: 9,
    color: NEUTRAL.muted,
    marginRight: 12,
  },
  totalsValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: NEUTRAL.text,
  },
  utterance: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  speaker: {
    width: 70,
    fontFamily: 'Helvetica-Bold',
    color: NEUTRAL.muted,
    fontSize: 9,
  },
  utterText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.45,
  },
  signature: {
    marginTop: 24,
    paddingTop: 10,
    borderTopWidth: 0.4,
    borderColor: NEUTRAL.border,
    fontSize: 9,
    color: NEUTRAL.muted,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 44,
    right: 44,
    fontSize: 7.5,
    color: NEUTRAL.faint,
    borderTopWidth: 0.4,
    borderTopColor: NEUTRAL.border,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export function Header({
  brand,
  brandSubline,
  claimNumber,
}: {
  brand: string;
  brandSubline?: string;
  claimNumber: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.brand}>{brand}</Text>
          {brandSubline ? (
            <Text style={styles.brandLine}>{brandSubline}</Text>
          ) : null}
        </View>
        <Text style={styles.claimBadge}>CLAIM {claimNumber}</Text>
      </View>
    </View>
  );
}

export function Section({
  label,
  children,
  style,
}: {
  label?: string;
  children: ReactNode;
  style?: Style;
}) {
  return (
    <View style={[styles.section, style ?? {}]}>
      {label ? <Text style={styles.sectionLabel}>{label}</Text> : null}
      {children}
    </View>
  );
}

export function MetaGrid({
  rows,
}: {
  rows: Array<[label: string, value: string | number | undefined]>;
}) {
  return (
    <View style={styles.metaGrid}>
      {rows.map(([label, value], i) =>
        value === undefined || value === '' || value === null ? null : (
          <View key={`${label}-${i}`} style={styles.metaCell}>
            <Text style={styles.metaLabel}>{label}</Text>
            <Text style={styles.metaValue}>{String(value)}</Text>
          </View>
        )
      )}
    </View>
  );
}

export function PageFrame({
  children,
  footerLeft,
  footerRight,
}: {
  children: ReactNode;
  footerLeft: string;
  footerRight?: string;
}) {
  return (
    <Page size="LETTER" style={styles.page} wrap>
      {children}
      <View style={styles.footer} fixed>
        <Text>{footerLeft}</Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `${footerRight ? `${footerRight}  ·  ` : ''}Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </Page>
  );
}

// Renders `text` as a regular Text block AND reports its final page
// number to `track`. The visible content goes in children so react-pdf
// wraps it normally; a zero-height sibling carries the `render` prop to
// capture the page number. (react-pdf bypasses normal text wrapping
// when `render` is set, so the same node can't do both.)
export function TrackedText({
  text,
  style,
  track,
}: {
  text: string;
  style?: Style | Style[];
  track?: TrackPage;
}) {
  return (
    <>
      <Text style={style}>{text}</Text>
      <PageMarker text={text} track={track} />
    </>
  );
}

// Zero-height sibling that records the final page number where it lays
// out. Use this when the visible text node has inline children (mixed
// styles) and can't carry its own `render` prop.
export function PageMarker({
  text,
  track,
}: {
  text: string;
  track?: TrackPage;
}) {
  return (
    <Text
      style={{ fontSize: 0.01, lineHeight: 0 }}
      render={({ pageNumber }) => {
        track?.(text, pageNumber);
        return '';
      }}
    />
  );
}

export function formatCurrencyCents(amount: number | undefined): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—';
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

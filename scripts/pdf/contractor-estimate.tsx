import { Document, Text, View } from '@react-pdf/renderer';
import {
  formatCurrencyCents,
  Header,
  MetaGrid,
  PageFrame,
  Section,
  TrackedText,
  type TrackPage,
  styles,
} from './frame';

interface ContractorEstimateDoc {
  title: string;
  metadata: {
    claim_number: string;
    estimate_number: string;
    prepared_for: string;
    property_address: string;
    contractor: string;
    contractor_address: string;
    contractor_license: string;
    contractor_phone: string;
    contact: string;
    date_prepared: string;
    estimate_software: string;
    scope_summary: string;
  };
  scope_narrative: string;
  line_items: Array<{
    code: string;
    description: string;
    qty: number;
    unit: string;
    unit_price: number;
    extended: number;
  }>;
  totals: {
    subtotal_rcv: number;
    deposit_required: number;
    balance_on_completion: number;
    valid_through: string;
  };
  notes: string;
  signature_block: {
    signed_by: string;
    signed_title: string;
    signed_date: string;
  };
}

export function ContractorEstimatePdf({
  doc,
  onContent,
}: {
  doc: ContractorEstimateDoc;
  onContent?: TrackPage;
}) {
  const m = doc.metadata;
  const t = doc.totals;

  // 5-column line-item table layout: code | description | qty | unit | unit_price | extended
  const colWidths = ['12%', '40%', '8%', '8%', '16%', '16%'];

  return (
    <Document
      title={doc.title}
      author={m.contractor}
      creator="Lone Star Premier Roofing — Estimating"
    >
      <PageFrame
        footerLeft={`${m.contractor} · Estimate ${m.estimate_number}`}
        footerRight={m.claim_number}
      >
        <Header
          brand={m.contractor}
          brandSubline={`${m.contractor_address} · License ${m.contractor_license}`}
          claimNumber={m.claim_number}
        />
        <Text style={styles.title}>Repair Estimate — Hailstorm</Text>
        <Text style={styles.subtitle}>{m.scope_summary}</Text>

        <View style={{ height: 12 }} />

        <Section label="Estimate header">
          <MetaGrid
            rows={[
              ['Estimate number', m.estimate_number],
              ['Date prepared', m.date_prepared],
              ['Prepared for', m.prepared_for],
              ['Property address', m.property_address],
              ['Estimator', m.contact],
              ['Phone', m.contractor_phone],
              ['Software', m.estimate_software],
              ['Valid through', t.valid_through],
            ]}
          />
        </Section>

        <Section label="Scope narrative">
          <TrackedText
            style={styles.body}
            text={doc.scope_narrative}
            track={onContent}
          />
        </Section>

        <Section label="Line items (Xactimate-style)">
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: colWidths[0] }]}>Code</Text>
            <Text style={[styles.th, { width: colWidths[1] }]}>Description</Text>
            <Text
              style={[
                styles.th,
                { width: colWidths[2], textAlign: 'right' },
              ]}
            >
              Qty
            </Text>
            <Text style={[styles.th, { width: colWidths[3] }]}>Unit</Text>
            <Text
              style={[
                styles.th,
                { width: colWidths[4], textAlign: 'right' },
              ]}
            >
              Unit price
            </Text>
            <Text
              style={[
                styles.th,
                { width: colWidths[5], textAlign: 'right' },
              ]}
            >
              Extended
            </Text>
          </View>
          {doc.line_items.map((item, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text
                style={[
                  styles.td,
                  { width: colWidths[0], fontFamily: 'Courier' },
                ]}
              >
                {item.code}
              </Text>
              <TrackedText
                style={[styles.td, { width: colWidths[1] }]}
                text={item.description}
                track={onContent}
              />
              <Text
                style={[styles.td, { width: colWidths[2], textAlign: 'right' }]}
              >
                {item.qty}
              </Text>
              <Text style={[styles.td, { width: colWidths[3] }]}>
                {item.unit}
              </Text>
              <Text
                style={[styles.td, { width: colWidths[4], textAlign: 'right' }]}
              >
                {formatCurrencyCents(item.unit_price)}
              </Text>
              <Text
                style={[styles.td, { width: colWidths[5], textAlign: 'right' }]}
              >
                {formatCurrencyCents(item.extended)}
              </Text>
            </View>
          ))}
          <View style={styles.totalsRow} wrap={false}>
            <Text style={styles.totalsLabel}>Subtotal (RCV)</Text>
            <TrackedText
              style={styles.totalsValue}
              text={formatCurrencyCents(t.subtotal_rcv)}
              track={onContent}
            />
          </View>
          <View style={[styles.totalsRow, { borderTopWidth: 0 }]} wrap={false}>
            <Text style={styles.totalsLabel}>Deposit required</Text>
            <Text style={styles.totalsValue}>
              {formatCurrencyCents(t.deposit_required)}
            </Text>
          </View>
          <View style={[styles.totalsRow, { borderTopWidth: 0 }]} wrap={false}>
            <Text style={styles.totalsLabel}>Balance on completion</Text>
            <Text style={styles.totalsValue}>
              {formatCurrencyCents(t.balance_on_completion)}
            </Text>
          </View>
        </Section>

        <Section label="Notes">
          <TrackedText
            style={styles.bodyMuted}
            text={doc.notes}
            track={onContent}
          />
        </Section>

        <View style={styles.signature} wrap={false}>
          <View>
            <Text>Signed: {doc.signature_block.signed_by}</Text>
            <Text style={{ color: '#888', marginTop: 2 }}>
              {doc.signature_block.signed_title}
            </Text>
          </View>
          <Text>{doc.signature_block.signed_date}</Text>
        </View>
      </PageFrame>
    </Document>
  );
}

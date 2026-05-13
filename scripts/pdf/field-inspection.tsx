import { Document, Text, View } from '@react-pdf/renderer';
import {
  Header,
  MetaGrid,
  PageFrame,
  PageMarker,
  Section,
  TrackedText,
  type TrackPage,
  styles,
} from './frame';

interface FieldInspectionDoc {
  title: string;
  metadata: {
    claim_number: string;
    inspector_name: string;
    inspector_firm: string;
    inspector_license: string;
    inspection_date: string;
    inspection_time: string;
    weather_at_inspection: string;
    property_address: string;
    insured_present: boolean;
    ladder_assist_used: boolean;
    drone_imagery_collected: boolean;
  };
  summary: string;
  scope_of_inspection: string[];
  explicitly_out_of_scope: string[];
  findings: Array<{
    zone: string;
    severity: string;
    observations: string;
    recommended_repair: string;
  }>;
  scope_recommendation: string;
  signature_block: {
    signed_by: string;
    signed_title: string;
    signed_date: string;
  };
}

const ZONE_LABELS: Record<string, string> = {
  roof_south_slope: 'Roof — South slope',
  roof_west_slope: 'Roof — West slope',
  roof_north_slope: 'Roof — North slope',
  roof_east_slope: 'Roof — East slope',
  gutter_front: 'Front gutter run',
  gutter_rear: 'Rear gutter run',
  skylight_kitchen: 'Kitchen skylight',
};

export function FieldInspectionPdf({
  doc,
  onContent,
}: {
  doc: FieldInspectionDoc;
  onContent?: TrackPage;
}) {
  const m = doc.metadata;

  return (
    <Document
      title={doc.title}
      author={m.inspector_firm}
      creator="North Texas Independent Adjusters"
    >
      <PageFrame
        footerLeft={`${m.inspector_firm} · Field inspection`}
        footerRight={m.claim_number}
      >
        <Header
          brand={m.inspector_firm}
          brandSubline={`Independent field adjuster · License ${m.inspector_license}`}
          claimNumber={m.claim_number}
        />
        <Text style={styles.title}>Field Inspection Report</Text>
        <Text style={styles.subtitle}>
          Onsite inspection performed on {m.inspection_date} at{' '}
          {m.inspection_time}.
        </Text>

        <View style={{ height: 12 }} />

        <Section label="Inspection metadata">
          <MetaGrid
            rows={[
              ['Inspector', `${m.inspector_name}, AIC`],
              ['License', m.inspector_license],
              ['Property address', m.property_address],
              ['Date', m.inspection_date],
              ['Time on site', m.inspection_time],
              ['Weather', m.weather_at_inspection],
              ['Insured present', m.insured_present ? 'Yes' : 'No'],
              ['Ladder assist', m.ladder_assist_used ? 'Yes' : 'No'],
              ['Drone imagery', m.drone_imagery_collected ? 'Yes' : 'No'],
            ]}
          />
        </Section>

        <Section label="Summary">
          <TrackedText style={styles.body} text={doc.summary} track={onContent} />
        </Section>

        <Section label="Scope of inspection">
          {doc.scope_of_inspection.map((s, i) => (
            <TrackedText
              key={i}
              style={styles.body}
              text={`  • ${s}`}
              track={onContent}
            />
          ))}
        </Section>

        <Section label="Explicitly out of scope">
          {doc.explicitly_out_of_scope.map((s, i) => (
            <TrackedText
              key={i}
              style={styles.bodyMuted}
              text={`  • ${s}`}
              track={onContent}
            />
          ))}
        </Section>

        <Section label="Findings by zone">
          {doc.findings.map((f, i) => (
            <View
              key={i}
              wrap={false}
              style={{
                borderLeftWidth: 1.5,
                borderColor: '#999',
                paddingLeft: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 2 }}
              >
                {ZONE_LABELS[f.zone] ?? f.zone}{' '}
                <Text style={{ fontFamily: 'Helvetica', color: '#666' }}>
                  · severity {f.severity}
                </Text>
              </Text>
              <Text style={[styles.body, { marginBottom: 2 }]}>
                <Text style={{ color: '#555' }}>Observations: </Text>
                {f.observations}
              </Text>
              <PageMarker text={f.observations} track={onContent} />
              <Text style={styles.body}>
                <Text style={{ color: '#555' }}>Recommended repair: </Text>
                {f.recommended_repair}
              </Text>
              <PageMarker text={f.recommended_repair} track={onContent} />
            </View>
          ))}
        </Section>

        <Section label="Scope recommendation">
          <TrackedText
            style={styles.body}
            text={doc.scope_recommendation}
            track={onContent}
          />
        </Section>

        <View style={styles.signature} wrap={false}>
          <View>
            <Text>{doc.signature_block.signed_by}</Text>
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

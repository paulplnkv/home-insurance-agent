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

interface NoaaDoc {
  title: string;
  metadata: {
    data_source: string;
    query_zip: string;
    query_radius_miles: number;
    query_date_range: { from: string; to: string };
    query_perils: string[];
    queried_at: string;
    operator: string;
  };
  events: Array<{
    event_id: string;
    event_type: string;
    begin_date_local: string;
    begin_time_local: string;
    end_time_local: string;
    max_hail_size_inches: number;
    narrative: string;
    verified_zip_within_radius: string[];
  }>;
  queried_date_of_loss: string;
  events_on_queried_date_of_loss: unknown[];
  match_summary: {
    qualifying_event_on_reported_date: boolean;
    nearest_qualifying_event: {
      event_id: string;
      date: string;
      delta_days_from_reported_loss: number;
      max_hail_size_inches: number;
    };
    notes: string;
  };
}

export function NoaaWeatherPdf({
  doc,
  onContent,
}: {
  doc: NoaaDoc;
  onContent?: TrackPage;
}) {
  const m = doc.metadata;
  const ms = doc.match_summary;

  return (
    <Document
      title={doc.title}
      author="NOAA NCEI Storm Events Database (synthetic facsimile)"
      creator="Pacific States Mutual — Verification Service"
    >
      <PageFrame
        footerLeft="NOAA NCEI Storm Events Database — Verification record"
        footerRight={`Queried ${m.queried_at}`}
      >
        <Header
          brand="NOAA · NCEI Storm Events Database"
          brandSubline={`Verification record (synthetic facsimile) · queried ${m.queried_at}`}
          claimNumber="—"
        />
        <Text style={styles.title}>Weather Event Verification</Text>
        <Text style={styles.subtitle}>
          Storm Events Database query for ZIP {m.query_zip}, radius{' '}
          {m.query_radius_miles} mi, perils {m.query_perils.join(', ')}.
        </Text>

        <View style={{ height: 12 }} />

        <Section label="Query parameters">
          <MetaGrid
            rows={[
              ['ZIP code', m.query_zip],
              ['Radius (mi)', m.query_radius_miles],
              ['Perils', m.query_perils.join(', ')],
              ['From', m.query_date_range.from],
              ['To', m.query_date_range.to],
              ['Queried at (UTC)', m.queried_at],
              ['Operator', m.operator],
              ['Reported date of loss', doc.queried_date_of_loss],
            ]}
          />
        </Section>

        <Section label="Events returned">
          {doc.events.length === 0 ? (
            <Text style={styles.bodyMuted}>No qualifying events.</Text>
          ) : (
            doc.events.map((ev, i) => (
              <View
                key={i}
                wrap={false}
                style={{
                  borderWidth: 0.5,
                  borderColor: '#bbb',
                  padding: 8,
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Helvetica-Bold',
                    fontSize: 10,
                    marginBottom: 2,
                  }}
                >
                  {ev.event_type} · {ev.begin_date_local} ({ev.begin_time_local}{' '}
                  – {ev.end_time_local})
                </Text>
                <Text style={[styles.bodyMuted, { fontSize: 9 }]}>
                  Event ID: {ev.event_id} · Max hail{' '}
                  {ev.max_hail_size_inches}" · Verified ZIPs{' '}
                  {ev.verified_zip_within_radius.join(', ')}
                </Text>
                <View style={{ height: 4 }} />
                <TrackedText
                  style={styles.body}
                  text={ev.narrative}
                  track={onContent}
                />
              </View>
            ))
          )}
        </Section>

        <Section label="Match summary (reported date of loss)">
          <View
            style={{
              borderWidth: 0.5,
              borderColor: '#999',
              padding: 8,
              backgroundColor: '#f7f7f7',
            }}
          >
            <Text
              style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 2 }}
            >
              Qualifying event on {doc.queried_date_of_loss}?{' '}
              <Text style={{ color: ms.qualifying_event_on_reported_date ? '#176d2c' : '#a13a2a' }}>
                {ms.qualifying_event_on_reported_date ? 'YES' : 'NO'}
              </Text>
            </Text>
            <Text style={styles.body}>
              Nearest qualifying event: {ms.nearest_qualifying_event.date} (
              {ms.nearest_qualifying_event.delta_days_from_reported_loss} days
              from reported loss), max hail{' '}
              {ms.nearest_qualifying_event.max_hail_size_inches}", event ID{' '}
              {ms.nearest_qualifying_event.event_id}.
            </Text>
            <PageMarker
              text={`Nearest qualifying event ${ms.nearest_qualifying_event.date} delta ${ms.nearest_qualifying_event.delta_days_from_reported_loss} days`}
              track={onContent}
            />
            <View style={{ height: 4 }} />
            <TrackedText
              style={styles.bodyMuted}
              text={ms.notes}
              track={onContent}
            />
          </View>
        </Section>

        <Section label="Source">
          <Text style={styles.bodyMuted}>{m.data_source}</Text>
        </Section>
      </PageFrame>
    </Document>
  );
}

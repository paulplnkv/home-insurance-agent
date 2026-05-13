import { Document, Text, View } from '@react-pdf/renderer';
import {
  Header,
  MetaGrid,
  PageFrame,
  Section,
  TrackedText,
  type TrackPage,
  styles,
} from './frame';

interface RecordedStatementDoc {
  title: string;
  metadata: {
    claim_number: string;
    interview_type: string;
    recording_id: string;
    interview_date: string;
    interview_started_at: string;
    interview_ended_at: string;
    interview_duration_seconds: number;
    interviewer: string;
    interviewer_title: string;
    interviewee: string;
    interviewee_role: string;
    consent_to_record: boolean;
    consent_capture_text: string;
  };
  preamble: string;
  transcript: Array<{ speaker: string; text: string }>;
}

export function RecordedStatementPdf({
  doc,
  onContent,
}: {
  doc: RecordedStatementDoc;
  onContent?: TrackPage;
}) {
  const m = doc.metadata;

  return (
    <Document
      title={doc.title}
      author="Pacific States Mutual — Property Claims"
      creator="Claims Workbench Demo"
    >
      <PageFrame
        footerLeft={`Pacific States Mutual · Recorded Statement · ${m.recording_id}`}
        footerRight={m.claim_number}
      >
        <Header
          brand="Pacific States Mutual Insurance"
          brandSubline="Recorded Statement · Property Claims"
          claimNumber={m.claim_number}
        />
        <Text style={styles.title}>Recorded Statement — Insured</Text>
        <Text style={styles.subtitle}>
          Telephonic interview conducted under the policy's cooperation clause.
        </Text>

        <View style={{ height: 12 }} />

        <Section label="Interview metadata">
          <MetaGrid
            rows={[
              ['Recording ID', m.recording_id],
              ['Interview type', m.interview_type],
              ['Date', m.interview_date],
              ['Started at', m.interview_started_at],
              ['Ended at', m.interview_ended_at],
              [
                'Duration',
                `${Math.round(m.interview_duration_seconds / 60)} min ${m.interview_duration_seconds % 60} sec`,
              ],
              ['Interviewer', m.interviewer],
              ['Interviewer title', m.interviewer_title],
              ['Interviewee', m.interviewee],
              ['Role', m.interviewee_role],
              ['Consent to record', m.consent_to_record ? 'Yes' : 'No'],
            ]}
          />
        </Section>

        <Section label="Consent capture">
          <Text style={[styles.body, { fontStyle: 'italic' }]}>
            "{m.consent_capture_text}"
          </Text>
        </Section>

        <Section label="Preamble">
          <Text style={styles.bodyMuted}>{doc.preamble}</Text>
        </Section>

        <Section label="Transcript">
          {doc.transcript.map((line, i) => (
            <View key={i} style={styles.utterance} wrap={false}>
              <Text style={styles.speaker}>{line.speaker}:</Text>
              <TrackedText
                style={styles.utterText}
                text={line.text}
                track={onContent}
              />
            </View>
          ))}
        </Section>

        <Section label="End of recorded statement">
          <Text style={styles.bodyMuted}>
            This transcript was generated from the audio recording referenced
            above. The original audio file is retained per the carrier's
            record-retention policy.
          </Text>
        </Section>
      </PageFrame>
    </Document>
  );
}

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

interface FnolDoc {
  title: string;
  metadata: {
    claim_number: string;
    intake_channel: string;
    call_id: string;
    call_started_at: string;
    call_ended_at: string;
    call_duration_seconds: number;
    csr_name: string;
    csr_employee_id: string;
    insured_name: string;
    policy_number: string;
    loss_location: string;
    reported_peril: string;
    reported_date_of_loss: string;
  };
  transcript: Array<{ speaker: string; text: string }>;
}

export function FnolPdf({
  doc,
  onContent,
}: {
  doc: FnolDoc;
  onContent?: TrackPage;
}) {
  const m = doc.metadata;
  return (
    <Document
      title={doc.title}
      author="Pacific States Mutual — FNOL Intake"
      creator="Claims Workbench Demo"
    >
      <PageFrame
        footerLeft={`Pacific States Mutual · FNOL Intake · ${m.call_id}`}
        footerRight={m.claim_number}
      >
        <Header
          brand="Pacific States Mutual Insurance"
          brandSubline="First Notice of Loss · Recorded Intake Call"
          claimNumber={m.claim_number}
        />
        <Text style={styles.title}>First Notice of Loss — Transcript</Text>
        <Text style={styles.subtitle}>
          Inbound call recorded under the carrier's standard FNOL recording
          policy. Insured was advised of recording at start of call.
        </Text>

        <View style={{ height: 12 }} />

        <Section label="Call metadata">
          <MetaGrid
            rows={[
              ['Insured', m.insured_name],
              ['Policy number', m.policy_number],
              ['Loss location', m.loss_location],
              ['Reported peril', m.reported_peril],
              ['Date of loss', m.reported_date_of_loss],
              ['Intake channel', m.intake_channel],
              ['Call ID', m.call_id],
              [
                'Call duration',
                `${Math.round(m.call_duration_seconds / 60)} min ${m.call_duration_seconds % 60} sec`,
              ],
              ['Call started', m.call_started_at],
              ['Call ended', m.call_ended_at],
              [
                'Customer service rep',
                `${m.csr_name} (${m.csr_employee_id})`,
              ],
            ]}
          />
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

        <Section label="End of transcript">
          <Text style={styles.bodyMuted}>
            This transcript has been generated from the recorded call audio.
            Audio is retained per the carrier's record-retention policy and is
            available on request through claim file{' '}
            {m.claim_number}.
          </Text>
        </Section>
      </PageFrame>
    </Document>
  );
}

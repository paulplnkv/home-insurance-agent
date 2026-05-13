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

interface MortgageStatementDoc {
  title: string;
  metadata: {
    claim_number: string;
    lender_name: string;
    lender_address: string;
    lender_phone: string;
    loan_number: string;
    borrower_name: string;
    co_borrower_name: string;
    property_address: string;
    statement_date: string;
    statement_period: { from: string; to: string };
    next_payment_due_date: string;
  };
  loan_summary: {
    original_loan_amount: number;
    current_principal_balance: number;
    interest_rate_apr: number;
    loan_type: string;
    first_payment_date: string;
    maturity_date: string;
    escrow_balance: number;
  };
  current_payment_breakdown: {
    principal: number;
    interest: number;
    escrow_taxes: number;
    escrow_insurance: number;
    total_monthly_payment: number;
  };
  loss_payee_clause: string;
  year_to_date: {
    interest_paid_ytd: number;
    principal_paid_ytd: number;
    escrow_taxes_paid_ytd: number;
    escrow_insurance_paid_ytd: number;
  };
  notes: string;
}

export function MortgageStatementPdf({
  doc,
  onContent,
}: {
  doc: MortgageStatementDoc;
  onContent?: TrackPage;
}) {
  const m = doc.metadata;
  const ls = doc.loan_summary;
  const pb = doc.current_payment_breakdown;
  const ytd = doc.year_to_date;

  return (
    <Document
      title={doc.title}
      author={m.lender_name}
      creator="Mortgage Servicing"
    >
      <PageFrame
        footerLeft={`${m.lender_name} · Loan ${m.loan_number}`}
        footerRight={`Statement ${m.statement_date}`}
      >
        <Header
          brand={m.lender_name}
          brandSubline={`${m.lender_address} · ${m.lender_phone}`}
          claimNumber={m.claim_number}
        />
        <Text style={styles.title}>Monthly Mortgage Statement</Text>
        <Text style={styles.subtitle}>
          Statement period {m.statement_period.from} to {m.statement_period.to}
          .
        </Text>

        <View style={{ height: 12 }} />

        <Section label="Account summary">
          <MetaGrid
            rows={[
              ['Loan number', m.loan_number],
              ['Borrower', m.borrower_name],
              ['Co-borrower', m.co_borrower_name],
              ['Property address', m.property_address],
              ['Statement date', m.statement_date],
              ['Next payment due', m.next_payment_due_date],
              ['Loan type', ls.loan_type],
              ['Interest rate (APR)', `${ls.interest_rate_apr}%`],
              ['First payment', ls.first_payment_date],
              ['Maturity', ls.maturity_date],
            ]}
          />
        </Section>

        <Section label="Loan balances">
          <MetaGrid
            rows={[
              ['Original loan amount', formatCurrencyCents(ls.original_loan_amount)],
              [
                'Current principal balance',
                formatCurrencyCents(ls.current_principal_balance),
              ],
              ['Escrow balance', formatCurrencyCents(ls.escrow_balance)],
            ]}
          />
        </Section>

        <Section label="Current monthly payment breakdown">
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: '60%' }]}>Component</Text>
            <Text style={[styles.th, { width: '40%', textAlign: 'right' }]}>
              Amount
            </Text>
          </View>
          {(
            [
              ['Principal', pb.principal],
              ['Interest', pb.interest],
              ['Escrow — taxes', pb.escrow_taxes],
              ['Escrow — insurance', pb.escrow_insurance],
            ] as const
          ).map(([label, value], i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, { width: '60%' }]}>{label}</Text>
              <Text style={[styles.td, { width: '40%', textAlign: 'right' }]}>
                {formatCurrencyCents(value)}
              </Text>
            </View>
          ))}
          <View style={styles.totalsRow} wrap={false}>
            <Text style={styles.totalsLabel}>Total monthly payment</Text>
            <Text style={styles.totalsValue}>
              {formatCurrencyCents(pb.total_monthly_payment)}
            </Text>
          </View>
        </Section>

        <Section label="Year to date">
          <MetaGrid
            rows={[
              ['Interest paid YTD', formatCurrencyCents(ytd.interest_paid_ytd)],
              ['Principal paid YTD', formatCurrencyCents(ytd.principal_paid_ytd)],
              [
                'Escrow taxes YTD',
                formatCurrencyCents(ytd.escrow_taxes_paid_ytd),
              ],
              [
                'Escrow insurance YTD',
                formatCurrencyCents(ytd.escrow_insurance_paid_ytd),
              ],
            ]}
          />
        </Section>

        <Section label="Loss payee / mortgagee clause">
          <View
            style={{
              borderLeftWidth: 2,
              borderColor: '#999',
              paddingLeft: 8,
              paddingVertical: 2,
            }}
          >
            <TrackedText
              style={styles.body}
              text={doc.loss_payee_clause}
              track={onContent}
            />
          </View>
        </Section>

        <Section label="Notes">
          <TrackedText
            style={styles.bodyMuted}
            text={doc.notes}
            track={onContent}
          />
        </Section>
      </PageFrame>
    </Document>
  );
}

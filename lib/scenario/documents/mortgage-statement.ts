import { dateOffsetFromLoss } from '../claim';

// Statement covers the month preceding the loss. Statement date is
// ~7 days before loss; period is the 30 days ending on the statement
// date; next payment is the month-anchor (1st) following the statement.
const STATEMENT_DATE = dateOffsetFromLoss(-7);
const PERIOD_FROM = dateOffsetFromLoss(-37);
const NEXT_PAYMENT_DUE = dateOffsetFromLoss(9);

const mortgageStatement = {
  id: 'mortgage-statement',
  kind: 'mortgage_statement',
  title: 'Mortgage Statement — Loss Payee Verification',
  filename: `MortgageStatement_Chen_${STATEMENT_DATE.slice(0, 7)}.pdf`,
  metadata: {
    claim_number: 'HO-2026-04-04217',
    lender_name: 'Lone Star National Mortgage, N.A.',
    lender_address: '8200 N Stemmons Fwy, Dallas TX 75247',
    lender_phone: '(800) 555-2298',
    loan_number: 'LSN-44218-9921',
    borrower_name: 'Maria Chen',
    co_borrower_name: 'David Chen',
    property_address: '4521 Oak Ridge Dr, Plano TX 75024',
    statement_date: STATEMENT_DATE,
    statement_period: { from: PERIOD_FROM, to: STATEMENT_DATE },
    next_payment_due_date: NEXT_PAYMENT_DUE,
  },
  loan_summary: {
    original_loan_amount: 384000.0,
    current_principal_balance: 318422.18,
    interest_rate_apr: 6.125,
    loan_type: 'Conventional 30-year fixed',
    first_payment_date: '2018-08-01',
    maturity_date: '2048-07-01',
    escrow_balance: 4218.4,
  },
  current_payment_breakdown: {
    principal: 472.18,
    interest: 1622.94,
    escrow_taxes: 612.0,
    escrow_insurance: 178.5,
    total_monthly_payment: 2885.62,
  },
  loss_payee_clause:
    'The mortgage is secured by the dwelling at 4521 Oak Ridge Dr, Plano TX 75024. Lone Star National Mortgage, N.A., its successors and/or assigns, must be named as Mortgagee / Loss Payee on the homeowners policy. Any insurance proceeds for covered losses to the dwelling will be made jointly payable to the borrower and the lender per the standard mortgagee clause.',
  year_to_date: {
    interest_paid_ytd: 6502.18,
    principal_paid_ytd: 1855.32,
    escrow_taxes_paid_ytd: 2448.0,
    escrow_insurance_paid_ytd: 714.0,
  },
  notes: `Account is current as of statement date. No delinquency. Property tax paid most recently ${dateOffsetFromLoss(-81)}. Hazard insurance premium last paid from escrow on ${dateOffsetFromLoss(-50)}.`,
} as const;

export default mortgageStatement;

import { CLAIM } from './claim';

// Shared localStorage key for the Coverage Agent (M2) Tier 3 adjuster
// confirmation. Written by the Pending Approvals block on the claim summary
// and the Coverage Agent's banner; read by the dashboard AI-status cell to
// flip the icon from "Action needed" → "Complete".
export const TIER3_CONFIRMED_KEY = `coverage:tier3-confirmed:${CLAIM.claim_number}`;

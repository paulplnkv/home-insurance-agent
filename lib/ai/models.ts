// Model IDs verified live against https://ai-gateway.vercel.sh/v1/models
// on 2026-05-06. Sonnet 4.6 is the PRD-decided model for all three agents.
// When updating, re-run:
//   curl -s https://ai-gateway.vercel.sh/v1/models \
//     | jq -r '[.data[] | select(.id | startswith("anthropic/")) | .id] | reverse | .[]'

export const SONNET_MODEL = 'anthropic/claude-sonnet-4.6';
export const EMBEDDING_MODEL = 'openai/text-embedding-3-small';

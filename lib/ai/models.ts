// Agents call Anthropic directly (@ai-sdk/anthropic, ANTHROPIC_API_KEY).
// Embeddings call OpenAI directly (@ai-sdk/openai, OPENAI_API_KEY).
// EMBEDDING_MODEL_ID is the canonical identifier used in the index metadata
// and the runtime staleness check; EMBEDDING_MODEL is the provider instance
// passed to embed()/embedMany().

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export const SONNET_MODEL = anthropic('claude-sonnet-4-6');
export const EMBEDDING_MODEL_ID = 'text-embedding-3-small';
export const EMBEDDING_MODEL = openai.embedding(EMBEDDING_MODEL_ID);

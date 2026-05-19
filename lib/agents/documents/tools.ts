// Tools for the Cross-Document Consistency agent. The model decides
// which documents to read by calling these — we don't pre-stuff the
// prompt with their contents. Tool-call events stream to the UI as a
// live activity feed.
import { tool } from 'ai';
import { z } from 'zod';
import {
  getDocumentById,
  SCENARIO_DOCUMENTS,
} from '@/lib/scenario/documents';
import { crossDocFindingsSchema } from './schema';

export const documentsTools = {
  list_documents: tool({
    description:
      'List every document in the claim file. Returns id, kind, title, and filename for each. Call this first to discover what is available.',
    inputSchema: z.object({}),
    execute: async () => {
      return SCENARIO_DOCUMENTS.map((d) => ({
        id: d.id,
        kind: d.kind,
        title: d.title,
        filename: d.filename,
      }));
    },
  }),

  read_document: tool({
    description:
      'Read the full payload of a single document by id. Returns the parsed contents (transcripts, line items, weather records, etc.). Call this for each document whose contents you need to inspect.',
    inputSchema: z.object({
      id: z
        .string()
        .describe(
          'Document id from list_documents. Must match exactly; ids are stable.'
        ),
    }),
    execute: async ({ id }) => {
      const doc = getDocumentById(id);
      if (!doc) {
        return {
          error: `No document with id "${id}". Call list_documents to get the canonical id set.`,
        };
      }
      return {
        id: doc.id,
        kind: doc.kind,
        title: doc.title,
        payload: doc.payload,
      };
    },
  }),

  report_findings: tool({
    description:
      'Submit the final CrossDocFindings object. Call this exactly once, after reading whichever documents you need. The input you pass IS the agent output — the UI renders it directly.',
    inputSchema: crossDocFindingsSchema,
    // Identity execute — the input IS the answer. We return it
    // unchanged so the streaming `input` field carries the structured
    // output to the client.
    execute: async (input) => input,
  }),
} as const;

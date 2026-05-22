'use client';

import { Streamdown } from 'streamdown';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { PageCard } from '@/components/workbench/agent-page';

// Pulls the bolded one-sentence headline the agent is required to write
// at the top of summary_markdown. Returns the cleaned headline plus the
// remainder of the memo so the card can render them as two separate
// blocks (headline first, body below) per the Figma.
function splitMemo(memo: string): { headline: string | null; body: string } {
  const lines = memo.split('\n');
  const firstNonEmpty = lines.findIndex((l) => l.trim().length > 0);
  if (firstNonEmpty === -1) return { headline: null, body: memo };
  const first = lines[firstNonEmpty].trim();
  const headline = first.replace(/^\*+|\*+$/g, '').trim();
  const rest = lines.slice(firstNonEmpty + 1).join('\n').trimStart();
  return {
    headline: headline.length > 0 ? headline : null,
    body: rest,
  };
}

export function FileSummaryCard({
  markdown,
  streaming,
}: {
  markdown: string | undefined;
  streaming: boolean;
}) {
  if (!markdown) {
    return streaming ? (
      <PageCard>
        <Shimmer className="text-xs">Drafting file summary…</Shimmer>
      </PageCard>
    ) : null;
  }
  const { headline, body } = splitMemo(markdown);
  return (
    <PageCard>
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold leading-snug text-[var(--ink)]">
          File summary
        </h2>
        {headline ? (
          <p className="text-sm font-medium leading-snug text-foreground">
            {headline}
          </p>
        ) : null}
        {body ? (
          <Streamdown className="markdown-memo" parseIncompleteMarkdown>
            {body}
          </Streamdown>
        ) : null}
      </div>
    </PageCard>
  );
}

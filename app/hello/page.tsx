'use client';

import { useEffect, useState } from 'react';

export default function HelloPage() {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/hello', { signal: controller.signal });
        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        for (;;) {
          const { value, done: streamDone } = await reader.read();
          if (streamDone) break;
          if (value) setText((prev) => prev + value);
        }
        setDone(true);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setError((e as Error).message);
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">AI Gateway smoke test</h1>
      <p className="text-sm text-muted-foreground">
        Streaming a token-by-token response through the Vercel AI Gateway via
        the AI SDK.
      </p>
      {error ? (
        <pre className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </pre>
      ) : (
        <pre className="rounded-md border bg-muted/40 p-4 text-sm whitespace-pre-wrap">
          {text || (done ? '(empty response)' : 'Streaming…')}
        </pre>
      )}
    </main>
  );
}

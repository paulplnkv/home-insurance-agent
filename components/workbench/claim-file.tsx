import Image from 'next/image';
import Link from 'next/link';
import { ExternalLinkIcon, FileTextIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DOCUMENT_KIND_LABELS,
  SCENARIO_DOCUMENTS,
} from '@/lib/scenario/documents';
import { PHOTO_MANIFEST } from '@/lib/scenario/photos';

const POLICY_PDF_URL = '/documents/policy-ho3.pdf';

// Read-only overview of every artifact in Maria Chen's claim file. Lets
// the audience open the underlying PDFs and the field photo set before
// any agent has run, so they can verify the AI is reading from real
// material once the panels populate.
export function ClaimFile() {
  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader className="gap-4 pb-4">
          <CardTitle className="text-base">Documents in this file</CardTitle>
          <ul className="flex flex-col gap-2">
            <DocRow
              title="HO-3 Policy — Pacific States Mutual"
              kindLabel="Policy contract · 18 pages"
              href={POLICY_PDF_URL}
              accent
            />
            {SCENARIO_DOCUMENTS.map((d) => (
              <DocRow
                key={d.id}
                title={d.title}
                kindLabel={DOCUMENT_KIND_LABELS[d.kind]}
                href={d.pdfUrl}
              />
            ))}
          </ul>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="gap-4 pb-4">
          <CardTitle className="text-base">
            Field photos ({PHOTO_MANIFEST.length})
          </CardTitle>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
            {PHOTO_MANIFEST.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={p.description}
                  className="group block overflow-hidden rounded-md border bg-card transition-colors hover:border-foreground/30"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={p.publicUrl}
                      alt={p.id}
                      fill
                      sizes="(max-width: 1024px) 25vw, 12vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="px-1.5 py-1 text-[10px] font-mono text-muted-foreground transition-colors group-hover:text-foreground">
                    {p.id}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardHeader>
      </Card>
    </section>
  );
}

function DocRow({
  title,
  kindLabel,
  href,
  accent,
}: {
  title: string;
  kindLabel: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-md border bg-card p-2.5 transition-colors hover:border-foreground/30 hover:bg-accent/40"
      >
        <FileTextIcon
          className={
            accent
              ? 'size-4 shrink-0 text-foreground'
              : 'size-4 shrink-0 text-muted-foreground'
          }
        />
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <span className="truncate text-sm font-medium">{title}</span>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {kindLabel}
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
          Open PDF
          <ExternalLinkIcon className="size-3" />
        </span>
      </a>
    </li>
  );
}

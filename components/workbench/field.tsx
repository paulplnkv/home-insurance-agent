import { ExternalLinkIcon } from 'lucide-react';

export function Field({
  label,
  value,
  href,
}: {
  label: string;
  value: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-foreground underline-offset-2 hover:underline"
        >
          {value}
          <ExternalLinkIcon className="size-3 text-muted-foreground" />
        </a>
      ) : (
        <span className="text-sm font-medium text-foreground">{value}</span>
      )}
    </div>
  );
}

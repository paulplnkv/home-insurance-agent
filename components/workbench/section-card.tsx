import { cn } from '@/lib/utils';

export function SectionCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-[16px] border border-[var(--line-soft)] bg-white p-6',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'text-[20px] font-semibold leading-none text-[var(--ink)]',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function FieldTile({
  label,
  value,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-[8px] bg-white p-3 shadow-[0_0_10px_rgba(0,0,0,0.1)]',
        className,
      )}
    >
      <span className="text-[14px] text-[var(--ink-soft)]">{label}</span>
      <span className="text-[16px] font-semibold text-[var(--ink)]">
        {value}
      </span>
    </div>
  );
}

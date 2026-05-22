import { cn } from '@/lib/utils';
import type { ClaimStatus } from '@/lib/scenario/dashboard-claims';

const STATUS_STYLE: Record<ClaimStatus, string> = {
  Open:
    'bg-[var(--status-open-bg)] border-[var(--status-open-fg)] text-[var(--status-open-fg)]',
  'In Investigation':
    'bg-[var(--status-investigation-bg)] border-[var(--status-investigation-fg)] text-[var(--status-investigation-fg)]',
  'Pending Review':
    'bg-[var(--status-review-bg)] border-[var(--status-review-fg)] text-[var(--status-review-fg)]',
  'In Adjustment':
    'bg-[var(--status-investigation-bg)] border-[var(--status-investigation-fg)] text-[var(--status-investigation-fg)]',
  'Payment Approved':
    'bg-[var(--status-open-bg)] border-[var(--status-open-fg)] text-[var(--status-open-fg)]',
  Closed:
    'bg-[var(--status-neutral-bg)] border-[var(--status-neutral-fg)] text-[var(--status-neutral-fg)]',
  Denied:
    'bg-[var(--status-danger-bg)] border-[var(--status-danger-fg)] text-[var(--status-danger-fg)]',
};

export function StatusBadge({
  status,
  className,
}: {
  status: ClaimStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border px-2 py-1 text-sm font-normal whitespace-nowrap',
        STATUS_STYLE[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

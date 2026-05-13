import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PanelStatus =
  | 'not_yet_processed'
  | 'running'
  | 'complete'
  | 'needs_review'
  | 'locked';

const LABELS: Record<PanelStatus, string> = {
  not_yet_processed: 'Not yet processed',
  running: 'Running',
  complete: 'Complete',
  needs_review: 'Needs Review',
  locked: 'Awaiting upstream agents',
};

export function StatusPill({
  status,
  className,
}: {
  status: PanelStatus;
  className?: string;
}) {
  // Variants stay subtle; the panel content carries the visual weight.
  const variant =
    status === 'needs_review'
      ? 'destructive'
      : status === 'complete'
        ? 'default'
        : 'secondary';

  return (
    <Badge variant={variant} className={cn('font-medium', className)}>
      {LABELS[status]}
    </Badge>
  );
}

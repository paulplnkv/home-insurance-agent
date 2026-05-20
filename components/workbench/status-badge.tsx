import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ClaimStatus } from '@/lib/scenario/dashboard-claims';

export function StatusBadge({
  status,
  className,
}: {
  status: ClaimStatus;
  className?: string;
}) {
  const variant: 'secondary' | 'outline' | 'destructive' =
    status === 'Denied'
      ? 'destructive'
      : status === 'Payment Approved' || status === 'Closed'
        ? 'outline'
        : 'secondary';

  return (
    <Badge variant={variant} className={cn('font-medium', className)}>
      {status}
    </Badge>
  );
}

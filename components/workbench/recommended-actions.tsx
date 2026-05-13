import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function RecommendedActions() {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-6 py-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold leading-tight">
            Recommended Actions
          </h2>
          <p className="text-xs text-muted-foreground">
            Consolidated next steps from all three agents
          </p>
        </div>
        <Badge variant="secondary" className="font-medium uppercase tracking-wide">
          Locked
        </Badge>
      </div>
      <CardContent className="pt-4 text-sm italic text-muted-foreground">
        Populates after Coverage, Damage, and Document Review complete.
      </CardContent>
    </Card>
  );
}

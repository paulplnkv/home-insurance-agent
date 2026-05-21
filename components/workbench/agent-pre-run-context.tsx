import { Card, CardContent } from '@/components/ui/card';

export function AgentPreRunContext({ rows }: { rows: readonly string[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
          Run context
        </span>
        <ul className="flex flex-col gap-1">
          {rows.map((row) => (
            <li key={row} className="text-xs text-muted-foreground">
              {row}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

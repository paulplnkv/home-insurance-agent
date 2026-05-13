import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusPill, type PanelStatus } from './status-pill';

// Workbench card that links to the agent's stage page. The workbench
// itself never fires agents — speakers open a stage page and run the
// agent there. Keeps the workbench cheap (no LLM cost on every refresh).
export function AgentCard({
  title,
  description,
  href,
  status,
}: {
  title: string;
  description: string;
  href: string;
  status: PanelStatus;
}) {
  return (
    <Link
      href={href}
      className="group block h-full rounded-lg outline-none ring-offset-2 transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors group-hover:border-foreground/20">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <StatusPill status={status} />
        </CardHeader>
        <CardContent className="flex items-center justify-end text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-transform group-hover:translate-x-0.5">
            Open
            <ArrowRightIcon className="size-3.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

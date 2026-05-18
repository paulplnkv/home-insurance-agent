import { AppBar } from '@/components/workbench/app-bar';
import { ClaimsDashboard } from '@/components/workbench/claims-dashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppBar />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-6">
        <ClaimsDashboard />
      </main>
    </div>
  );
}

import { AppBar } from '@/components/workbench/app-bar';
import { ClaimsDashboard } from '@/components/workbench/claims-dashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <AppBar />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-10 pt-6 pb-12">
        <ClaimsDashboard />
      </main>
    </div>
  );
}

import Sidebar from "@/components/layout/Sidebar";
import StatsCards from "@/components/dashboard/StatsCards";
import DemandChart from "@/components/dashboard/DemandChart";
import AlertsPanel from "@/components/dashboard/AlertsPanel";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
        <p className="text-sm text-slate-500 mb-6">Real-time overview of the transit network</p>
        <StatsCards />
        <div className="mb-8">
          <DemandChart />
        </div>
        <AlertsPanel />
      </main>
    </div>
  );
}

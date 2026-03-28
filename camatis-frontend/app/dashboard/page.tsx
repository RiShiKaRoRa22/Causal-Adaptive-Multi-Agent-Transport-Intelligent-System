"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import StatsCards from "@/components/dashboard/StatsCards";
import DemandChart from "@/components/dashboard/DemandChart";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import { postOptimize, getDashboard } from "@/lib/api";

export default function DashboardPage() {
  const [optimizing, setOptimizing] = useState(false);
  const [msg, setMsg] = useState("");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then((data) => {
      setDashboardData(data);
      setLoading(false);
    });
  }, []);

  const handleOptimize = async () => {
    setOptimizing(true);
    setMsg("");
    const res = await postOptimize();
    setMsg(res?.message ?? "Optimization complete");
    // Refresh dashboard data after optimization
    getDashboard().then((data) => setDashboardData(data));
    setOptimizing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8">Loading...</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <button
            onClick={handleOptimize}
            disabled={optimizing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {optimizing ? "Running..." : "Run Optimization"}
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-2">Real-time overview of the transit network</p>
        {msg && <p className="text-sm text-green-600 mb-4">{msg}</p>}
        <StatsCards stats={dashboardData.stats} />
        <div className="mb-8">
          <DemandChart
            demandData={dashboardData.demand}
            loadData={dashboardData.load}
          />
        </div>
        <AlertsPanel alerts={dashboardData.alerts} />
      </main>
    </div>
  );
}
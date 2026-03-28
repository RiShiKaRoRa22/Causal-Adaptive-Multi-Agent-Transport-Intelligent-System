import { Card, CardContent } from "@/components/ui/Card";
import { Bus, Route, TrendingUp, AlertTriangle, LucideIcon } from "lucide-react";

interface DashboardStats {
  total_routes: number;
  active_buses: number;
  high_demand_routes: number;
  anomalies: number;
  avg_load_factor: number;
  avg_demand: number;
}

interface StatItem {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

export default function StatsCards({ stats }: { stats: DashboardStats }) {
  const items: StatItem[] = [
    { title: "Total Routes", value: stats.total_routes, icon: Route, color: "text-blue-500" },
    { title: "Active Buses", value: stats.active_buses, icon: Bus, color: "text-green-500" },
    { title: "High Demand Routes", value: stats.high_demand_routes, icon: TrendingUp, color: "text-orange-500" },
    { title: "Anomalies Detected", value: stats.anomalies, icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {items.map(({ title, value, icon: Icon, color }) => (
        <Card key={title}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`p-3 rounded-full bg-slate-100 ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
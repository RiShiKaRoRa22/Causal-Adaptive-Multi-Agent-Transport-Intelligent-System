import { Card, CardContent } from "@/components/ui/Card";
import { dashboardStats } from "@/lib/mockData";
import { Bus, Route, TrendingUp, AlertTriangle, LucideIcon } from "lucide-react";

interface StatItem {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

const stats: StatItem[] = [
  { title: "Total Routes", value: dashboardStats.total_routes, icon: Route, color: "text-blue-500" },
  { title: "Active Buses", value: dashboardStats.active_buses, icon: Bus, color: "text-green-500" },
  { title: "High Demand Routes", value: dashboardStats.high_demand_routes, icon: TrendingUp, color: "text-orange-500" },
  { title: "Anomalies Detected", value: dashboardStats.anomalies, icon: AlertTriangle, color: "text-red-500" },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {stats.map(({ title, value, icon: Icon, color }) => (
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

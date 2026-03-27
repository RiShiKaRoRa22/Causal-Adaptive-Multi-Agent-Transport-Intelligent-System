import { alerts } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AlertTriangle, Info, XCircle } from "lucide-react";

const levelConfig = {
  critical: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
};

export default function AlertsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const { icon: Icon, color, bg } = levelConfig[alert.level as keyof typeof levelConfig];
            return (
              <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${bg}`}>
                <Icon size={16} className={`mt-0.5 shrink-0 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{alert.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

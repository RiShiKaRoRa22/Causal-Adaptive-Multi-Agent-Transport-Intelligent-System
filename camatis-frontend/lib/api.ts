const BASE = "http://localhost:8000";

async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return fallback;
  }
}

// ── Dashboard ──────────────────────────────────────────────────────────────
import { dashboardStats, passengerDemandData, loadFactorData, alerts } from "./mockData";
export const getDashboard = () =>
  get("/dashboard", { stats: dashboardStats, demand: passengerDemandData, load: loadFactorData, alerts });

// ── Routes ─────────────────────────────────────────────────────────────────
import { routesData } from "./mockData";
export const getRoutes = () => get("/routes", routesData);

// ── Route detail ───────────────────────────────────────────────────────────
import { routeDetailData } from "./mockData";
export const getRoute = (id: string) =>
  get(`/route/${id}`, routeDetailData[id] ?? null);

// ── Optimize ───────────────────────────────────────────────────────────────
export const postOptimize = async () => {
  try {
    const res = await fetch(`${BASE}/optimize`, { method: "POST" });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return { success: true, message: "Optimization triggered (mock)" };
  }
};

// ── Results — matches real API shape ──────────────────────────────────────
import { optimizationResults } from "./mockData";
export const getResults = () => get("/results", optimizationResults);

// ── Alerts ─────────────────────────────────────────────────────────────────
import { anomalyAlerts } from "./mockData";
export const getAlerts = () => get("/alerts", anomalyAlerts);

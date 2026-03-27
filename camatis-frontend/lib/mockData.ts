export const dashboardStats = {
  total_routes: 250,
  active_buses: 1200,
  high_demand_routes: 34,
  anomalies: 5,
};

export const passengerDemandData = [
  { time: "06:00", demand: 320 },
  { time: "08:00", demand: 980 },
  { time: "10:00", demand: 650 },
  { time: "12:00", demand: 720 },
  { time: "14:00", demand: 540 },
  { time: "16:00", demand: 890 },
  { time: "18:00", demand: 1100 },
  { time: "20:00", demand: 600 },
  { time: "22:00", demand: 280 },
];

export const loadFactorData = [
  { route: "R-101", load: 87 },
  { route: "R-205", load: 65 },
  { route: "R-312", load: 92 },
  { route: "R-418", load: 45 },
  { route: "R-523", load: 78 },
  { route: "R-630", load: 55 },
];

export const alerts = [
  { id: 1, message: "Route R-312 load factor exceeded 90%", level: "critical", time: "10:32 AM" },
  { id: 2, message: "Anomaly detected on Route R-101 — unusual passenger spike", level: "warning", time: "10:15 AM" },
  { id: 3, message: "Bus #447 delayed by 12 minutes on Route R-205", level: "info", time: "09:58 AM" },
  { id: 4, message: "Route R-523 operating at high demand", level: "warning", time: "09:40 AM" },
  { id: 5, message: "Scheduled maintenance for Bus #312 at 14:00", level: "info", time: "09:20 AM" },
  { id: 6, message: "Route R-418 load factor below threshold — consider reallocation", level: "info", time: "08:55 AM" },
];

export type RouteStatus = "Normal" | "Risk" | "Anomaly";

export interface Route {
  id: string;
  demand: number;
  loadFactor: number;
  status: RouteStatus;
}

export const routesData: Route[] = [
  { id: "R-101", demand: 980, loadFactor: 87, status: "Risk" },
  { id: "R-205", demand: 650, loadFactor: 65, status: "Normal" },
  { id: "R-312", demand: 1100, loadFactor: 92, status: "Anomaly" },
  { id: "R-418", demand: 320, loadFactor: 45, status: "Normal" },
  { id: "R-523", demand: 890, loadFactor: 78, status: "Risk" },
  { id: "R-630", demand: 540, loadFactor: 55, status: "Normal" },
  { id: "R-714", demand: 760, loadFactor: 70, status: "Normal" },
  { id: "R-819", demand: 1050, loadFactor: 95, status: "Anomaly" },
  { id: "R-922", demand: 430, loadFactor: 40, status: "Normal" },
  { id: "R-1005", demand: 870, loadFactor: 82, status: "Risk" },
];

export const routeDetailData: Record<string, {
  demandTrend: { time: string; demand: number }[];
  loadTrend: { time: string; load: number }[];
  confidence: number;
  recommendations: {
    frequencyMultiplier: string;
    busesToAdd: string;
    rerouteSuggestion: string;
  };
  actionBadges: { label: string; color: string }[];
}> = {
  "R-101": {
    demandTrend: [
      { time: "06:00", demand: 210 }, { time: "08:00", demand: 980 }, { time: "10:00", demand: 720 },
      { time: "12:00", demand: 650 }, { time: "14:00", demand: 480 }, { time: "16:00", demand: 860 },
      { time: "18:00", demand: 1050 }, { time: "20:00", demand: 540 }, { time: "22:00", demand: 200 },
    ],
    loadTrend: [
      { time: "06:00", load: 42 }, { time: "08:00", load: 87 }, { time: "10:00", load: 74 },
      { time: "12:00", load: 68 }, { time: "14:00", load: 55 }, { time: "16:00", load: 82 },
      { time: "18:00", load: 91 }, { time: "20:00", load: 60 }, { time: "22:00", load: 30 },
    ],
    confidence: 84,
    recommendations: { frequencyMultiplier: "1.5x", busesToAdd: "+3 Buses", rerouteSuggestion: "Via Highway 4" },
    actionBadges: [
      { label: "Increase Frequency", color: "blue" },
      { label: "Allocate Bus", color: "green" },
      { label: "Monitor Load", color: "yellow" },
    ],
  },
  "R-312": {
    demandTrend: [
      { time: "06:00", demand: 400 }, { time: "08:00", demand: 1100 }, { time: "10:00", demand: 900 },
      { time: "12:00", demand: 850 }, { time: "14:00", demand: 700 }, { time: "16:00", demand: 1000 },
      { time: "18:00", demand: 1200 }, { time: "20:00", demand: 750 }, { time: "22:00", demand: 300 },
    ],
    loadTrend: [
      { time: "06:00", load: 55 }, { time: "08:00", load: 92 }, { time: "10:00", load: 88 },
      { time: "12:00", load: 85 }, { time: "14:00", load: 76 }, { time: "16:00", load: 90 },
      { time: "18:00", load: 97 }, { time: "20:00", load: 80 }, { time: "22:00", load: 45 },
    ],
    confidence: 91,
    recommendations: { frequencyMultiplier: "2x", busesToAdd: "+5 Buses", rerouteSuggestion: "Via Ring Road" },
    actionBadges: [
      { label: "Increase Frequency", color: "blue" },
      { label: "Allocate Bus", color: "green" },
      { label: "Reroute Recommended", color: "orange" },
    ],
  },
};

export function getRouteDetail(id: string) {
  if (routeDetailData[id]) return routeDetailData[id];
  return {
    demandTrend: [
      { time: "06:00", demand: 300 }, { time: "08:00", demand: 700 }, { time: "10:00", demand: 550 },
      { time: "12:00", demand: 600 }, { time: "14:00", demand: 450 }, { time: "16:00", demand: 750 },
      { time: "18:00", demand: 900 }, { time: "20:00", demand: 500 }, { time: "22:00", demand: 220 },
    ],
    loadTrend: [
      { time: "06:00", load: 35 }, { time: "08:00", load: 65 }, { time: "10:00", load: 55 },
      { time: "12:00", load: 60 }, { time: "14:00", load: 48 }, { time: "16:00", load: 70 },
      { time: "18:00", load: 78 }, { time: "20:00", load: 52 }, { time: "22:00", load: 28 },
    ],
    confidence: 76,
    recommendations: { frequencyMultiplier: "1.2x", busesToAdd: "+1 Bus", rerouteSuggestion: "No change needed" },
    actionBadges: [
      { label: "Monitor Load", color: "yellow" },
    ],
  };
}

export const optimizationResults = [
  { route_id: 101, demand_after: 1.0, waiting_passengers: 980, actions: ["High Demand Risk", "Allocate Extra Bus"], frequency_multiplier: 1.5, buses_added: 3, rerouted_to: null, anomaly: false, high_uncertainty: true },
  { route_id: 205, demand_after: 1.0, waiting_passengers: 650, actions: ["No action"], frequency_multiplier: 1.0, buses_added: 0, rerouted_to: null, anomaly: false, high_uncertainty: false },
  { route_id: 312, demand_after: 1.0, waiting_passengers: 1100, actions: ["High Demand Risk", "Increase Frequency", "Allocate Extra Bus"], frequency_multiplier: 2.0, buses_added: 5, rerouted_to: null, anomaly: false, high_uncertainty: true },
  { route_id: 418, demand_after: 1.0, waiting_passengers: 320, actions: ["No action"], frequency_multiplier: 0.8, buses_added: 0, rerouted_to: null, anomaly: false, high_uncertainty: false },
  { route_id: 523, demand_after: 1.0, waiting_passengers: 890, actions: ["High Demand Risk", "Allocate Extra Bus"], frequency_multiplier: 1.3, buses_added: 2, rerouted_to: null, anomaly: false, high_uncertainty: true },
  { route_id: 630, demand_after: 1.0, waiting_passengers: 540, actions: ["No action"], frequency_multiplier: 1.0, buses_added: 0, rerouted_to: null, anomaly: false, high_uncertainty: false },
];

export const anomalyAlerts = [
  { id: 1, route: "R-312", message: "Load factor exceeded 90% — critical overcapacity", severity: "High", time: "10:32 AM" },
  { id: 2, route: "R-101", message: "Unusual passenger spike detected", severity: "High", time: "10:15 AM" },
  { id: 3, route: "R-523", message: "Demand 40% above forecast", severity: "Medium", time: "09:58 AM" },
  { id: 4, route: "R-819", message: "Load factor at 95% — approaching critical", severity: "High", time: "09:40 AM" },
  { id: 5, route: "R-205", message: "Bus #447 delayed by 12 minutes", severity: "Low", time: "09:20 AM" },
  { id: 6, route: "R-418", message: "Ridership below threshold — consider reallocation", severity: "Low", time: "08:55 AM" },
];

export const routeUtilizationData = [
  { name: "High (>80%)", value: 3 },
  { name: "Medium (50-80%)", value: 5 },
  { name: "Low (<50%)", value: 2 },
];

"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { getResults } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Bus, Clock, MapPin, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface Result {
  route_id: number;
  demand_after: number;
  waiting_passengers: number;
  actions: string[];
  frequency_multiplier: number;
  buses_added: number;
  rerouted_to: number | null;
  anomaly: boolean;
  high_uncertainty: boolean;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof Result>("waiting_passengers");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    getResults().then((data) => {
      setResults(data as Result[]);
      setLoading(false);
    });
  }, []);

  const sortedResults = [...results].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    }
    return 0;
  });

  const getStatusIcon = (r: Result) => {
    if (r.anomaly) return <AlertTriangle size={16} className="text-red-500" />;
    if (r.high_uncertainty) return <AlertTriangle size={16} className="text-yellow-500" />;
    if (r.buses_added > 0 || r.frequency_multiplier > 1) return <TrendingUp size={16} className="text-green-500" />;
    return <TrendingDown size={16} className="text-slate-400" />;
  };

  const getImpactBadge = (r: Result) => {
    if (r.waiting_passengers > 10000) return { text: "Critical", color: "bg-red-100 text-red-700 border-red-200" };
    if (r.waiting_passengers > 5000) return { text: "High", color: "bg-orange-100 text-orange-700 border-orange-200" };
    if (r.waiting_passengers > 2000) return { text: "Moderate", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    return { text: "Normal", color: "bg-green-100 text-green-700 border-green-200" };
  };

  const isCritical = (r: Result) =>
    r.high_uncertainty || r.anomaly || r.buses_added > 0 || r.rerouted_to !== null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Simulation Results</h1>
          <p className="text-sm text-slate-500">
            AI-generated decisions with simulated system impact
          </p>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading simulation results...</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Routes with Actions</p>
                      <p className="text-xl font-bold">
                        {results.filter(r => r.actions.length > 0 && !r.actions.includes("No action")).length}
                      </p>
                    </div>
                    <Bus size={24} className="text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Total Buses Added</p>
                      <p className="text-xl font-bold">{results.reduce((sum, r) => sum + r.buses_added, 0)}</p>
                    </div>
                    <Bus size={24} className="text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Avg Frequency Multiplier</p>
                      <p className="text-xl font-bold">
                        {(results.reduce((sum, r) => sum + r.frequency_multiplier, 0) / results.length).toFixed(2)}x
                      </p>
                    </div>
                    <Clock size={24} className="text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Avg Waiting Passengers</p>
                      <p className="text-xl font-bold">
                        {(results.reduce((sum, r) => sum + r.waiting_passengers, 0) / results.length).toLocaleString()}
                      </p>
                    </div>
                    <MapPin size={24} className="text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setSortBy("waiting_passengers"); setSortOrder("desc"); }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  sortBy === "waiting_passengers" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Sort by Waiting
              </button>
              <button
                onClick={() => { setSortBy("buses_added"); setSortOrder("desc"); }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  sortBy === "buses_added" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Sort by Buses Added
              </button>
              <button
                onClick={() => { setSortBy("frequency_multiplier"); setSortOrder("desc"); }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  sortBy === "frequency_multiplier" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Sort by Frequency
              </button>
            </div>

            {/* Results Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Waiting</TableHead>
                      <TableHead>Demand After</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Freq</TableHead>
                      <TableHead>Buses</TableHead>
                      <TableHead>Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedResults.map((r) => {
                      const impact = getImpactBadge(r);
                      return (
                        <TableRow key={r.route_id} className={isCritical(r) ? "bg-red-50/30" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(r)}
                              <span>Route {r.route_id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              r.anomaly ? "bg-red-100 text-red-700 border-red-200" :
                              r.high_uncertainty ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                              r.buses_added > 0 ? "bg-green-100 text-green-700 border-green-200" :
                              "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                              {r.anomaly ? "Anomaly" : 
                               r.high_uncertainty ? "Uncertain" :
                               r.buses_added > 0 ? "Optimized" : "Normal"}
                            </span>
                          </TableCell>
                          <TableCell className={r.waiting_passengers > 5000 ? "text-red-600 font-bold" : ""}>
                            {r.waiting_passengers.toLocaleString()}
                          </TableCell>
                          <TableCell>{r.demand_after.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {r.actions.filter(a => a !== "No action").slice(0, 2).map((a) => (
                                <span key={a} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  {a}
                                </span>
                              ))}
                              {r.actions.every(a => a === "No action") && (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {r.frequency_multiplier !== 1.0 ? (
                              <span className="font-medium text-purple-600">{r.frequency_multiplier}x</span>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            {r.buses_added > 0 ? (
                              <span className="font-medium text-green-600">+{r.buses_added}</span>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${impact.color}`}>
                              {impact.text}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Note about simulation */}
            <div className="mt-4 text-xs text-slate-400 text-center">
              * Values reflect simulated system state after applying agent decisions and demand redistribution
            </div>
          </>
        )}
      </main>
    </div>
  );
}
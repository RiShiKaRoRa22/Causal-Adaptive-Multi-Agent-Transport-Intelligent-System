"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { getResults } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

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

  useEffect(() => {
    getResults().then((data) => {
      setResults(data as Result[]);
      setLoading(false);
    });
  }, []);

  const isCritical = (r: Result) =>
    r.high_uncertainty || r.buses_added > 0 || r.rerouted_to !== null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Optimization Results</h1>
        <p className="text-sm text-slate-500 mb-6">
          AI-generated schedule and allocation recommendations
        </p>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route ID</TableHead>
                    <TableHead>Freq. Multiplier</TableHead>
                    <TableHead>Buses Added</TableHead>
                    <TableHead>Rerouted To</TableHead>
                    <TableHead>Waiting Passengers</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.route_id} className={isCritical(r) ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">
                        {r.route_id === -1 ? "Unknown" : `Route ${r.route_id}`}
                      </TableCell>
                      <TableCell>{r.frequency_multiplier.toFixed(2)}x</TableCell>
                      <TableCell>{r.buses_added > 0 ? `+${r.buses_added}` : "—"}</TableCell>
                      <TableCell>{r.rerouted_to !== null ? `Route ${r.rerouted_to}` : "—"}</TableCell>
                      <TableCell>{r.waiting_passengers.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {r.actions.filter(a => a !== "No action").slice(0, 2).map((a) => (
                            <span key={a} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                              {a}
                            </span>
                          ))}
                          {r.actions.every(a => a === "No action") && (
                            <span className="text-xs text-slate-400">No action</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          isCritical(r)
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-green-100 text-green-700 border-green-200"
                        }`}>
                          {isCritical(r) ? "Critical" : "Normal"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

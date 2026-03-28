"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SettingsPage() {
  const [form, setForm] = useState({
    maxBuses: "50",
    frequencyLimit: "10",
    optimizationPreference: "balanced",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Settings</h1>
        <p className="text-sm text-slate-500 mb-6">Configure optimization parameters</p>

        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Optimization Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Max Buses</label>
                <input
                  type="number"
                  value={form.maxBuses}
                  onChange={(e) => setForm({ ...form, maxBuses: e.target.value })}
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Frequency Limit (per hour)</label>
                <input
                  type="number"
                  value={form.frequencyLimit}
                  onChange={(e) => setForm({ ...form, frequencyLimit: e.target.value })}
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Optimization Preference</label>
                <select
                  value={form.optimizationPreference}
                  onChange={(e) => setForm({ ...form, optimizationPreference: e.target.value })}
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="balanced">Balanced</option>
                  <option value="cost">Cost Minimization</option>
                  <option value="demand">Demand Coverage</option>
                  <option value="efficiency">Efficiency First</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {saved ? "Saved!" : "Save Settings"}
              </button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

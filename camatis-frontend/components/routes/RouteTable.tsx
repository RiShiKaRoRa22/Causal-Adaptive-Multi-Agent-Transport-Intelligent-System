"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { routesData, Route } from "@/lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

const statusVariant: Record<Route["status"], string> = {
  Normal: "bg-green-100 text-green-700 border-green-200",
  Risk: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Anomaly: "bg-red-100 text-red-700 border-red-200",
};

export default function RouteTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = routesData.filter((r) =>
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder="Search by Route ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route ID</TableHead>
                <TableHead>Demand</TableHead>
                <TableHead>Load Factor (%)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((route) => (
                <TableRow
                  key={route.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/routes/${encodeURIComponent(route.id)}`)}
                >
                  <TableCell className="font-medium text-blue-600 hover:underline">{route.id}</TableCell>
                  <TableCell>{route.demand}</TableCell>
                  <TableCell>{route.loadFactor}%</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusVariant[route.status]}`}>
                      {route.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

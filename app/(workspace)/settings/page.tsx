"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [unitSystem, setUnitSystem] = useState<"SI" | "IP">("SI");
  const [cachePersistent, setCachePersistent] = useState(true);

  return (
    <div className="space-y-6 w-full max-w-4xl min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Application Settings & Solver Options
            </h1>
            <Badge variant="violet">CONFIGURATION</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            Manage unit systems, numerical solver tolerance thresholds, and local client cache persistence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base">Engineering Unit Conventions</CardTitle>
            <CardDescription>Select between SI Metric and IP Imperial engineering units.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-3 text-xs">
            <div
              onClick={() => setUnitSystem((prev) => (prev === "SI" ? "IP" : "SI"))}
              className="p-3.5 rounded-inner bg-canvas border border-border-subtle flex justify-between items-center cursor-pointer select-none"
            >
              <div>
                <p className="font-semibold text-slate-ink">
                  {unitSystem === "SI" ? "Metric SI (m, °C, W/m²·K, kPa)" : "Imperial IP (ft, °F, BTU/h·ft²·°F, psi)"}
                </p>
                <p className="text-slate-muted">Click to toggle engineering unit standard.</p>
              </div>
              <Badge variant="violet">{unitSystem}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base">Numerical Solver Tolerances</CardTitle>
            <CardDescription>Iteration limits and energy balance convergence criteria.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-3 text-xs">
            <div className="p-3.5 rounded-inner bg-canvas border border-border-subtle flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-ink">Energy Conservation Tolerance</p>
                <p className="text-slate-muted">Maximum allowable nodal residual error.</p>
              </div>
              <span className="font-mono font-bold text-slate-ink">1e-4 W</span>
            </div>
            <div className="p-3.5 rounded-inner bg-canvas border border-border-subtle flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-ink">Client State Caching</p>
                <p className="text-slate-muted">Store active project snapshot in browser localStorage.</p>
              </div>
              <Switch checked={cachePersistent} onCheckedChange={setCachePersistent} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

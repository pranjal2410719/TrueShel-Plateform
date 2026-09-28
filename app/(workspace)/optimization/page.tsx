"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OptimizationPage() {
  const [objective, setObjective] = useState("comfort-max");

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Multi-Objective Design Optimization
            </h1>
            <Badge variant="violet">PARETO OPTIMAL</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            Physics-driven parametric search balancing thermal comfort, envelope heat loss, and material mass constraints.
          </p>
        </div>
        <Button variant="default" size="default">
          <Play className="w-4 h-4 mr-2 fill-surface text-surface" />
          Run Optimization
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Objectives & Constraints */}
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base">Objective Function</CardTitle>
            <CardDescription>Select primary optimization target weighting.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-2 text-xs">
            {[
              { id: "comfort-max", label: "Maximize Comfort Hours", desc: "Prioritize ≥18°C duration in winter" },
              { id: "loss-min", label: "Minimize Peak Heat Loss", desc: "Minimize required auxiliary heating wattage" },
              { id: "balanced", label: "Pareto Balanced", desc: "50% Comfort / 50% Mass efficiency" },
            ].map((obj) => (
              <div
                key={obj.id}
                onClick={() => setObjective(obj.id)}
                className={`p-3.5 rounded-inner border cursor-pointer transition-all ${
                  objective === obj.id
                    ? "border-shop-violet bg-shop-violet-subtle text-slate-ink"
                    : "border-border-subtle bg-canvas text-slate-muted"
                }`}
              >
                <p className="font-semibold text-slate-ink">{obj.label}</p>
                <p className="text-[11px] text-slate-muted mt-0.5">{obj.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Search Statistics & Best Candidate */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Best Candidate Solution</CardTitle>
              <Badge variant="comfort">RANK #1 CANDIDATE</Badge>
            </div>
            <CardDescription>Evaluated 128 parametric configurations across 5 variable dimensions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-inner bg-canvas border border-border-subtle">
                <span className="text-slate-muted block">Insulation Thickness</span>
                <span className="text-lg font-bold text-slate-ink">140 mm</span>
              </div>
              <div className="p-3.5 rounded-inner bg-canvas border border-border-subtle">
                <span className="text-slate-muted block">South Glazing Area</span>
                <span className="text-lg font-bold text-slate-ink">5.2 m²</span>
              </div>
              <div className="p-3.5 rounded-inner bg-canvas border border-border-subtle">
                <span className="text-slate-muted block">Predicted Comfort</span>
                <span className="text-lg font-bold text-thermal-comfort">20.8 h (86.7%)</span>
              </div>
            </div>

            <div className="p-4 rounded-inner bg-canvas border border-border-subtle text-xs space-y-1">
              <p className="font-semibold text-slate-ink">Optimization Rationale:</p>
              <p className="text-slate-muted leading-relaxed">
                Increasing wall straw-clay insulation beyond 140mm yields diminishing returns due to air infiltration dominance (0.6 ACH). Expanding south aperture to 5.2 m² captures an additional 1.8 kWh of diurnal direct solar gain without inducing summer overheating.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

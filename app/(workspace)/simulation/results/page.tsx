"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SimulationResultsPage() {
  const metrics = [
    { label: "Operative Temperature", value: "21.4°C", status: "COMFORT", variant: "comfort" as const, sub: "T_op Peak 23.6°C" },
    { label: "Adaptive Comfort Hours", value: "19.5 h", status: "81.3%", variant: "comfort" as const, sub: "ASHRAE 55 Target: ≥75%" },
    { label: "Total Heat Loss", value: "1.82 kW", status: "OPTIMIZED", variant: "default" as const, sub: "Envelope Conductance" },
    { label: "Solar Aperture Gain", value: "2.45 kW", status: "PEAK NOON", variant: "violet" as const, sub: "Passive Direct Gain" },
    { label: "Autonomy to 16°C", value: "14.2 h", status: "RESILIENT", variant: "comfort" as const, sub: "Thermal Storage Buffer" },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Simulation Results Dashboard
            </h1>
            <Badge variant="comfort">SOLVER CONVERGED</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            High-altitude transient simulation output: 24h temperature trajectories, heat flux dynamics, and comfort metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              Export Report
            </Button>
          </Link>
          <Link href="/compare">
            <Button variant="default" size="sm">
              Compare Baseline
            </Button>
          </Link>
        </div>
      </div>

      {/* 5-Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-5">
            <span className="text-xs font-medium text-slate-muted block mb-2">{m.label}</span>
            <p className="text-2xl font-bold tracking-tighter text-slate-ink">{m.value}</p>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant={m.variant}>{m.status}</Badge>
              <span className="text-[11px] text-slate-muted">{m.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Indoor vs Outdoor 24h Temperature</CardTitle>
            <CardDescription>Indoor operative temperature remains securely inside the 18–26°C comfort band.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 min-h-[280px] flex items-center justify-center bg-canvas rounded-inner">
            <div className="text-center p-6 space-y-2">
              <p className="text-sm font-semibold text-slate-ink">24-Hour Thermal Curve Overlay</p>
              <p className="text-xs text-slate-muted">
                Indoor Min: 18.2°C • Outdoor Min: -15.0°C • Diurnal Indoor Damping: 76.3%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Thermal State Segmentation</CardTitle>
            <CardDescription>24-hour distribution across Under-Comfort, Comfort, and Overheating thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-4">
            <div className="h-6 w-full rounded-pill bg-warm-fog overflow-hidden flex">
              <div className="bg-thermal-cold h-full" style={{ width: "18.7%" }} title="Under-comfort (4.5h)" />
              <div className="bg-thermal-comfort h-full" style={{ width: "81.3%" }} title="Comfort (19.5h)" />
            </div>
            <div className="flex justify-between text-xs text-slate-muted">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-pill bg-thermal-cold" />
                <span>Under-Comfort (&lt;18°C): 4.5 h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-pill bg-thermal-comfort" />
                <span>Comfort (18–26°C): 19.5 h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-pill bg-thermal-hot" />
                <span>Overheating (&gt;26°C): 0.0 h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deep-Dive Sub-Result Route Links */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm">Sub-Result Deep-Dive Dashboards</CardTitle>
          <CardDescription>Detailed analytical drill-downs for each physical domain.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Temperature", href: "/simulation/temperature", desc: "Surface & Air" },
            { label: "Heat Flow", href: "/simulation/heat-flow", desc: "Flux & Losses" },
            { label: "Solar Radiation", href: "/simulation/solar", desc: "GHI & Aperture" },
            { label: "Comfort Indices", href: "/simulation/comfort", desc: "PMV & PPD" },
            { label: "Thermal State", href: "/simulation/thermal-state", desc: "Duration & Range" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="p-3 rounded-inner bg-canvas border border-border-subtle hover:bg-surface hover:shadow-card transition-all flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-slate-ink">{item.label}</p>
                <p className="text-[11px] text-slate-muted">{item.desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-shop-violet" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

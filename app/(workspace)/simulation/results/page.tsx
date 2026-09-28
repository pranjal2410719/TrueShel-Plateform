"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Database, Play } from "lucide-react";
import { useSimulationStore } from "@/stores/simulation-store";
import { MultiDimensionalChart } from "@/components/MultiDimensionalChart";

export default function SimulationResultsPage() {
  const result = useSimulationStore((state) => state.result);

  const metrics = result
    ? [
        {
          label: "Operative Temperature",
          value: `${result.indoorTemperature[result.indoorTemperature.length - 1].toFixed(1)}°C`,
          // Status derived from the ACTUAL last-hour temperature against the
          // comfort band — previously the label could say DISCOMFORT while
          // wearing a green comfort badge.
          status:
            result.indoorTemperature[result.indoorTemperature.length - 1] >= 18 &&
            result.indoorTemperature[result.indoorTemperature.length - 1] <= 26
              ? "COMFORT"
              : result.indoorTemperature[result.indoorTemperature.length - 1] < 18
              ? "UNDER-COMFORT"
              : "OVERHEATING",
          variant:
            result.indoorTemperature[result.indoorTemperature.length - 1] >= 18 &&
            result.indoorTemperature[result.indoorTemperature.length - 1] <= 26
              ? ("comfort" as const)
              : ("error" as const),
          sub: `Peak ${Math.max(...result.indoorTemperature).toFixed(1)}°C`,
        },
        {
          label: "Adaptive Comfort Hours",
          value: `${result.comfort.comfortHours.toFixed(1)} h`,
          status: `${Math.round((result.comfort.comfortHours / result.timeline.length) * 100)}%`,
          variant:
            result.comfort.comfortRatio >= 0.75
              ? ("comfort" as const)
              : result.comfort.comfortRatio >= 0.5
              ? ("warn" as const)
              : ("error" as const),
          sub: "ASHRAE 55 Target: ≥75%",
        },
        {
          label: "Total Heat Loss",
          // heatLoss is kW per hourly step; summing 24 steps gives kWh.
          value: `${result.heatLoss.reduce((a, b) => a + b, 0).toFixed(2)} kWh`,
          status: `${result.peakHeatLoss.toFixed(1)} kW peak`,
          variant: "default" as const,
          sub: "Envelope Conductance",
        },
        {
          label: "Solar Aperture Gain",
          // heatGain is the SHGC-weighed kW through the glazing (the raw
          // solarIrradiance array is W/m² and could not be summed as kW).
          value: `${result.heatGain.reduce((a, b) => a + b, 0).toFixed(2)} kWh`,
          status: `${result.peakSolarGain.toFixed(1)} kW peak`,
          variant: "violet" as const,
          sub: "Passive Direct Gain",
        },
        {
          label: "Autonomy to 16°C",
          value: `${result.autonomy.toFixed(1)} h`,
          status: result.autonomy >= 12 ? "RESILIENT" : result.autonomy >= 8 ? "AT RISK" : "CRITICAL",
          variant:
            result.autonomy >= 12
              ? ("comfort" as const)
              : result.autonomy >= 8
              ? ("warn" as const)
              : ("error" as const),
          sub: "Thermal Storage Buffer",
        },
      ]
    : [];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Simulation Results Dashboard
            </h1>
            {result ? (
              <Badge variant="comfort">SOLVER CONVERGED</Badge>
            ) : (
              <Badge variant="outline">NO RUN YET</Badge>
            )}
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

      {/* Empty state — previously an empty grid with a misleading
          "SOLVER CONVERGED" badge and hardcoded fallback numbers. */}
      {!result && (
        <Card className="p-8">
          <div className="text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-pill bg-warm-fog/60 flex items-center justify-center mx-auto">
              <Database className="w-6 h-6 text-slate-muted" />
            </div>
            <p className="text-sm font-semibold text-slate-ink">
              No simulation results yet
            </p>
            <p className="text-xs text-slate-muted">
              Run the transient solver to generate 24-hour temperature
              trajectories, heat flux dynamics, and comfort metrics for your
              current shelter design.
            </p>
            <Link href="/simulation/running">
              <Button size="sm">
                <Play className="w-4 h-4 mr-1.5 fill-surface text-surface" />
                Run Simulation
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 5-Metric Strip */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((m) => (
            <Card key={m.label} className="p-5">
              <span className="text-xs font-medium text-slate-muted block mb-2">{m.label}</span>
              <p className="text-2xl font-bold tracking-tighter text-slate-ink">{m.value}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge variant={m.variant}>{m.status}</Badge>
                <span className="text-[11px] text-slate-muted text-right">{m.sub}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Visualizers Grid */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle>Indoor vs Outdoor 24h Temperature</CardTitle>
              <CardDescription>
                {Math.min(...result.indoorTemperature) >= 18 && Math.max(...result.indoorTemperature) <= 26
                  ? "Indoor operative temperature stays inside the 18–26°C comfort band all day."
                  : `Indoor operative temperature ranges ${Math.min(...result.indoorTemperature).toFixed(1)}–${Math.max(...result.indoorTemperature).toFixed(1)}°C against the 18–26°C comfort band.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2 min-h-[280px]">
              <MultiDimensionalChart />
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle>Thermal State Segmentation</CardTitle>
              <CardDescription>24-hour distribution across Under-Comfort, Comfort, and Overheating thresholds.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2 space-y-4">
              <div className="h-6 w-full rounded-pill bg-warm-fog overflow-hidden flex">
                <div className="bg-thermal-cold h-full" style={{ width: `${((result.comfort.underComfortHours / result.timeline.length) * 100).toFixed(1)}%` }} title="Under-comfort" />
                <div className="bg-thermal-comfort h-full" style={{ width: `${((result.comfort.comfortHours / result.timeline.length) * 100).toFixed(1)}%` }} title="Comfort" />
                <div className="bg-thermal-hot h-full" style={{ width: `${((result.comfort.overheatingHours / result.timeline.length) * 100).toFixed(1)}%` }} title="Overheating" />
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-muted">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-pill bg-thermal-cold" />
                  <span>Under-Comfort (&lt;18°C): {result.comfort.underComfortHours.toFixed(1)} h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-pill bg-thermal-comfort" />
                  <span>Comfort (18–26°C): {result.comfort.comfortHours.toFixed(1)} h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-pill bg-thermal-hot" />
                  <span>Overheating (&gt;26°C): {result.comfort.overheatingHours.toFixed(1)} h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

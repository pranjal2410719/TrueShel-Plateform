"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Thermometer,
  Clock,
  Flame,
  Sun,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Box,
  MapPin,
  Mountain,
  Package,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation, useClimate, useSupplies } from "@/stores/onboarding-store";
import { useSimulationStore } from "@/stores/simulation-store";

// ── Helpers ─────────────────────────────────────────────────────────────────
function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const location = useLocation();
  const climate = useClimate();
  const supplies = useSupplies();
  const result = useSimulationStore((s) => s.result);

  // ── Derive display values from real onboarding + simulation data ───────────
  const indoorTemp = useMemo(() => {
    if (result?.indoorTemperature?.length) {
      const mid = Math.round(result.indoorTemperature.length / 2);
      return result.indoorTemperature[mid].toFixed(1);
    }
    return "—";
  }, [result]);

  const comfortHours = result?.comfort?.comfortHours ?? "—";
  const peakHeatLoss = result?.peakHeatLoss?.toFixed(2) ?? "—";
  const peakSolarGain = result?.peakSolarGain?.toFixed(2) ?? "—";
  const autonomy = result?.autonomy?.toFixed(1) ?? "—";

  const currentState = useMemo(() => {
    if (!result?.thermalStates?.length) return "COMFORT";
    const mid = Math.round(result.thermalStates.length / 2);
    const state = result.thermalStates[mid];
    if (state === "overheating") return "OVERHEATING";
    if (state === "under-comfort") return "UNDER-COMFORT";
    return "COMFORT";
  }, [result]);

  const stateBadgeVariant = useMemo(() => {
    if (currentState === "OVERHEATING") return "error" as const;
    if (currentState === "UNDER-COMFORT") return "secondary" as const;
    return "comfort" as const;
  }, [currentState]);

  const outdoorAvg = useMemo(() => {
    if (climate?.hourlyTemperature?.length) return mean(climate.hourlyTemperature).toFixed(1);
    return "—";
  }, [climate]);

  const solarPeak = useMemo(() => {
    if (climate?.hourlySolarIrradiance?.length) return Math.max(...climate.hourlySolarIrradiance);
    return "—";
  }, [climate]);

  const metrics = [
    {
      label: "Indoor Operative Temp",
      value: `${indoorTemp}°C`,
      unit: "T_op",
      status: currentState,
      variant: stateBadgeVariant,
      trend: `Outdoor avg ${outdoorAvg}°C`,
      icon: Thermometer,
    },
    {
      label: "Comfort Duration",
      value: `${comfortHours} h`,
      unit: "of 24h",
      status: result ? `${Math.round(((result.comfort?.comfortHours ?? 0) / 24) * 100)}%` : "—",
      variant: "comfort" as const,
      trend: "Per simulation run",
      icon: Clock,
    },
    {
      label: "Peak Heat Loss",
      value: `${peakHeatLoss} kW`,
      unit: "q_loss",
      status: `${climate?.altitude ?? "—"}m AMSL`,
      variant: "default" as const,
      trend: result ? `Roof ${result.heatFlowBreakdown?.roof ?? 0}%` : "—",
      icon: Flame,
    },
    {
      label: "Solar Aperture Gain",
      value: `${peakSolarGain} kW`,
      unit: "q_solar",
      status: "PEAK 12:00",
      variant: "violet" as const,
      trend: `${solarPeak} W/m² peak`,
      icon: Sun,
    },
    {
      label: "Passive Autonomy",
      value: `${autonomy} h`,
      unit: "to 16°C",
      status: (result?.autonomy ?? 0) > 10 ? "RESILIENT" : "AT RISK",
      variant: (result?.autonomy ?? 0) > 10 ? ("comfort" as const) : ("error" as const),
      trend: `Risk: ${result?.risk ?? "—"}`,
      icon: ShieldCheck,
    },
  ];

  // ── Heat loss breakdown from real sim result ───────────────────────────────
  const heatLossItems = result?.heatFlowBreakdown
    ? [
        { name: "Roof Assembly", pct: result.heatFlowBreakdown.roof },
        { name: "Air Infiltration", pct: result.heatFlowBreakdown.infiltration },
        { name: "Walls", pct: result.heatFlowBreakdown.walls },
        { name: "Glazing / Windows", pct: result.heatFlowBreakdown.windows },
        { name: "Ground Slab", pct: result.heatFlowBreakdown.floor },
      ]
    : [];

  // ── Insights derived from supplies ────────────────────────────────────────
  const supplyInsights = useMemo(() => {
    const insights: { title: string; desc: string }[] = [];
    const supplyNames = supplies.map((s) => s.name.toLowerCase());

    if (supplyNames.some((n) => n.includes("insulation"))) {
      insights.push({
        title: "Insulation Blankets Available",
        desc: "Your insulation blankets can line inner walls — reducing conductive heat loss by up to 20%.",
      });
    }
    if (supplyNames.some((n) => n.includes("wood") || n.includes("logs"))) {
      insights.push({
        title: "Wood Logs Present",
        desc: "Timber framing is viable. Wood has k=0.14 W/m·K — a strong thermal barrier for wall frames.",
      });
    }
    if (supplyNames.some((n) => n.includes("stone") || n.includes("rock"))) {
      insights.push({
        title: "Stone Mass Available",
        desc: "Stones can act as thermal mass. At high altitude, they absorb daytime solar gain and release heat overnight.",
      });
    }
    if (supplyNames.some((n) => n.includes("tarp") || n.includes("polyethylene"))) {
      insights.push({
        title: "Tarp for Vapour Barrier",
        desc: "A polyethylene sheet as a vapour barrier can cut infiltration losses — critical in high-wind sites.",
      });
    }
    if (insights.length === 0) {
      insights.push(
        { title: "Roof Dominates Heat Loss", desc: `${result?.heatFlowBreakdown?.roof ?? 41}% of total heat loss exits through the roof assembly. Consider adding insulation here first.` },
        { title: "High Altitude Air Density", desc: "At 3,500m (65 kPa), air density is 0.88 kg/m³ — infiltration mass flow is 27% lower than sea level, which partially offsets heat loss." }
      );
    }
    return insights.slice(0, 3);
  }, [supplies, result]);

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-ink">
              Dashboard &amp; Telemetry
            </h1>
            <Badge variant={stateBadgeVariant}>{currentState}</Badge>
          </div>

          {/* Live location + climate summary strip */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-muted">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location.latitude.toFixed(3)}°, {location.longitude.toFixed(3)}°
              </span>
            )}
            {climate && (
              <>
                <span className="flex items-center gap-1">
                  <Mountain className="w-3 h-3" />
                  {climate.altitude}m AMSL
                </span>
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  Outdoor avg {outdoorAvg}°C
                </span>
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3" />
                  Peak solar {solarPeak} W/m²
                </span>
              </>
            )}
            {supplies.length > 0 && (
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {supplies.length} supplies loaded
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/simulation/results">
            <Button variant="outline" size="sm">Full Results</Button>
          </Link>
          <Link href="/thermal-twin">
            <Button variant="default" size="sm">
              <Box className="w-4 h-4 mr-1.5" />
              Open 3D Twin
            </Button>
          </Link>
        </div>
      </div>

      {/* 5-Metric Strip */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-4 sm:p-5 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-medium text-slate-muted leading-tight pr-2">
                  {metric.label}
                </span>
                <Icon className="w-4 h-4 text-slate-muted shrink-0" />
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xl sm:text-2xl font-bold tracking-tighter text-slate-ink">
                    {metric.value}
                  </span>
                  <span className="text-xs font-normal text-slate-muted">{metric.unit}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
                  <Badge variant={metric.variant}>{metric.status}</Badge>
                  <span className="text-[11px] text-slate-muted flex items-center gap-0.5 shrink-0">
                    <TrendingUp className="w-3 h-3 text-shop-violet" />
                    {metric.trend}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Analysis Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 24-Hour Thermal Curve Card */}
        <Card className="lg:col-span-2 p-5 sm:p-6 flex flex-col">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <CardTitle className="text-base">24-Hour Thermal Response</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Indoor vs outdoor temperature · Comfort band 18–26°C
                  {climate && ` · Altitude ${climate.altitude}m`}
                </CardDescription>
              </div>
              <Badge variant="violet">SOLVER CONVERGED</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2 flex-1 min-h-[260px] sm:min-h-[300px] bg-canvas rounded-inner overflow-hidden">
            {result ? (
              <div className="w-full h-full flex flex-col p-4 gap-2">
                {/* Lightweight SVG chart (no external dependency needed for the bar) */}
                <div className="flex-1 relative">
                  <svg viewBox="0 0 480 200" className="w-full h-full" preserveAspectRatio="none">
                    {/* Comfort band 18–26°C — map to SVG coords */}
                    <defs>
                      <linearGradient id="comfortGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-thermal-comfort)" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="var(--color-thermal-comfort)" stopOpacity="0.04" />
                      </linearGradient>
                    </defs>
                    {/* Comfort band */}
                    <rect x="0" y="40" width="480" height="67" fill="url(#comfortGrad)" />
                    {/* Outdoor temperature line */}
                    <polyline
                      fill="none"
                      stroke="var(--color-slate-subtle)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      points={result.outdoorTemperature.map((t, i) => {
                        const x = (i / 23) * 480;
                        const y = 100 - (t / 40) * 80; // rough scale
                        return `${x},${y}`;
                      }).join(" ")}
                    />
                    {/* Indoor temperature line */}
                    <polyline
                      fill="none"
                      stroke="var(--color-shop-violet)"
                      strokeWidth="2"
                      points={result.indoorTemperature.map((t, i) => {
                        const x = (i / 23) * 480;
                        const y = 100 - (t / 40) * 80;
                        return `${x},${y}`;
                      }).join(" ")}
                    />
                  </svg>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 text-[11px] text-slate-muted px-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-0.5 bg-shop-violet inline-block" /> Indoor
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-0.5 bg-slate-300 inline-block border-dashed border-t" /> Outdoor
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-3 rounded-sm bg-thermal-comfort/20 border border-thermal-comfort/30 inline-block" /> Comfort 18–26°C
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-xs text-slate-muted">Run a simulation to see the thermal curve.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3D Thermal Twin Embed Card */}
        <Card className="p-5 sm:p-6 flex flex-col">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Procedural 3D Twin</CardTitle>
                <CardDescription className="text-xs mt-1">Live thermal surface mapping.</CardDescription>
              </div>
              <Link href="/thermal-twin" aria-label="Open full 3D Twin" className="text-shop-violet hover:text-shop-violet-hover transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2 flex-1 min-h-[200px] sm:min-h-[260px] flex flex-col items-center justify-center gap-3 bg-canvas rounded-inner">
            <Box className="w-10 h-10 text-shop-violet" />
            <div className="text-center space-y-1 px-4">
              <p className="text-sm font-semibold text-slate-ink">Physics-Linked Digital Twin</p>
              <p className="text-xs text-slate-muted">4 Walls · Gabled Roof · South Glazing</p>
              {result && (
                <Badge variant={stateBadgeVariant} className="mt-1">
                  {currentState} at midday
                </Badge>
              )}
            </div>
            <Link href="/thermal-twin">
              <Button size="sm" variant="outline" className="mt-1">Launch Twin</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Heat Loss Breakdown & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Heat Loss Bars */}
        <Card className="p-5 sm:p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base">Heat Loss by Assembly</CardTitle>
            <CardDescription className="text-xs mt-1">
              ISO 6946 conductive transmission{climate ? ` · ${climate.altitude}m ASL` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-3">
            {heatLossItems.length > 0 ? heatLossItems.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-ink">{item.name}</span>
                  <span className="text-slate-muted shrink-0 ml-2">{item.pct}%</span>
                </div>
                <div className="h-2 w-full rounded-pill bg-warm-fog overflow-hidden">
                  <div
                    className="h-full bg-shop-violet rounded-pill transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-muted">Run a simulation to see heat loss breakdown.</p>
            )}
          </CardContent>
        </Card>

        {/* Supply-derived & simulation-derived insights */}
        <Card className="p-5 sm:p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base">Engineering Insights</CardTitle>
            <CardDescription className="text-xs mt-1">
              {supplies.length > 0
                ? `Based on your ${supplies.length} supplies and simulation results.`
                : "Derived from simulation results."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-3">
            {supplyInsights.map((insight, idx) => (
              <div key={idx} className="p-3 sm:p-3.5 rounded-inner bg-canvas border border-border-subtle">
                <p className="text-xs font-semibold text-slate-ink">{insight.title}</p>
                <p className="text-[11px] text-slate-muted mt-1 leading-relaxed">{insight.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Supplies Summary Strip */}
      {supplies.length > 0 && (
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <Package className="w-4 h-4 text-shop-violet" />
              <span className="text-sm font-semibold text-slate-ink">Your Supplies</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {supplies.map((s) => (
                <Badge key={s.name} variant="secondary">
                  {s.name}
                  {s.quantity > 0 && (
                    <span className="ml-1 text-slate-muted">×{s.quantity}</span>
                  )}
                </Badge>
              ))}
            </div>
            <Link href="/onboarding" className="ml-auto shrink-0">
              <Button variant="ghost" size="sm" className="text-xs">
                Edit Supplies
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

/*
 * app/(workspace)/resilience/page.tsx – Resilience page using real simulation results.
 */

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  Snowflake,
  Wind,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComparisonStore } from "@/stores/comparison-store";
import { useShelterStore } from "@/stores/shelter-store";
import { evaluateShelterDesign } from "@/lib/calculations/evaluateDesign";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/** Helper to format numbers */
function fmt(num: number, unit: string) {
  return `${num.toFixed(2)} ${unit}`;
}

export default function ResiliencePage() {
  const currentDesign = useShelterStore((s) => s.design);
  const { resultA } = useComparisonStore(); // resultA corresponds to designA (initialized to currentDesign)

  // If no result yet, evaluate on the fly.
  const result = useMemo(() => {
    if (resultA) return resultA;
    return evaluateShelterDesign(currentDesign);
  }, [resultA, currentDesign]);

  // Prepare chart data for indoor temperature decay (last part of timeline).
  const chartData = useMemo(() => {
    const labels = result.timeline.map((t) => `${t}h`);
    return {
      labels,
      datasets: [
        {
          label: "Indoor Temp (°C)",
          data: result.indoorTemperature,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.2,
        },
        {
          label: "Outdoor Temp (°C)",
          data: result.outdoorTemperature,
          borderColor: "rgb(255, 99, 132)",
          tension: 0.2,
        },
      ],
    };
  }, [result]);

  const options = useMemo(() => ({
    responsive: true,
    plugins: { legend: { position: "top" as const }, title: { display: false } },
    scales: { y: { title: { display: true, text: "Temperature (°C)" } } },
  }), []);

  const resilienceStats = [
    {
      label: "Thermal Autonomy",
      value: fmt(result.autonomy, "h"),
      sub: `Decay to 16°C (${fmt(result.autonomy, "h")} hrs)`,
      variant: "comfort" as const,
      icon: Clock,
    },
    {
      label: "Freeze‑Thaw Risk",
      value: result.risk.toUpperCase(),
      sub: "28 Annual Cycles",
      variant: "warn" as const,
      icon: Snowflake,
    },
    {
      label: "Wind Exposure",
      value: "LOW",
      sub: "NW Shielded Entry",
      variant: "comfort" as const,
      icon: Wind,
    },
    {
      label: "Envelope Degradation",
      value: fmt(result.peakHeatLoss, "kW"),
      sub: "Peak Heat Loss",
      variant: "default" as const,
      icon: TrendingDown,
    },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">Resilience & Autonomy Command Center</h1>
            <Badge variant="violet">SURVIVABILITY ANALYSIS</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            Evaluation of thermal survivability during extended heating blackout, freeze‑thaw risks, and long‑term envelope degradation.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resilienceStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-muted">{stat.label}</span>
                <Icon className="w-4 h-4 text-slate-muted" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tighter text-slate-ink">{stat.value}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={stat.variant}>{stat.sub}</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Temperature Decay Chart */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blackout Temperature Decay</CardTitle>
              <CardDescription>Indoor temperature versus time during a heating outage.</CardDescription>
            </div>
            <Badge variant="comfort">Autonomy: {fmt(result.autonomy, "h")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-2 min-h-[260px]">
          <Line data={chartData} options={options} />
        </CardContent>
      </Card>

      {/* Deep‑Dive Sub‑Pages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Autonomy Decay", href: "/resilience/autonomy", desc: "Thermal flywheel decay to 16°C" },
          { label: "Climate Risk Matrix", href: "/resilience/climate-risk", desc: "Sub‑zero multi‑hazard exposure" },
          { label: "20‑Year Degradation", href: "/resilience/degradation", desc: "Moisture & seal infiltration aging" },
          { label: "Failure Intelligence", href: "/resilience/failure-intelligence", desc: "Cold‑climate failure database" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-4 rounded-card bg-surface shadow-card hover:bg-surface-hover transition-all flex flex-col justify-between"
          >
            <div>
              <p className="font-semibold text-xs text-slate-ink">{item.label}</p>
              <p className="text-[11px] text-slate-muted mt-1">{item.desc}</p>
            </div>
            <div className="mt-3 flex items-center text-xs text-shop-violet font-medium">
              <span>Inspect</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

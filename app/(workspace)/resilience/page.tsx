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

function fmt(num: number, unit: string) {
  return `${num.toFixed(2)} ${unit}`;
}

const INDOOR_TEMP = [-3, -3.5, -4, -4.5, -5, -4.5, -3.5, -2, -0.5, 1, 3, 5.5, 8, 11, 14, 17, 19.5, 21, 22, 21.5, 20, 17.5, 14.5, 11];
const OUTDOOR_TEMP = [-8, -9, -10, -11, -12, -11.5, -10, -8, -6, -3, 0, 3, 5, 6, 5.5, 4, 2, 0, -2, -4, -6, -8, -8, -8];

export default function ResiliencePage() {
  const currentDesign = useShelterStore((s) => s.design);
  const { resultA } = useComparisonStore();

  const result = useMemo(() => {
    if (resultA) return resultA;
    return evaluateShelterDesign(currentDesign);
  }, [resultA, currentDesign]);

  const chart = useMemo(() => {
    const W = 1000;
    const H = 300;
    const PAD_LEFT = 50;
    const PAD_RIGHT = 20;
    const PAD_TOP = 20;
    const PAD_BOTTOM = 40;

    const yMin = -10;
    const yMax = 25;
    const ySpan = yMax - yMin;

    const plotW = W - PAD_LEFT - PAD_RIGHT;
    const plotH = H - PAD_TOP - PAD_BOTTOM;

    const scaleY = (t: number) => PAD_TOP + ((yMax - t) / ySpan) * plotH;
    const scaleX = (i: number) => PAD_LEFT + (i / 23) * plotW;

    const linePoints = (arr: number[]) =>
      arr.map((t, i) => `${scaleX(i).toFixed(1)},${scaleY(t).toFixed(1)}`).join(" ");

    const yTicks = [-10, -5, 0, 5, 10, 15, 20, 25];
    const xTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

    return {
      W, H, PAD_LEFT, PAD_RIGHT, PAD_TOP, PAD_BOTTOM, plotW, plotH,
      indoorPoints: linePoints(INDOOR_TEMP),
      outdoorPoints: linePoints(OUTDOOR_TEMP),
      yTicks: yTicks.map((t) => ({ t, y: scaleY(t) })),
      xTicks: xTicks.map((i) => ({ i, x: scaleX(i) })),
      gridLeft: PAD_LEFT,
      gridRight: PAD_LEFT + plotW,
    };
  }, []);

  const riskVariant =
    result.risk === "low"
      ? ("comfort" as const)
      : result.risk === "moderate"
      ? ("warn" as const)
      : ("error" as const);

  const resilienceStats = [
    {
      label: "Thermal Autonomy",
      value: fmt(result.autonomy, "h"),
      sub: "Decay to 16°C threshold",
      variant: "comfort" as const,
      icon: Clock,
    },
    {
      label: "Freeze-Thaw Risk",
      value: result.risk.toUpperCase(),
      sub: "28 Annual Cycles",
      variant: riskVariant,
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Resilience &amp; Autonomy Command Center
            </h1>
            <Badge variant="violet">SURVIVABILITY ANALYSIS</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted max-w-2xl">
            Evaluation of thermal survivability during extended heating blackout, freeze-thaw risks, and long-term envelope degradation.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] font-medium text-slate-muted uppercase tracking-wider">System posture</span>
          <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-medium bg-thermal-comfort-subtle text-thermal-comfort border border-thermal-comfort-border">
            Monitoring
          </span>
        </div>
      </div>

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
                <div className="mt-2">
                  <Badge variant={stat.variant}>{stat.sub}</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Blackout Temperature Decay</CardTitle>
              <CardDescription>Indoor temperature versus time during a heating outage.</CardDescription>
            </div>
            <Badge variant="comfort">Autonomy: {fmt(result.autonomy, "h")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="flex gap-4">
            <div className="shrink-0 w-[180px] rounded-inner bg-warm-fog/50 p-4 flex flex-col gap-4 text-xs text-slate-muted">
              <span className="font-semibold text-slate-ink uppercase tracking-wide text-[11px]">Temperature profile</span>
              <div className="flex items-center gap-2">
                <span className="w-8 h-0.5 bg-shop-violet inline-block" />
                <span>Indoor Temp (&deg;C)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 border-t-2 border-dashed border-slate-muted inline-block" />
                <span>Outdoor Temp (&deg;C)</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <svg
                viewBox={`0 0 ${chart.W} ${chart.H}`}
                className="w-full h-[280px]"
                role="img"
                aria-label="Blackout temperature decay chart showing indoor and outdoor temperature over 24 hours"
              >
                {chart.yTicks.map(({ t, y }) => (
                  <g key={`y-${t}`}>
                    <line
                      x1={chart.gridLeft}
                      x2={chart.gridRight}
                      y1={y}
                      y2={y}
                      stroke="var(--color-border-subtle)"
                      strokeWidth="1"
                    />
                    <text
                      x={chart.gridLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="var(--color-slate-muted)"
                    >
                      {t}
                    </text>
                  </g>
                ))}
                {chart.xTicks.map(({ i, x }) => (
                  <g key={`x-${i}`}>
                    <line
                      x1={x}
                      x2={x}
                      y1={chart.PAD_TOP}
                      y2={chart.PAD_TOP + chart.plotH}
                      stroke="var(--color-border-subtle)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={x}
                      y={chart.H - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="var(--color-slate-muted)"
                    >
                      {i}h
                    </text>
                  </g>
                ))}
                <polyline
                  fill="none"
                  stroke="var(--color-shop-violet)"
                  strokeWidth="3"
                  points={chart.outdoorPoints}
                  strokeDasharray="7 5"
                />
                <polyline
                  fill="none"
                  stroke="var(--color-slate-muted)"
                  strokeWidth="3"
                  points={chart.outdoorPoints}
                  strokeDasharray="7 5"
                />
                <text
                  x={18}
                  y={chart.H / 2}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-slate-muted)"
                  transform={`rotate(-90 18 ${chart.H / 2})`}
                >
                  Temperature (&deg;C)
                </text>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Autonomy Decay", href: "/resilience/autonomy", desc: "Thermal flywheel decay to 16°C" },
          { label: "Climate Risk Matrix", href: "/resilience/climate-risk", desc: "Sub-zero multi-hazard exposure" },
          { label: "20-Year Degradation", href: "/resilience/degradation", desc: "Moisture & seal infiltration aging" },
          { label: "Failure Intelligence", href: "/resilience/failure-intelligence", desc: "Cold-climate failure database" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-5 rounded-card bg-surface shadow-card border border-border-subtle hover:bg-surface-hover transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <p className="font-semibold text-sm text-slate-ink">{item.label}</p>
              <p className="text-xs text-slate-muted mt-1">{item.desc}</p>
            </div>
            <div className="mt-4 flex items-center text-sm text-shop-violet font-medium">
              <span>Inspect</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

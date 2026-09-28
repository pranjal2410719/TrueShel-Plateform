/*
 * app/(workspace)/compare/page.tsx – Dynamic comparison page using real simulation results.
 */

"use client";

import React, { useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComparisonStore } from "@/stores/comparison-store";
import { useShelterStore } from "@/stores/shelter-store";
import ShelterModel from "@/components/visualization/ShelterModel";

/** Helper to format numbers with appropriate units */
function fmt(value: number, unit: string) {
  return `${value.toFixed(2)} ${unit}`;
}

/** Helper to format a delta with an explicit +/- sign */
function fmtDelta(value: number, unit: string) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} ${unit}`;
}

/** Risk severity rank — lower is safer. Used instead of lexical string
 *  comparison, which wrongly ranked "high" risk below "low" (h < l). */
const RISK_RANK: Record<string, number> = { low: 0, moderate: 1, high: 2, critical: 3 };

export default function ComparePage() {
  const {
    designA,
    designB,
    resultA,
    resultB,
    setDesignA,
    setDesignB,
  } = useComparisonStore();

  // Initialise designs from the shelter store on first render if not set.
  const currentDesign = useShelterStore((s) => s.design);
  useEffect(() => {
    if (!designA) setDesignA(currentDesign);
    if (!designB) setDesignB(currentDesign);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard against missing simulation results.
  if (!resultA || !resultB) {
    return (
      <div className="p-8 text-slate-muted">Loading simulation results…</div>
    );
  }

  // Build comparison rows from actual SimulationResult data.
  // Deltas are always (A − B) with a +/- sign; the verdict is computed from
  // direction-aware rules (higher is better vs lower is better).
  const comparisonRows = [
    {
      param: "Comfort Hours",
      designA: fmt(resultA.comfort.comfortHours, "h"),
      designB: fmt(resultB.comfort.comfortHours, "h"),
      delta: fmtDelta(resultA.comfort.comfortHours - resultB.comfort.comfortHours, "h"),
      positive: resultA.comfort.comfortHours >= resultB.comfort.comfortHours,
    },
    {
      param: "Peak Heat Loss",
      designA: fmt(resultA.peakHeatLoss, "kW"),
      designB: fmt(resultB.peakHeatLoss, "kW"),
      // Negative delta = A loses less heat = A wins.
      delta: fmtDelta(resultA.peakHeatLoss - resultB.peakHeatLoss, "kW"),
      positive: resultA.peakHeatLoss <= resultB.peakHeatLoss,
    },
    {
      param: "Autonomy (to 16°C)",
      designA: fmt(resultA.autonomy, "h"),
      designB: fmt(resultB.autonomy, "h"),
      delta: fmtDelta(resultA.autonomy - resultB.autonomy, "h"),
      positive: resultA.autonomy >= resultB.autonomy,
    },
    {
      param: "Risk Level",
      designA: resultA.risk,
      designB: resultB.risk,
      delta:
        resultA.risk === resultB.risk
          ? "equal"
          : RISK_RANK[resultA.risk] < RISK_RANK[resultB.risk]
          ? "A safer"
          : "B safer",
      positive: RISK_RANK[resultA.risk] <= RISK_RANK[resultB.risk],
    },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Design Comparison & Trade‑Off Analysis
            </h1>
            <Badge variant="violet">DESIGN A vs DESIGN B</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            Side‑by‑side engineering evaluation between two shelter designs.
          </p>
        </div>
</div>

      {/* 3D Model Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
        <div className="border rounded-inner overflow-hidden flex flex-col min-h-0">
          <h2 className="text-sm font-medium text-slate-ink p-2 bg-canvas shrink-0">Design A</h2>
          <div className="flex-1 min-h-0">
            {designA && <ShelterModel design={designA} mode="normal" />}
          </div>
        </div>
        <div className="border rounded-inner overflow-hidden flex flex-col min-h-0">
          <h2 className="text-sm font-medium text-slate-ink p-2 bg-canvas shrink-0">Design B</h2>
          <div className="flex-1 min-h-0">
            {designB && <ShelterModel design={designB} mode="normal" />}
          </div>
        </div>
      </div>

      {/* KPI Cards - Stacked vertically on all screens */}
      <div className="grid grid-cols-1 gap-4">
        {/* Comfort */}
        <Card className="p-5">
          <span className="text-xs font-medium text-slate-muted block mb-1">
            Comfort Differential (&Delta;)
          </span>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink">
            {comparisonRows[0].delta}
          </p>
          <span className="text-xs text-thermal-comfort flex items-center mt-1">
            {comparisonRows[0].positive ? (
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
            )}
            {comparisonRows[0].delta} comfort hours
          </span>
        </Card>
        {/* Heat Loss */}
        <Card className="p-5">
          <span className="text-xs font-medium text-slate-muted block mb-1">
            Heat Loss Reduction (&Delta;)
          </span>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink">
            {comparisonRows[1].delta}
          </p>
          <span className="text-xs text-thermal-comfort flex items-center mt-1">
            {comparisonRows[1].positive ? (
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
            )}
            {comparisonRows[1].delta} peak heat loss (A &minus; B)
          </span>
        </Card>
        {/* Autonomy */}
        <Card className="p-5">
          <span className="text-xs font-medium text-slate-muted block mb-1">
            Autonomy Extension (&Delta;)
          </span>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink">
            {comparisonRows[2].delta}
          </p>
          <span className="text-xs text-thermal-comfort flex items-center mt-1">
            {comparisonRows[2].positive ? (
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
            )}
            {comparisonRows[2].delta} autonomy hours
          </span>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <CardTitle>Parameter & Output Delta Matrix</CardTitle>
          <CardDescription>
            Direct comparative inspection across thermodynamic properties.
          </CardDescription>
        </div>
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[600px] border-collapse text-xs">
            <thead>
              <tr className="border-y border-border-subtle bg-canvas text-slate-muted">
                <th className="py-3 px-6 text-left font-semibold">Parameter / Metric</th>
                <th className="py-3 px-6 text-left font-semibold">Design A</th>
                <th className="py-3 px-6 text-left font-semibold">Design B</th>
                <th className="py-3 px-6 text-left font-semibold">Variance (Δ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {comparisonRows.map((row) => (
                <tr key={row.param} className="hover:bg-canvas/50 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-ink">{row.param}</td>
                  <td className="py-3.5 px-6 text-slate-ink font-semibold">{row.designA}</td>
                  <td className="py-3.5 px-6 text-slate-muted">{row.designB}</td>
                  <td className="py-3.5 px-6">
                    <Badge variant={row.positive ? "comfort" : "default"}>{row.delta}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

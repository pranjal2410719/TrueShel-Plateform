/*
 * app/(workspace)/compare/page.tsx – Dynamic comparison page using real simulation results.
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComparisonStore } from "@/stores/comparison-store";
import { useShelterStore } from "@/stores/shelter-store";
import { CLIMATE_ZONES } from "@/lib/mock/repository";
import { CLIMATE_ZONE_LABELS, deriveGeometryFromClimate } from "@/lib/calculations/climateAdaptation";
import type { ClimateZone, ShelterDesign } from "@/types";
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

  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStage, setBuildStage] = useState(0);
  const [selectedZone, setSelectedZone] = useState<ClimateZone>("high-altitude-cold");

  const currentDesign = useShelterStore((s) => s.design);

  useEffect(() => {
    if (!designA) setDesignA(currentDesign);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (designB) return;
    const climate = CLIMATE_ZONES[selectedZone];
    if (!climate) return;
    const adaptation = deriveGeometryFromClimate(climate);
    const wallArea = 2 * (adaptation.geometry.length + adaptation.geometry.width) * adaptation.geometry.height;
    const windowArea = adaptation.openings.windowToWallRatio * wallArea;
    const designBVariant: ShelterDesign = {
      ...currentDesign,
      id: "design-b-climate",
      name: `Climate-Adapted (${CLIMATE_ZONE_LABELS[selectedZone]})`,
      geometry: adaptation.geometry,
      openings: {
        ...currentDesign.openings,
        windowArea,
        windowCount: adaptation.openings.windowCount,
        windowOrientation: adaptation.openings.windowOrientation,
      },
      thermalMass: {
        ...currentDesign.thermalMass,
        level: adaptation.thermalMass.level,
      },
      shadingEnabled: adaptation.shading.enabled,
    };
    setDesignB(designBVariant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone]);

  useEffect(() => {
    const duration = 2200;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setBuildProgress(progress);
      if (progress < 0.18) setBuildStage(0);
      else if (progress < 0.48) setBuildStage(1);
      else if (progress < 0.7) setBuildStage(2);
      else if (progress < 0.9) setBuildStage(3);
      else setBuildStage(4);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleZoneChange = useCallback((zone: ClimateZone) => {
    setSelectedZone(zone);
    setBuildProgress(0);
    setBuildStage(0);
  }, []);

  // Build comparison rows from actual SimulationResult data.
  // Deltas are always (A − B) with a +/- sign; the verdict is computed from
  // direction-aware rules (higher is better vs lower is better).
  if (!resultA || !resultB) {
    return (
      <div className="p-8 text-slate-muted">Loading simulation results…</div>
    );
  }

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
        <div className="flex items-center gap-2">
          <label htmlFor="climate-zone" className="text-xs font-medium text-slate-muted">
            Climate Zone
          </label>
          <select
            id="climate-zone"
            value={selectedZone}
            onChange={(e) => handleZoneChange(e.target.value as ClimateZone)}
            className="px-3 py-1.5 rounded-inner border border-border-subtle bg-surface text-xs text-slate-ink focus:outline-none focus:ring-2 focus:ring-shop-violet-subtle"
          >
            {Object.entries(CLIMATE_ZONE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3D Model Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
        <div className="border rounded-inner overflow-hidden flex flex-col min-h-0">
          <h2 className="text-sm font-medium text-slate-ink p-2 bg-canvas shrink-0">Design A</h2>
          <div className="flex-1 min-h-0 relative">
            {designA && <ShelterModel design={designA} mode="normal" buildProgress={buildProgress} />}
            {buildProgress < 1 && (
              <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="w-48 h-1.5 bg-warm-fog rounded-pill overflow-hidden">
                  <div
                    className="h-full bg-shop-violet rounded-pill transition-all duration-150"
                    style={{ width: `${buildProgress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-muted">
                  {buildStage === 0 && "Pouring foundation slab..."}
                  {buildStage === 1 && "Raising wall assemblies..."}
                  {buildStage === 2 && "Setting roof structure..."}
                  {buildStage === 3 && "Installing glazing & apertures..."}
                  {buildStage === 4 && "Model ready"}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="border rounded-inner overflow-hidden flex flex-col min-h-0">
          <h2 className="text-sm font-medium text-slate-ink p-2 bg-canvas shrink-0">
            Design B — Climate-Adapted
          </h2>
          <div className="flex-1 min-h-0 relative">
            {designB && <ShelterModel design={designB} mode="normal" buildProgress={buildProgress} />}
            {buildProgress < 1 && (
              <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="w-48 h-1.5 bg-warm-fog rounded-pill overflow-hidden">
                  <div
                    className="h-full bg-shop-violet rounded-pill transition-all duration-150"
                    style={{ width: `${buildProgress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-muted">
                  {buildStage === 0 && "Pouring foundation slab..."}
                  {buildStage === 1 && "Raising wall assemblies..."}
                  {buildStage === 2 && "Setting roof structure..."}
                  {buildStage === 3 && "Installing glazing & apertures..."}
                  {buildStage === 4 && "Model ready"}
                </p>
              </div>
            )}
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

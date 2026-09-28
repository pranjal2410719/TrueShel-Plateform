"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Thermometer, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulationResult } from "@/stores/simulation-store";
import { FormulaCard } from "@/components/FormulaCard";
import { DrillDownTable } from "@/components/DrillDownTable";
import { classifyThermalState, getFormulaData } from "@/lib/calculations/formulas";
import { useShelterDesign } from "@/stores/shelter-store";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { tokenVar } from "@/lib/utils/tokens";

export default function SimulationThermalStatePage() {
  const result = useSimulationResult();
  const design = useShelterDesign();

  const formulaData = useMemo(() => {
    if (!result) return null;
    return getFormulaData(result, design, 3500);
  }, [result, design]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.indoorTemperature.map((t, i) => ({
      hour: i,
      temp: t,
      state: classifyThermalState(t),
    }));
  }, [result]);

  const stateSegments = useMemo(() => {
    if (!result) return [];
    const segments: { state: string; start: number; end: number; min: number; max: number; mean: number }[] = [];
    let currentState = result.thermalStates[0];
    let start = 0;
    for (let i = 1; i <= result.thermalStates.length; i++) {
      if (i === result.thermalStates.length || result.thermalStates[i] !== currentState) {
        const temps = result.indoorTemperature.slice(start, i);
        segments.push({
          state: currentState,
          start,
          end: i - 1,
          min: Math.min(...temps),
          max: Math.max(...temps),
          mean: temps.reduce((a, b) => a + b, 0) / temps.length,
        });
        if (i < result.thermalStates.length) {
          currentState = result.thermalStates[i];
          start = i;
        }
      }
    }
    return segments;
  }, [result]);

  const drillDownData = useMemo(() => {
    if (!result) return [];
    return result.indoorTemperature.map((t, i) => ({
      hour: `${i}h`,
      temp: `${t.toFixed(1)}`,
      state: classifyThermalState(t),
    }));
  }, [result]);

  if (!result || !formulaData) {
    return (
      <div className="p-8 text-slate-muted">Run a simulation first to see thermal state analysis.</div>
    );
  }

  const underComfortHours = result.comfort.underComfortHours;
  const comfortHours = result.comfort.comfortHours;
  const overheatingHours = result.comfort.overheatingHours;

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/simulation/results">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Thermal State Segmentation
            </h1>
            <Badge variant="violet">DURATION & RANGE</Badge>
          </div>
          <p className="text-xs text-slate-muted">
            Classification of each hour into under-comfort, comfort, or overheating states.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Under-Comfort</span>
            <AlertTriangle className="w-4 h-4 text-thermal-cold" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-thermal-cold mt-2">
            {underComfortHours.toFixed(1)} h
          </p>
          <p className="text-xs text-slate-muted mt-1">
            Below 18°C — heating required
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Optimal Comfort</span>
            <Thermometer className="w-4 h-4 text-thermal-comfort" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-thermal-comfort mt-2">
            {comfortHours.toFixed(1)} h
          </p>
          <p className="text-xs text-slate-muted mt-1">
            Within 18–26°C band
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Overheating</span>
            <AlertTriangle className="w-4 h-4 text-thermal-hot" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-thermal-hot mt-2">
            {overheatingHours.toFixed(1)} h
          </p>
          <p className="text-xs text-slate-muted mt-1">
            Above 26°C — cooling required
          </p>
        </Card>
      </div>

      <FormulaCard
        title="Thermal State Classification"
        formula="T < 18°C → under-comfort | 18°C ≤ T ≤ 26°C → comfort | T > 26°C → overheating"
        result={`${comfortHours.toFixed(1)}h comfort`}
        variables={{
          "Under-comfort": `${underComfortHours.toFixed(1)}h`,
          "Comfort": `${comfortHours.toFixed(1)}h`,
          "Overheating": `${overheatingHours.toFixed(1)}h`,
        }}
      />

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>24-Hour Thermal State Timeline</CardTitle>
          <p className="text-xs text-slate-muted mt-1">
            Indoor temperature with color-coded comfort state bands.
          </p>
        </CardHeader>
        <CardContent className="p-0 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tokenVar("warmFog")} />
              <XAxis dataKey="hour" label={{ value: "Hour", position: "insideBottomRight" }} />
              <YAxis label={{ value: "°C", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <ReferenceArea y1={18} y2={26} fill={tokenVar("thermalComfortSubtle")} fillOpacity={0.3} />
              <ReferenceArea y1={-20} y2={18} fill={tokenVar("thermalColdSubtle")} fillOpacity={0.2} />
              <ReferenceArea y1={26} y2={40} fill={tokenVar("thermalHotSubtle")} fillOpacity={0.2} />
              <Line type="monotone" dataKey="temp" stroke={tokenVar("shopViolet")} strokeWidth={2} dot={false} name="Indoor Temp (°C)" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <CardTitle className="text-base">State Segments</CardTitle>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-xs">
            <thead>
              <tr className="border-y border-border-subtle bg-canvas text-slate-muted">
                <th className="py-3 px-4 text-left font-semibold">State</th>
                <th className="py-3 px-4 text-left font-semibold">Start</th>
                <th className="py-3 px-4 text-left font-semibold">End</th>
                <th className="py-3 px-4 text-left font-semibold">Duration</th>
                <th className="py-3 px-4 text-left font-semibold">Min Temp</th>
                <th className="py-3 px-4 text-left font-semibold">Max Temp</th>
                <th className="py-3 px-4 text-left font-semibold">Mean Temp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {stateSegments.map((seg, idx) => (
                <tr key={idx} className="hover:bg-canvas/50 transition-colors">
                  <td className="py-2.5 px-4">
                    <Badge variant={seg.state === "comfort" ? "comfort" : seg.state === "under-comfort" ? "cold" : "hot"}>
                      {seg.state}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-slate-ink">{seg.start}h</td>
                  <td className="py-2.5 px-4 text-slate-ink">{seg.end}h</td>
                  <td className="py-2.5 px-4 text-slate-ink">{(seg.end - seg.start + 1).toFixed(0)}h</td>
                  <td className="py-2.5 px-4 text-slate-ink">{seg.min.toFixed(1)}°C</td>
                  <td className="py-2.5 px-4 text-slate-ink">{seg.max.toFixed(1)}°C</td>
                  <td className="py-2.5 px-4 text-slate-ink">{seg.mean.toFixed(1)}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <DrillDownTable
        title="Hourly Thermal State Drill-Down"
        columns={[
          { key: "hour", label: "Hour" },
          { key: "temp", label: "Temp", unit: "°C" },
          { key: "state", label: "State" },
        ]}
        data={drillDownData}
      />
    </div>
  );
}

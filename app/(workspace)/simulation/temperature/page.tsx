"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Sun, Thermometer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulationResult } from "@/stores/simulation-store";
import { useShelterDesign } from "@/stores/shelter-store";
import { useClimate } from "@/stores/onboarding-store";
import { FormulaCard } from "@/components/FormulaCard";
import { DrillDownTable } from "@/components/DrillDownTable";
import {
  computeOperativeTemp,
  computeMeanRadiantTemp,
  computeSurfaceTemperatures,
  getFormulaData,
} from "@/lib/calculations/formulas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { tokenVar } from "@/lib/utils/tokens";

export default function SimulationTemperaturePage() {
  const result = useSimulationResult();
  const design = useShelterDesign();
  const climate = useClimate();

  const altitude = climate?.altitude ?? 3500;

  const formulaData = useMemo(() => {
    if (!result) return null;
    return getFormulaData(result, design, altitude);
  }, [result, design, altitude]);

  const chartData = useMemo(() => {
    if (!result) return [];
    const surfaceTemps = computeSurfaceTemperatures(
      design,
      result.indoorTemperature[12] ?? 0,
      result.outdoorTemperature[12] ?? 0,
    );
    const viewFactors = [0.25, 0.25, 0.25, 0.25];
    const tMrt = computeMeanRadiantTemp(
      [surfaceTemps.wall, surfaceTemps.roof, surfaceTemps.floor, surfaceTemps.window],
      viewFactors,
    );
    return result.indoorTemperature.map((t, i) => ({
      hour: i,
      indoor: t,
      outdoor: result.outdoorTemperature[i] ?? 0,
      operative: computeOperativeTemp(t, tMrt),
      mrt: tMrt,
    }));
  }, [result, design]);

  const drillDownData = useMemo(() => {
    if (!result) return [];
    return result.indoorTemperature.map((t, i) => ({
      hour: `${i}h`,
      indoor: `${t.toFixed(1)}`,
      outdoor: `${(result.outdoorTemperature[i] ?? 0).toFixed(1)}`,
      delta: `${(t - (result.outdoorTemperature[i] ?? 0)).toFixed(1)}`,
    }));
  }, [result]);

  if (!result || !formulaData) {
    return (
      <div className="p-8 text-slate-muted">Run a simulation first to see temperature analysis.</div>
    );
  }

  const tIndoor = result.indoorTemperature[Math.floor(result.indoorTemperature.length / 2)] ?? 0;
  const tOutdoor = result.outdoorTemperature[Math.floor(result.outdoorTemperature.length / 2)] ?? 0;
  const tOp = formulaData.operativeTemp.value;
  const tMrt = formulaData.meanRadiantTemp.value;
  const deltaT = formulaData.ambientDelta.value;
  const indoorMin = Math.min(...result.indoorTemperature);
  const indoorMax = Math.max(...result.indoorTemperature);
  const outdoorMin = Math.min(...result.outdoorTemperature);

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
              Temperature Deep-Dive
            </h1>
            <Badge variant="violet">AIR & SURFACES</Badge>
          </div>
          <p className="text-xs text-slate-muted">
            Operative, indoor dry-bulb, mean radiant, and surface layer temperatures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Operative Temperature (T_op)</span>
            <Thermometer className="w-4 h-4 text-slate-muted" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink mt-2">
            {tOp.toFixed(1)}°C
          </p>
          <p className="text-xs text-slate-muted mt-1">
            Range: {indoorMin.toFixed(1)}°C – {indoorMax.toFixed(1)}°C
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Mean Radiant Temperature (MRT)</span>
            <Sun className="w-4 h-4 text-slate-muted" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink mt-2">
            {tMrt.toFixed(1)}°C
          </p>
          <p className="text-xs text-slate-muted mt-1">
            Elevated by south Trombe wall thermal mass radiance.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Ambient Delta (ΔT)</span>
            <Clock className="w-4 h-4 text-slate-muted" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink mt-2">
            +{deltaT.toFixed(1)} K
          </p>
          <p className="text-xs text-slate-muted mt-1">
            Max thermal lift above sub-zero ambient ({outdoorMin.toFixed(1)}°C outdoors).
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormulaCard
          title="Operative Temperature"
          formula={formulaData.operativeTemp.formula}
          result={`${tOp.toFixed(1)}°C`}
          variables={formulaData.operativeTemp.variables}
        />
        <FormulaCard
          title="Mean Radiant Temperature"
          formula={formulaData.meanRadiantTemp.formula}
          result={`${tMrt.toFixed(1)}°C`}
          variables={formulaData.meanRadiantTemp.variables}
        />
      </div>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>24-Hour Temperature Profile</CardTitle>
          <p className="text-xs text-slate-muted mt-1">
            Indoor dry-bulb, operative, mean radiant, and outdoor temperatures over 24 hours.
          </p>
        </CardHeader>
        <CardContent className="p-0 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tokenVar("warmFog")} />
              <XAxis dataKey="hour" label={{ value: "Hour", position: "insideBottomRight" }} />
              <YAxis label={{ value: "°C", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <ReferenceArea y1={18} y2={26} fill={tokenVar("thermalComfortSubtle")} fillOpacity={0.3} />
              <Line type="monotone" dataKey="indoor" stroke={tokenVar("shopViolet")} strokeWidth={2} dot={false} name="Indoor" />
              <Line type="monotone" dataKey="operative" stroke={tokenVar("thermalComfort")} strokeWidth={2} dot={false} name="Operative" />
              <Line type="monotone" dataKey="mrt" stroke={tokenVar("thermalWarn")} strokeWidth={2} dot={false} name="MRT" />
              <Line type="monotone" dataKey="outdoor" stroke={tokenVar("slateMuted")} strokeDasharray="5 5" strokeWidth={2} dot={false} name="Outdoor" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <DrillDownTable
        title="Hourly Temperature Drill-Down"
        columns={[
          { key: "hour", label: "Hour" },
          { key: "indoor", label: "Indoor", unit: "°C" },
          { key: "outdoor", label: "Outdoor", unit: "°C" },
          { key: "delta", label: "ΔT", unit: "K" },
        ]}
        data={drillDownData}
      />
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Sun, Zap, Percent } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulationResult } from "@/stores/simulation-store";
import { useShelterDesign } from "@/stores/shelter-store";
import { FormulaCard } from "@/components/FormulaCard";
import { DrillDownTable } from "@/components/DrillDownTable";
import { computeSolarGain, computeCumulativeSolarEnergy, getFormulaData } from "@/lib/calculations/formulas";
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
} from "recharts";
import { tokenVar } from "@/lib/utils/tokens";

export default function SimulationSolarPage() {
  const result = useSimulationResult();
  const design = useShelterDesign();

  const formulaData = useMemo(() => {
    if (!result) return null;
    return getFormulaData(result, design, 3500);
  }, [result, design]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.solarIrradiance.map((ghi, i) => ({
      hour: i,
      ghi,
      gain: result.heatGain[i] ?? 0,
    }));
  }, [result]);

  const drillDownData = useMemo(() => {
    if (!result) return [];
    return result.solarIrradiance.map((ghi, i) => {
      const gain = computeSolarGain(0.62, ghi, design.openings.windowArea);
      return {
        hour: `${i}h`,
        ghi: `${ghi.toFixed(0)}`,
        gain: `${(gain / 1000).toFixed(2)}`,
      };
    });
  }, [result, design]);

  if (!result || !formulaData) {
    return (
      <div className="p-8 text-slate-muted">Run a simulation first to see solar analysis.</div>
    );
  }

  const peakGHI = Math.max(...result.solarIrradiance);
  const peakGain = result.peakSolarGain;
  const cumulativeEnergy = computeCumulativeSolarEnergy(result.heatGain, 1);
  const apertureArea = design.openings.windowArea;
  const shgc = 0.62;
  const efficiency = peakGHI > 0 ? (peakGain / (shgc * peakGHI * apertureArea / 1000)) * 100 : 0;

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
              Solar Aperture Performance
            </h1>
            <Badge variant="violet">GHI & APERTURE</Badge>
          </div>
          <p className="text-xs text-slate-muted">
            Global horizontal irradiance, solar heat gain, and aperture efficiency.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Peak Solar Transmitted</span>
            <Sun className="w-4 h-4 text-slate-muted" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink mt-2">
            {peakGain.toFixed(2)} kW
          </p>
          <p className="text-xs text-slate-muted mt-1">
            At 12:00 solar noon, {peakGHI.toFixed(0)} W/m² GHI, SHGC={shgc}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">24h Cumulative Solar Energy</span>
            <Zap className="w-4 h-4 text-slate-muted" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink mt-2">
            {cumulativeEnergy.toFixed(1)} kWh
          </p>
          <p className="text-xs text-slate-muted mt-1">
            Through {apertureArea.toFixed(1)} m² south aperture
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Solar Aperture Efficiency</span>
            <Percent className="w-4 h-4 text-slate-muted" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink mt-2">
            {efficiency.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-muted mt-1">
            Absorbed by Trombe wall and floor slab
          </p>
        </Card>
      </div>

      <FormulaCard
        title="Solar Heat Gain"
        formula={formulaData.solarGain.formula}
        result={`${peakGain.toFixed(2)} kW`}
        variables={formulaData.solarGain.variables}
      />

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>24-Hour Solar Profile</CardTitle>
          <p className="text-xs text-slate-muted mt-1">
            Global horizontal irradiance (W/m²) and solar heat gain (kW) over 24 hours.
          </p>
        </CardHeader>
        <CardContent className="p-0 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tokenVar("warmFog")} />
              <XAxis dataKey="hour" label={{ value: "Hour", position: "insideBottomRight" }} />
              <YAxis yAxisId="left" label={{ value: "W/m²", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "kW", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="ghi" fill={tokenVar("thermalWarn")} fillOpacity={0.2} stroke={tokenVar("thermalWarn")} name="GHI (W/m²)" />
              <Line yAxisId="right" type="monotone" dataKey="gain" stroke={tokenVar("shopViolet")} strokeWidth={2} dot={false} name="Solar Gain (kW)" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <DrillDownTable
        title="Hourly Solar Drill-Down"
        columns={[
          { key: "hour", label: "Hour" },
          { key: "ghi", label: "GHI", unit: "W/m²" },
          { key: "gain", label: "Solar Gain", unit: "kW" },
        ]}
        data={drillDownData}
      />
    </div>
  );
}

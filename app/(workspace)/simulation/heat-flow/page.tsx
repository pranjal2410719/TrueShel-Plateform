"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Flame, Wind, Home } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulationResult } from "@/stores/simulation-store";
import { useShelterDesign } from "@/stores/shelter-store";
import { useClimate } from "@/stores/onboarding-store";
import { FormulaCard } from "@/components/FormulaCard";
import { DrillDownTable } from "@/components/DrillDownTable";
import { computeHeatFlowBreakdown, computeInfiltrationLoss, getFormulaData } from "@/lib/calculations/formulas";
import { computeAssemblyUValue } from "@/lib/calculations/thermal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { tokenVar } from "@/lib/utils/tokens";

export default function SimulationHeatFlowPage() {
  const result = useSimulationResult();
  const design = useShelterDesign();
  const climate = useClimate();

  const altitude = climate?.altitude ?? 3500;

  const formulaData = useMemo(() => {
    if (!result) return null;
    return getFormulaData(result, design, altitude);
  }, [result, design, altitude]);

  const heatFlow = useMemo(() => {
    if (!result) return null;
    const tIndoor = result.indoorTemperature[12] ?? 0;
    const tOutdoor = result.outdoorTemperature[12] ?? 0;
    return computeHeatFlowBreakdown(design, tIndoor, tOutdoor);
  }, [result, design]);

  const volume = design.geometry.length * design.geometry.width * design.geometry.height;
  const infiltration = useMemo(() => {
    if (!result) return 0;
    const tIndoor = result.indoorTemperature[12] ?? 0;
    const tOutdoor = result.outdoorTemperature[12] ?? 0;
    return computeInfiltrationLoss(volume, 0.6, tIndoor, tOutdoor, altitude);
  }, [result, altitude, volume]);

  const barData = useMemo(() => {
    if (!result) return [];
    return result.heatLoss.map((loss, i) => ({
      hour: i,
      loss,
      gain: result.heatGain[i] ?? 0,
    }));
  }, [result]);

  const pieData = useMemo(() => {
    if (!heatFlow) return [];
    return [
      { name: "Roof", value: heatFlow.roof },
      { name: "Walls", value: heatFlow.walls },
      { name: "Floor", value: heatFlow.floor },
      { name: "Windows", value: heatFlow.windows },
      { name: "Infiltration", value: heatFlow.infiltration },
    ];
  }, [heatFlow]);

  const COLORS = ["#5433eb", "#22c55e", "#f59e0b", "#ef4444", "#64748b"];

  const drillDownData = useMemo(() => {
    if (!result) return [];
    return result.heatLoss.map((loss, i) => ({
      hour: `${i}h`,
      loss: `${loss.toFixed(2)}`,
      gain: `${(result.heatGain[i] ?? 0).toFixed(2)}`,
      net: `${((result.heatGain[i] ?? 0) - loss).toFixed(2)}`,
    }));
  }, [result]);

  if (!result || !formulaData || !heatFlow) {
    return (
      <div className="p-8 text-slate-muted">Run a simulation first to see heat flow analysis.</div>
    );
  }

  const uWall = computeAssemblyUValue(design.envelope.wall);
  const uRoof = computeAssemblyUValue(design.envelope.roof);
  const uFloor = computeAssemblyUValue(design.envelope.floor);
  const floorArea = design.geometry.length * design.geometry.width;
  const wallArea = 2 * (design.geometry.length + design.geometry.width) * design.geometry.height;

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
              Heat Flow Breakdown
            </h1>
            <Badge variant="violet">FLUX & LOSSES</Badge>
          </div>
          <p className="text-xs text-slate-muted">
            Transmission losses by envelope assembly and high-altitude air infiltration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-slate-muted" />
              <CardTitle className="text-sm">Transmission Losses by Envelope</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-muted">Roof (U={uRoof.toFixed(2)} W/m²K)</span>
              <span className="font-semibold text-slate-ink">{(heatFlow.roof / 100 * heatFlow.total).toFixed(2)} kW ({heatFlow.roof.toFixed(1)}%)</span>
            </div>
            <div className="h-2 w-full rounded-pill bg-warm-fog overflow-hidden">
              <div className="h-full bg-shop-violet rounded-pill" style={{ width: `${heatFlow.roof}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-muted">Opaque Wall (U={uWall.toFixed(2)} W/m²K)</span>
              <span className="font-semibold text-slate-ink">{(heatFlow.walls / 100 * heatFlow.total).toFixed(2)} kW ({heatFlow.walls.toFixed(1)}%)</span>
            </div>
            <div className="h-2 w-full rounded-pill bg-warm-fog overflow-hidden">
              <div className="h-full bg-thermal-comfort rounded-pill" style={{ width: `${heatFlow.walls}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-muted">Window (U=2.80 W/m²K)</span>
              <span className="font-semibold text-slate-ink">{(heatFlow.windows / 100 * heatFlow.total).toFixed(2)} kW ({heatFlow.windows.toFixed(1)}%)</span>
            </div>
            <div className="h-2 w-full rounded-pill bg-warm-fog overflow-hidden">
              <div className="h-full bg-thermal-warn rounded-pill" style={{ width: `${heatFlow.windows}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-muted">Floor Slab (U={uFloor.toFixed(2)} W/m²K)</span>
              <span className="font-semibold text-slate-ink">{(heatFlow.floor / 100 * heatFlow.total).toFixed(2)} kW ({heatFlow.floor.toFixed(1)}%)</span>
            </div>
            <div className="h-2 w-full rounded-pill bg-warm-fog overflow-hidden">
              <div className="h-full bg-thermal-hot rounded-pill" style={{ width: `${heatFlow.floor}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="p-5">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-slate-muted" />
              <CardTitle className="text-sm">High-Altitude Air Infiltration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-muted">Air Changes per Hour (ACH)</span>
              <span className="font-semibold text-slate-ink">0.60</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-muted">Barometric Pressure (at {altitude}m)</span>
              <span className="font-semibold text-slate-ink">{(101.325 * Math.exp(-altitude / 8500)).toFixed(1)} kPa</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-muted">Air Density Correction</span>
              <span className="font-semibold text-slate-ink">-{((1 - Math.exp(-altitude / 8500)) * 100).toFixed(0)}% mass flow</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-muted">Sensible Infiltration Loss</span>
              <span className="font-semibold text-slate-ink">{infiltration.toFixed(2)} kW ({heatFlow.infiltration.toFixed(1)}%)</span>
            </div>
            <div className="mt-3 p-3 bg-warm-fog/50 rounded-inner">
              <p className="text-[11px] text-slate-muted">
                At {altitude}m altitude, air density is {(1.225 * Math.exp(-altitude / 8500)).toFixed(2)} kg/m³ — infiltration mass flow is {((1 - Math.exp(-altitude / 8500)) * 100).toFixed(0)}% lower than sea level, partially offsetting heat loss.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormulaCard
          title="Total Heat Flow"
          formula={formulaData.heatFlow.formula}
          result={`${heatFlow.total.toFixed(2)} kW`}
          variables={formulaData.heatFlow.variables}
        />
        <FormulaCard
          title="Infiltration Loss"
          formula={formulaData.infiltration.formula}
          result={`${infiltration.toFixed(2)} kW`}
          variables={formulaData.infiltration.variables}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Heat Gain vs Loss (24h)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tokenVar("warmFog")} />
                <XAxis dataKey="hour" />
                <YAxis label={{ value: "kW", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="gain" fill={tokenVar("thermalComfort")} name="Heat Gain" />
                <Bar dataKey="loss" fill={tokenVar("thermalHot")} name="Heat Loss" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Heat Flow Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <DrillDownTable
        title="Hourly Heat Flow Drill-Down"
        columns={[
          { key: "hour", label: "Hour" },
          { key: "loss", label: "Heat Loss", unit: "kW" },
          { key: "gain", label: "Heat Gain", unit: "kW" },
          { key: "net", label: "Net", unit: "kW" },
        ]}
        data={drillDownData}
      />
    </div>
  );
}

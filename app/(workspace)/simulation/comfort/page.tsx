"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, Gauge } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulationResult } from "@/stores/simulation-store";
import { useShelterDesign } from "@/stores/shelter-store";
import { FormulaCard } from "@/components/FormulaCard";
import { DrillDownTable } from "@/components/DrillDownTable";
import { computePMV, computePPD, getFormulaData } from "@/lib/calculations/formulas";
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

export default function SimulationComfortPage() {
  const result = useSimulationResult();
  const design = useShelterDesign();

  const formulaData = useMemo(() => {
    if (!result) return null;
    return getFormulaData(result, design, 3500);
  }, [result, design]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.indoorTemperature.map((t, i) => {
      const pmv = computePMV(t, 35, 0.1, 1.2, 0.5);
      const ppd = computePPD(pmv);
      return {
        hour: i,
        temp: t,
        pmv,
        ppd,
      };
    });
  }, [result]);

  const drillDownData = useMemo(() => {
    if (!result) return [];
    return result.indoorTemperature.map((t, i) => {
      const pmv = computePMV(t, 35, 0.1, 1.2, 0.5);
      const ppd = computePPD(pmv);
      const state = t < 18 ? "Under-comfort" : t > 26 ? "Overheating" : "Comfort";
      return {
        hour: `${i}h`,
        temp: `${t.toFixed(1)}`,
        pmv: pmv.toFixed(2),
        ppd: `${ppd.toFixed(1)}`,
        state,
      };
    });
  }, [result]);

  if (!result || !formulaData) {
    return (
      <div className="p-8 text-slate-muted">Run a simulation first to see comfort analysis.</div>
    );
  }

  const comfortPct = (result.comfort.comfortRatio * 100).toFixed(1);
  const meanPMV = formulaData.pmv.value;
  const meanPPD = formulaData.ppd.value;

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
              Thermal Comfort & Human Factors
            </h1>
            <Badge variant="comfort">PMV & PPD</Badge>
          </div>
          <p className="text-xs text-slate-muted">
            Adaptive comfort compliance, predicted mean vote, and predicted percentage dissatisfied.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Adaptive Comfort Compliance</span>
            <Users className="w-4 h-4 text-slate-muted" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink mt-2">
            {comfortPct}%
          </p>
          <p className="text-xs text-slate-muted mt-1">
            {result.comfort.comfortHours.toFixed(1)} of 24 hours in 18–26°C band
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Mean PMV Index</span>
            <Activity className="w-4 h-4 text-slate-muted" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink mt-2">
            {meanPMV.toFixed(2)}
          </p>
          <p className="text-xs text-slate-muted mt-1">
            ISO 7730 Class B (−0.5 ≤ PMV ≤ +0.5)
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-muted">Mean PPD (Dissatisfaction)</span>
            <Gauge className="w-4 h-4 text-slate-muted" />
          </div>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink mt-2">
            {meanPPD.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-muted mt-1">
            Target: &lt; 10% for acceptable comfort
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormulaCard
          title="Predicted Mean Vote (PMV)"
          formula={formulaData.pmv.formula}
          result={meanPMV.toFixed(2)}
          variables={formulaData.pmv.variables}
        />
        <FormulaCard
          title="Predicted Percentage Dissatisfied (PPD)"
          formula={formulaData.ppd.formula}
          result={`${meanPPD.toFixed(1)}%`}
          variables={formulaData.ppd.variables}
        />
      </div>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>24-Hour Comfort Profile</CardTitle>
          <p className="text-xs text-slate-muted mt-1">
            Indoor temperature, PMV, and PPD over 24 hours with comfort band.
          </p>
        </CardHeader>
        <CardContent className="p-0 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tokenVar("warmFog")} />
              <XAxis dataKey="hour" label={{ value: "Hour", position: "insideBottomRight" }} />
              <YAxis yAxisId="left" label={{ value: "°C", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" domain={[-3, 3]} label={{ value: "PMV", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <ReferenceArea yAxisId="left" y1={18} y2={26} fill={tokenVar("thermalComfortSubtle")} fillOpacity={0.3} />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke={tokenVar("shopViolet")} strokeWidth={2} dot={false} name="Temperature (°C)" />
              <Line yAxisId="right" type="monotone" dataKey="pmv" stroke={tokenVar("thermalComfort")} strokeWidth={2} dot={false} name="PMV" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <DrillDownTable
        title="Hourly Comfort Drill-Down"
        columns={[
          { key: "hour", label: "Hour" },
          { key: "temp", label: "Temp", unit: "°C" },
          { key: "pmv", label: "PMV" },
          { key: "ppd", label: "PPD", unit: "%" },
          { key: "state", label: "State" },
        ]}
        data={drillDownData}
      />
    </div>
  );
}

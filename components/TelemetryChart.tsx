// TelemetryChart.tsx – renders the 24‑hour indoor/outdoor temperature curve.
// Uses Recharts with data pulled from the simulation store.
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { tokenVar } from "@/lib/utils/tokens";
import { useIndoorTemperatureTimeseries, useSimulationResult } from "@/stores/simulation-store";

type ChartPoint = { hour: number; indoor: number; outdoor: number | null };

/** Proper React hook — satisfies react-hooks/rules-of-hooks */
function useChartData(): ChartPoint[] {
  const result = useSimulationResult();
  const indoor = useIndoorTemperatureTimeseries();
  if (!result || indoor.length === 0) return [];
  const outdoor = result.outdoorTemperature ?? [];
  return indoor.map((temp, idx) => ({
    hour: idx,
    indoor: temp,
    outdoor: outdoor[idx] ?? null,
  }));
}

export function TelemetryChart() {
  const data = useChartData();
  const comfortMin = 18;
  const comfortMax = 26;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={tokenVar("warmFog")} />
        <XAxis dataKey="hour" label={{ value: "Hour", position: "insideBottomRight" }} />
        <YAxis domain={["dataMin-5", "dataMax+5"]} label={{ value: "°C", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        {/* Comfort band */}
        <ReferenceArea y1={comfortMin} y2={comfortMax} fill={tokenVar("thermalComfortSubtle")} fillOpacity={0.3} />
        <Line type="monotone" dataKey="indoor" stroke={tokenVar("shopViolet")} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="outdoor" stroke={tokenVar("slateMuted")} strokeDasharray="5 5" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

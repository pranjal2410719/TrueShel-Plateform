"use client";

import React, { useMemo, useState } from "react";
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
import { useSimulationResult } from "@/stores/simulation-store";

type LayerKey = "temperature" | "solar" | "heatFlow" | "comfort";

const LAYER_OPTIONS: { key: LayerKey; label: string }[] = [
  { key: "temperature", label: "Temperature" },
  { key: "solar", label: "Solar" },
  { key: "heatFlow", label: "Heat Flow" },
  { key: "comfort", label: "Comfort State" },
];

export function MultiDimensionalChart() {
  const result = useSimulationResult();
  const [activeLayers, setActiveLayers] = useState<Set<LayerKey>>(
    new Set(["temperature", "solar"]),
  );

  const data = useMemo(() => {
    if (!result) return [];
    return result.indoorTemperature.map((t, i) => ({
      hour: i,
      indoor: t,
      outdoor: result.outdoorTemperature[i] ?? 0,
      solar: result.solarIrradiance[i] ?? 0,
      heatGain: result.heatGain[i] ?? 0,
      heatLoss: result.heatLoss[i] ?? 0,
      comfort: t >= 18 && t <= 26 ? 1 : 0,
    }));
  }, [result]);

  const toggleLayer = (key: LayerKey) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (!data.length) return null;

  const indoorMin = Math.min(...data.map((d) => d.indoor));
  const outdoorMin = Math.min(...data.map((d) => d.outdoor));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LAYER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => toggleLayer(opt.key)}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all cursor-pointer ${
              activeLayers.has(opt.key)
                ? "bg-shop-violet text-surface"
                : "bg-warm-fog text-slate-muted hover:bg-border-subtle"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-shop-violet inline-block" /> Indoor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-muted inline-block" style={{ borderTop: "2px dashed" }} /> Outdoor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 bg-thermal-comfort/30 inline-block rounded-sm" /> Comfort Band
        </span>
        <span className="ml-auto">
          Indoor Min: {indoorMin.toFixed(1)}°C • Outdoor Min: {outdoorMin.toFixed(1)}°C
        </span>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={tokenVar("warmFog")} />
          <XAxis dataKey="hour" label={{ value: "Hour", position: "insideBottomRight" }} />
          <YAxis
            yAxisId="temp"
            label={{ value: "°C", angle: -90, position: "insideLeft" }}
          />
          {(activeLayers.has("solar") || activeLayers.has("heatFlow")) && (
            <YAxis
              yAxisId="solar"
              orientation="right"
              label={{ value: "W/m²", angle: 90, position: "insideRight" }}
            />
          )}
          <Tooltip />
          <Legend />
          {activeLayers.has("temperature") && (
            <>
              <ReferenceArea yAxisId="temp" y1={18} y2={26} fill={tokenVar("thermalComfortSubtle")} fillOpacity={0.3} />
              <Line yAxisId="temp" type="monotone" dataKey="indoor" stroke={tokenVar("shopViolet")} strokeWidth={2} dot={false} name="Indoor (°C)" />
              <Line yAxisId="temp" type="monotone" dataKey="outdoor" stroke={tokenVar("slateMuted")} strokeDasharray="5 5" strokeWidth={2} dot={false} name="Outdoor (°C)" />
            </>
          )}
          {activeLayers.has("solar") && (
            <Area yAxisId="solar" type="monotone" dataKey="solar" fill={tokenVar("thermalWarn")} fillOpacity={0.2} stroke={tokenVar("thermalWarn")} name="GHI (W/m²)" />
          )}
          {activeLayers.has("heatFlow") && (
            <>
              <Line yAxisId="solar" type="monotone" dataKey="heatGain" stroke={tokenVar("thermalComfort")} strokeWidth={2} dot={false} name="Heat Gain (kW)" />
              <Line yAxisId="solar" type="monotone" dataKey="heatLoss" stroke={tokenVar("thermalHot")} strokeWidth={2} dot={false} name="Heat Loss (kW)" />
            </>
          )}
          {activeLayers.has("comfort") && (
            <Area yAxisId="temp" type="stepAfter" dataKey="comfort" fill={tokenVar("thermalComfort")} fillOpacity={0.1} stroke="none" name="Comfort State" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

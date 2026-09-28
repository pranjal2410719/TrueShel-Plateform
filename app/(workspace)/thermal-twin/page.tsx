"use client";

import React, { useEffect } from "react";
import {
  Box,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Flame,
  Thermometer,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ShelterModel from "@/components/visualization/ShelterModel";
import { cn } from "@/lib/utils/cn";
import { useShelterDesign } from "@/stores/shelter-store";
import { useSimulationStore } from "@/stores/simulation-store";
import {
  useThermalTwinStore,
  useActiveTimestep,
  useThermalTwinMode,
  useIsPlaying,
} from "@/stores/thermal-twin-store";
import { getTemperatureColorToken } from "@/lib/calculations/thermal";
import type { ThermalTwinMode } from "@/types";

const MODES: Array<{ id: ThermalTwinMode; label: string; icon: LucideIcon }> = [
  { id: "normal", label: "Normal", icon: Box },
  { id: "thermal", label: "Thermal", icon: Thermometer },
  { id: "heat-flow", label: "Heat Flow", icon: Flame },
  { id: "solar", label: "Solar Flux", icon: Sun },
  { id: "storage", label: "Storage/PCM", icon: Sparkles },
];

const TEMP_TOKEN_BADGE: Record<string, "cold" | "comfort" | "warn" | "error"> = {
  "thermal-cold": "cold",
  "thermal-comfort": "comfort",
  "thermal-warn": "warn",
  "thermal-hot": "error",
};

export default function ThermalTwinPage() {
  const design = useShelterDesign();
  const timestep = useActiveTimestep();
  const mode = useThermalTwinMode();
  const isPlaying = useIsPlaying();
  const result = useSimulationStore((s) => s.result);
  const { setTimestep, setMode, togglePlayback } = useThermalTwinStore();

  // OrbitControls reset — remount the canvas so the camera returns to its
  // initial framing (previously the Reset Camera button was a dead control).
  const [cameraResetKey, setCameraResetKey] = React.useState(0);
  const handleResetCamera = () => setCameraResetKey((k) => k + 1);

  // 24-hour playback loop driven by the twin store.
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const { activeTimestep, setTimestep: set } = useThermalTwinStore.getState();
      set((activeTimestep + 1) % 24);
    }, 600);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Derived telemetry from the real simulation result at the active hour.
  const indoor = result?.indoorTemperature[timestep] ?? null;
  const outdoor = result?.outdoorTemperature[timestep] ?? null;
  const solar = result?.solarIrradiance[timestep] ?? null;
  const state = result?.thermalStates[timestep] ?? null;

  const timeLabel = `${String(timestep).padStart(2, "0")}:00`;

  const badgeVariant = state
    ? TEMP_TOKEN_BADGE[getTemperatureColorToken(indoor ?? 18)] ?? "comfort"
    : "comfort";

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Telemetry Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-4 rounded-card shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-pill bg-shop-violet/10 text-shop-violet flex items-center justify-center">
            <Box className="w-5 h-5 text-shop-violet" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-slate-ink">
                3D Thermal Digital Twin
              </h1>
              {state && (
                <Badge variant={badgeVariant}>
                  {state === "comfort"
                    ? "COMFORT"
                    : state === "overheating"
                    ? "OVERHEATING"
                    : "UNDER-COMFORT"}
                  {indoor !== null ? ` ${indoor.toFixed(1)}°C` : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-muted">
              Procedural WebGL thermal state map • 100% Geometry Primitive Generation
            </p>
          </div>
        </div>

        {/* Real-time Telemetry Pills — sourced from the simulation store */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-pill bg-canvas border border-border-subtle">
            <span className="text-slate-muted mr-1.5">Outdoor:</span>
            <span className="font-semibold text-slate-ink">
              {outdoor !== null ? `${outdoor.toFixed(1)}°C` : "—"}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-pill bg-canvas border border-border-subtle">
            <span className="text-slate-muted mr-1.5">Solar Flux:</span>
            <span className="font-semibold text-slate-ink">
              {solar !== null ? `${Math.round(solar)} W/m²` : "—"}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-pill bg-canvas border border-border-subtle">
            <span className="text-slate-muted mr-1.5">Indoor Operative:</span>
            <span className="font-semibold text-slate-ink">
              {indoor !== null ? `${indoor.toFixed(1)}°C` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Viewport Frame */}
      <Card className="p-4 flex flex-col h-[520px] sm:h-[580px]">
        {/* Mode Switcher Buttons */}
        <div className="flex items-center justify-between pb-3 gap-2 flex-wrap">
          <div className="flex flex-wrap items-center gap-1.5">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop-violet",
                    isActive
                      ? "bg-shop-violet text-surface shadow-card"
                      : "bg-canvas text-slate-muted hover:text-slate-ink hover:bg-surface-hover",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <Button variant="ghost" size="sm" onClick={handleResetCamera}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Camera
          </Button>
        </div>

        {/* 3D WebGL Canvas — real procedural shelter with the active
            visualisation mode and timestep applied. */}
        <div className="flex-1 min-h-0 w-full bg-slate-ink/5 rounded-inner relative overflow-hidden">
          <ShelterModel
            key={cameraResetKey}
            design={design}
            mode={mode}
            timestep={timestep}
          />
          {!result && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-surface/90 rounded-card px-5 py-4 text-center shadow-card max-w-xs">
                <p className="text-sm font-semibold text-slate-ink">
                  No simulation data yet
                </p>
                <p className="text-xs text-slate-muted mt-1">
                  Run a simulation to colour this twin by live thermal state.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 24-Hour Timeline Scrubber Bar */}
        <div className="pt-4 flex items-center gap-4">
          <Button
            variant="default"
            size="icon"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause 24-hour playback" : "Play 24-hour playback"}
            className="shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-surface text-surface" />
            ) : (
              <Play className="w-4 h-4 fill-surface text-surface" />
            )}
          </Button>

          <span className="text-xs font-mono font-semibold text-slate-ink min-w-[50px]">
            {timeLabel}
          </span>

          <div className="flex-1 min-w-0">
            <Slider
              min={0}
              max={23}
              step={1}
              value={timestep}
              onValueChange={(v) => setTimestep(v)}
              aria-label="Simulation timestep"
            />
          </div>

          <span className="text-xs font-mono text-slate-muted">23:00</span>
        </div>
      </Card>
    </div>
  );
}

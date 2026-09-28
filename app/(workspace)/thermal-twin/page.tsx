"use client";

import React, { useState } from "react";
import {
  Box,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Flame,
  Thermometer,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function ThermalTwinPage() {
  const [activeMode, setActiveMode] = useState<"normal" | "thermal" | "heat-flow" | "solar" | "storage">("thermal");
  const [timestep, setTimestep] = useState(12);
  const [isPlaying, setIsPlaying] = useState(false);

  const modes = [
    { id: "normal", label: "Normal", icon: Box },
    { id: "thermal", label: "Thermal", icon: Thermometer },
    { id: "heat-flow", label: "Heat Flow", icon: Flame },
    { id: "solar", label: "Solar Flux", icon: Sun },
    { id: "storage", label: "Storage/PCM", icon: Sparkles },
  ] as const;

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Telemetry Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-4 rounded-card shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-pill bg-shop-violet/10 text-shop-violet flex items-center justify-center">
            <Box className="w-5 h-5 text-shop-violet" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-ink">
                3D Thermal Digital Twin
              </h1>
              <Badge variant="comfort">COMFORT 21.4°C</Badge>
            </div>
            <p className="text-xs text-slate-muted">
              Procedural WebGL thermal state map • 100% Geometry Primitive Generation
            </p>
          </div>
        </div>

        {/* Real-time Telemetry Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-pill bg-canvas border border-border-subtle">
            <span className="text-slate-muted mr-1.5">Outdoor:</span>
            <span className="font-semibold text-slate-ink">-3.2°C</span>
          </div>
          <div className="px-3 py-1.5 rounded-pill bg-canvas border border-border-subtle">
            <span className="text-slate-muted mr-1.5">Solar Flux:</span>
            <span className="font-semibold text-slate-ink">670 W/m²</span>
          </div>
          <div className="px-3 py-1.5 rounded-pill bg-canvas border border-border-subtle">
            <span className="text-slate-muted mr-1.5">Indoor Operative:</span>
            <span className="font-semibold text-slate-ink">21.4°C</span>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Viewport Frame */}
      <Card className="p-4 flex flex-col h-[520px] sm:h-[580px]">
        {/* Mode Switcher Buttons */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {modes.map((m) => {
              const Icon = m.icon;
              const isActive = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-shop-violet text-surface shadow-card"
                      : "bg-canvas text-slate-muted hover:text-slate-ink hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <Button variant="ghost" size="sm">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Camera
          </Button>
        </div>

        {/* 3D WebGL Canvas Container */}
        <div className="flex-1 w-full bg-slate-ink/5 rounded-inner relative overflow-hidden flex items-center justify-center">
          <div className="text-center p-6 space-y-3">
            <Box className="w-12 h-12 text-shop-violet mx-auto" />
            <div>
              <p className="text-base font-semibold text-slate-ink">Procedural 3D Thermal Canvas</p>
              <p className="text-xs text-slate-muted max-w-sm mx-auto mt-1">
                BoxGeometry walls, BufferGeometry gabled roof, aperture cutouts, and uniform-driven GLSL shader mapping.
              </p>
            </div>
            <Badge variant="violet">ACTIVE MODE: {activeMode.toUpperCase()}</Badge>
          </div>
        </div>

        {/* 24-Hour Timeline Scrubber Bar */}
        <div className="pt-4 flex items-center gap-4">
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-surface text-surface" /> : <Play className="w-4 h-4 fill-surface text-surface" />}
          </Button>

          <span className="text-xs font-mono font-semibold text-slate-ink min-w-[50px]">
            {String(timestep).padStart(2, "0")}:00
          </span>

          <div className="flex-1">
            <Slider
              min={0}
              max={24}
              step={1}
              value={timestep}
              onValueChange={setTimestep}
            />
          </div>

          <span className="text-xs font-mono text-slate-muted">24:00</span>
        </div>
      </Card>
    </div>
  );
}

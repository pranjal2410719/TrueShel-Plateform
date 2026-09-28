"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShelterDesign, useShelterStore } from "@/stores/shelter-store";
import { CLIMATE_ZONES } from "@/lib/mock/repository";
import { CLIMATE_ZONE_LABELS, deriveGeometryFromClimate } from "@/lib/calculations/climateAdaptation";
import type { ClimateZone } from "@/types";
import ShelterModel from "@/components/visualization/ShelterModel";

const ROOF_OPTIONS = [
  { value: "flat", label: "Flat Roof" },
  { value: "gabled", label: "Dual Gabled" },
  { value: "shed", label: "Shed / Mono-Pitch" },
];

export default function ShelterGeometryPage() {
  const design = useShelterDesign();
  const { length, width, height, roofType } = design.geometry;
  const updateGeometry = useShelterStore((s) => s.updateGeometry);
  const applyClimateAdaptation = useShelterStore((s) => s.applyClimateAdaptation);
  const resetToDefault = useShelterStore((s) => s.resetToDefault);

  const [selectedZone, setSelectedZone] = useState<ClimateZone>("high-altitude-cold");
  const [showRationale, setShowRationale] = useState(false);

  const floorArea = length * width;
  const internalVolume = floorArea * height;
  const surfaceArea = 2 * (floorArea + length * height + width * height);
  const saRatio = surfaceArea / internalVolume;

  const handleClimateAdapt = () => {
    const climate = CLIMATE_ZONES[selectedZone];
    if (climate) {
      applyClimateAdaptation(climate);
      setShowRationale(true);
    }
  };

  const adaptation = deriveGeometryFromClimate(CLIMATE_ZONES[selectedZone] ?? CLIMATE_ZONES["high-altitude-cold"]);

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/shelter">
          <Button variant="ghost" size="icon" aria-label="Back to Shelter Designer">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Shelter Geometry Editor
            </h1>
            <Badge variant="violet">LIVE DESIGN</Badge>
          </div>
          <p className="text-xs text-slate-muted">
            Edit dimensions, roof type, and orientation. Apply climate-adaptive recommendations.
          </p>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="climate-zone" className="text-xs font-medium text-slate-muted block mb-1">
              Climate Zone
            </label>
            <select
              id="climate-zone"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value as ClimateZone)}
              className="w-full px-3 py-2 rounded-inner border border-border-subtle bg-surface text-sm text-slate-ink focus:outline-none focus:ring-2 focus:ring-shop-violet-subtle"
            >
              {Object.entries(CLIMATE_ZONE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClimateAdapt} className="gap-1.5">
              <Sparkles className="w-4 h-4" />
              Apply Climate Adaptation
            </Button>
            <Button variant="outline" onClick={resetToDefault} className="gap-1.5">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
        {showRationale && (
          <div className="mt-4 p-3 bg-shop-violet-subtle rounded-inner">
            <p className="text-xs font-semibold text-shop-violet mb-2">Climate Adaptation Rationale</p>
            <ul className="text-xs text-slate-ink space-y-1">
              {adaptation.rationale.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-shop-violet mt-0.5">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="p-5">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm">Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="length" className="text-xs text-slate-muted block">
                  Length (m)
                </label>
                <Input
                  id="length"
                  type="number"
                  value={length}
                  onChange={(e) => updateGeometry({ length: parseFloat(e.target.value) })}
                  min={2}
                  max={20}
                  step={0.5}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="width" className="text-xs text-slate-muted block">
                  Width (m)
                </label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => updateGeometry({ width: parseFloat(e.target.value) })}
                  min={2}
                  max={15}
                  step={0.5}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="height" className="text-xs text-slate-muted block">
                  Height (m)
                </label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => updateGeometry({ height: parseFloat(e.target.value) })}
                  min={2}
                  max={5}
                  step={0.1}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="roofType" className="text-xs text-slate-muted block">
                  Roof Type
                </label>
                <select
                  id="roofType"
                  value={roofType}
                  onChange={(e) => updateGeometry({ roofType: e.target.value as "flat" | "gabled" | "shed" })}
                  className="w-full px-3 py-2 rounded-inner border border-border-subtle bg-surface text-sm text-slate-ink focus:outline-none focus:ring-2 focus:ring-shop-violet-subtle"
                >
                  {ROOF_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <p className="text-[10px] font-medium text-slate-muted uppercase tracking-wider">Floor Area</p>
              <p className="text-lg font-bold text-slate-ink">{floorArea.toFixed(1)} m²</p>
            </Card>
            <Card className="p-4">
              <p className="text-[10px] font-medium text-slate-muted uppercase tracking-wider">Volume</p>
              <p className="text-lg font-bold text-slate-ink">{internalVolume.toFixed(1)} m³</p>
            </Card>
            <Card className="p-4">
              <p className="text-[10px] font-medium text-slate-muted uppercase tracking-wider">Surface Area</p>
              <p className="text-lg font-bold text-slate-ink">{surfaceArea.toFixed(1)} m²</p>
            </Card>
            <Card className="p-4">
              <p className="text-[10px] font-medium text-slate-muted uppercase tracking-wider">SA/V Ratio</p>
              <p className="text-lg font-bold text-slate-ink">{saRatio.toFixed(2)} m⁻¹</p>
            </Card>
          </div>
        </div>

        <Card className="p-0 overflow-hidden min-h-[400px]">
          <div className="h-full">
            <ShelterModel design={design} mode="normal" />
          </div>
        </Card>
      </div>
    </div>
  );
}

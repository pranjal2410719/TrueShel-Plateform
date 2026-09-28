"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, Compass, Sparkles } from "lucide-react";
import ShelterModel from "@/components/visualization/ShelterModel";
import { useShelterDesign, useShelterStore } from "@/stores/shelter-store";
import { CLIMATE_ZONES } from "@/lib/mock/repository";
import { CLIMATE_ZONE_LABELS, deriveGeometryFromClimate } from "@/lib/calculations/climateAdaptation";
import type { Orientation, ShelterGeometry, ClimateZone } from "@/types";

export default function ShelterDesignerPage() {
  const [activeTab, setActiveTab] = useState("geometry");
  const [selectedClimate, setSelectedClimate] = useState<ClimateZone>("high-altitude-cold");
  const [showAdaptation, setShowAdaptation] = useState(false);
  // Store selectors
  const design = useShelterDesign();
  const setGeometry = useShelterStore((s) => s.updateGeometry);
  const setOrientation = useShelterStore((s) => s.updateOrientation);
  const saveDesign = useShelterStore((s) => s.saveDesign);
  const applyClimateAdaptation = useShelterStore((s) => s.applyClimateAdaptation);

  // Handlers for inputs — clearing a number field yields "" → parseFloat →
  // NaN, which previously flowed straight into the store and broke the 3D
  // model (NaN geometry) and every downstream calculation. Ignore invalid /
  // non-positive input and clamp to sane engineering bounds.
  const handleChange = (field: keyof ShelterGeometry) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value) || value <= 0) return;
    const clamped = Math.min(value, 100);
    setGeometry({ [field]: clamped } as Partial<ShelterGeometry>);
  };
  const handleOrientation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrientation(e.target.value as Orientation);
  };

  const numberInputClass =
    "w-full mt-1 text-xl font-bold text-slate-ink bg-transparent rounded-sm-tok px-1 -mx-1 focus:outline-none focus:ring-2 focus:ring-shop-violet-subtle focus:bg-surface transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Shelter Designer
            </h1>
            <Badge variant="violet">PASSIVE SOLAR ADOBE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            Integrated engineering workspace: 3D procedural preview paired with parametric envelope and thermal mass controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={() => saveDesign()}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Design
          </Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="climate-select" className="text-xs font-medium text-slate-muted block mb-1">
              Climate Zone
            </label>
            <select
              id="climate-select"
              value={selectedClimate}
              onChange={(e) => setSelectedClimate(e.target.value as ClimateZone)}
              className="w-full px-3 py-2 rounded-inner border border-border-subtle bg-surface text-sm text-slate-ink focus:outline-none focus:ring-2 focus:ring-shop-violet-subtle"
            >
              {Object.entries(CLIMATE_ZONE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => {
              const climate = CLIMATE_ZONES[selectedClimate];
              if (climate) {
                applyClimateAdaptation(climate);
                setShowAdaptation(true);
              }
            }}
            className="gap-1.5 self-end"
          >
            <Sparkles className="w-4 h-4" />
            Adapt to Climate
          </Button>
        </div>
        {showAdaptation && (
          <div className="mt-4 p-3 bg-shop-violet-subtle rounded-inner">
            <p className="text-xs font-semibold text-shop-violet mb-2">Applied Climate Adaptation</p>
            <ul className="text-xs text-slate-ink space-y-1">
              {deriveGeometryFromClimate(CLIMATE_ZONES[selectedClimate] ?? CLIMATE_ZONES["high-altitude-cold"]).rationale.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-shop-violet mt-0.5">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* 40 / 60 Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 40% (5 cols on lg): 3D Preview Frame */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="p-6 flex flex-col flex-1">
            <CardHeader className="p-0 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Procedural 3D Model</CardTitle>
                <Badge variant="default">SCALE 1:1</Badge>
              </div>
              <CardDescription>
                Real-time geometric response.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2 flex-1 min-h-[360px] flex items-center justify-center bg-canvas rounded-inner">
              {/* Render live ShelterModel */}
              <ShelterModel design={design} mode="normal" />
            </CardContent>
          </Card>

          {/* Quick Sub-navigation links */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link href="/shelter/geometry" className="p-3 rounded-card bg-surface shadow-card text-center hover:bg-surface-hover">
              <span className="font-semibold text-slate-ink block">Geometry</span>
              <span className="text-slate-muted text-[11px]">Dimensions & Pitch</span>
            </Link>
            <Link href="/shelter/envelope" className="p-3 rounded-card bg-surface shadow-card text-center hover:bg-surface-hover">
              <span className="font-semibold text-slate-ink block">Envelope</span>
              <span className="text-slate-muted text-[11px]">Wall & Roof Layers</span>
            </Link>
          </div>
        </div>

        {/* Right 60% (7 cols on lg): Tabbed Parameter Panels */}
        <div className="lg:col-span-7">
          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto pb-2 no-scrollbar">
                <TabsList className="flex flex-wrap sm:flex-nowrap gap-1">
                  <TabsTrigger value="geometry">Geometry</TabsTrigger>
                  <TabsTrigger value="envelope">Envelope</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="openings">Openings</TabsTrigger>
                  <TabsTrigger value="thermal-mass">Mass</TabsTrigger>
                  <TabsTrigger value="pcm">PCM</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>
              </div>

              {/* Geometry Tab */}
              <TabsContent value="geometry" className="space-y-4 pt-4">
                <h3 className="text-sm font-semibold text-slate-ink">Dimensions & Orientation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-inner bg-canvas border border-border-subtle">
                    <label htmlFor="geo-length" className="text-xs text-slate-muted block">Length (m)</label>
                    <input id="geo-length" type="number" min={1} max={100} step={0.1} value={design.geometry.length} onChange={handleChange('length')} className={numberInputClass} />
                  </div>
                  <div className="p-4 rounded-inner bg-canvas border border-border-subtle">
                    <label htmlFor="geo-width" className="text-xs text-slate-muted block">Width (m)</label>
                    <input id="geo-width" type="number" min={1} max={100} step={0.1} value={design.geometry.width} onChange={handleChange('width')} className={numberInputClass} />
                  </div>
                  <div className="p-4 rounded-inner bg-canvas border border-border-subtle">
                    <label htmlFor="geo-height" className="text-xs text-slate-muted block">Wall Height (m)</label>
                    <input id="geo-height" type="number" min={1} max={100} step={0.1} value={design.geometry.height} onChange={handleChange('height')} className={numberInputClass} />
                  </div>
                </div>
                <div className="p-4 rounded-inner bg-canvas border border-border-subtle flex items-center justify-between">
                  <div>
                    <label htmlFor="geo-orientation" className="text-xs text-slate-muted block">Orientation</label>
                    <select id="geo-orientation" value={design.orientation} onChange={handleOrientation} className="font-semibold text-slate-ink bg-transparent rounded-sm-tok px-1 -mx-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-shop-violet-subtle cursor-pointer">
                      <option value="north">North (0°)</option>
                      <option value="east">East (90°)</option>
                      <option value="south">South (180°)</option>
                      <option value="west">West (270°)</option>
                    </select>
                  </div>
                  <Compass className="w-5 h-5 text-shop-violet" />
                </div>
              </TabsContent>

              {/* Envelope Tab */}
              <TabsContent value="envelope" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-ink">Wall Assembly (ISO 6946)</h3>
                  <Badge variant="violet">R-2.42 m²·K/W</Badge>
                </div>
                <div className="space-y-2">
                  {[{ layer: "Exterior Lime Plaster", d: "20mm", k: "0.80 W/m·K" },
                    { layer: "Straw-Clay Insulation", d: "100mm", k: "0.08 W/m·K" },
                    { layer: "Rammed Earth Structural Core", d: "300mm", k: "1.10 W/m·K" },
                    { layer: "Interior Mud Render", d: "15mm", k: "0.75 W/m·K" }].map((l, i) => (
                      <div key={i} className="p-3 rounded-inner bg-canvas border border-border-subtle flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-ink">{l.layer}</span>
                        <span className="text-slate-muted">{l.d} • k={l.k}</span>
                      </div>
                    ))}
                </div>
              </TabsContent>

              {/* Materials Tab */}
              <TabsContent value="materials" className="space-y-4 pt-4">
                <h3 className="text-sm font-semibold text-slate-ink">Indigenous Material Catalog</h3>
                <p className="text-xs text-slate-muted">High-density earth, straw insulation, and local timber data.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {["Ladakh Sun-Dried Adobe", "Straw-Clay Composite", "Poplar Wood Framing", "Stone Masonry Sub-Base"].map((mat) => (
                    <div key={mat} className="p-3 rounded-inner bg-canvas border border-border-subtle font-medium text-slate-ink">
                      {mat}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Openings Tab */}
              <TabsContent value="openings" className="space-y-4 pt-4">
                <h3 className="text-sm font-semibold text-slate-ink">Glazing & Apertures</h3>
                <div className="p-4 rounded-inner bg-canvas border border-border-subtle space-y-2 text-xs">
                  <div className="flex justify-between gap-2 flex-wrap">
                    <span className="text-slate-muted">South Glazing Area:</span>
                    <span className="font-semibold text-slate-ink">
                      {design.openings.windowArea} m² (
                      {(() => {
                        const floorArea = design.geometry.length * design.geometry.width;
                        return floorArea > 0 && Number.isFinite(floorArea)
                          ? `${((design.openings.windowArea / floorArea) * 100).toFixed(1)}% of floor area`
                          : "—";
                      })()})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-muted">Glazing Type:</span>
                    <span className="font-semibold text-slate-ink">Double Low-E Argon (U=1.4 W/m²·K, SHGC=0.62)</span>
                  </div>
                </div>
              </TabsContent>

              {/* Thermal Mass Tab */}
              <TabsContent value="thermal-mass" className="space-y-4 pt-4">
                <h3 className="text-sm font-semibold text-slate-ink">Thermal Storage Mass</h3>
                <div className="p-4 rounded-inner bg-canvas border border-border-subtle text-xs space-y-1">
                  <p className="font-medium text-slate-ink">Thermal Mass Level: {design.thermalMass.level.toUpperCase()} ({design.thermalMass.material})</p>
                  <p className="text-slate-muted">Direct gain floor slab + {design.thermalMass.thickness}mm South Trombe wall.</p>
                </div>
              </TabsContent>

              {/* PCM Tab */}
              <TabsContent value="pcm" className="space-y-4 pt-4">
                <h3 className="text-sm font-semibold text-slate-ink">Bio-Based Phase Change Materials</h3>
                <div className="p-4 rounded-inner bg-canvas border border-border-subtle text-xs space-y-1">
                  <p className="font-medium text-slate-ink">{design.pcm.enabled ? "Enabled" : "Disabled"} BioPCM Q21 Integration</p>
                  <p className="text-slate-muted">Melting point: {design.pcm.meltingPoint ?? '—'}°C • Latent heat: {design.pcm.latentHeat ?? '—'} kJ/kg • Thickness: {design.pcm.thickness ?? '—'} mm.</p>
                </div>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4 pt-4">
                <h3 className="text-sm font-semibold text-slate-ink">Aggregate Thermal Performance</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-inner bg-canvas border border-border-subtle">
                    <span className="text-slate-muted block">Wall Assembly U-Value:</span>
                    <span className="font-bold text-slate-ink text-sm">{design.envelope.wall.uValue.toFixed(2)} W/m²·K</span>
                  </div>
                  <div className="p-3 rounded-inner bg-canvas border border-border-subtle">
                    <span className="text-slate-muted block">Roof Assembly U-Value:</span>
                    <span className="font-bold text-slate-ink text-sm">{design.envelope.roof.uValue.toFixed(2)} W/m²·K</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  Compass,
  Save,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ShelterDesignerPage() {
  const [activeTab, setActiveTab] = useState("geometry");

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
          <Button variant="default" size="sm">
            <Save className="w-4 h-4 mr-1.5" />
            Save Design
          </Button>
        </div>
      </div>

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
                Real-time geometric response: L 6.0m × W 4.0m × H 2.8m.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2 flex-1 min-h-[360px] flex items-center justify-center bg-canvas rounded-inner">
              <div className="text-center p-6 space-y-2">
                <Box className="w-10 h-10 text-shop-violet mx-auto" />
                <p className="text-sm font-semibold text-slate-ink">Procedural Shelter Geometry</p>
                <p className="text-xs text-slate-muted max-w-xs">
                  Oriented 180° South • Gabled Pitch 25° • Overhang 0.6m • 4 Cardinal Walls
                </p>
              </div>
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
                    <span className="text-xs text-slate-muted block">Length (m)</span>
                    <span className="text-xl font-bold text-slate-ink">6.0 m</span>
                  </div>
                  <div className="p-4 rounded-inner bg-canvas border border-border-subtle">
                    <span className="text-xs text-slate-muted block">Width (m)</span>
                    <span className="text-xl font-bold text-slate-ink">4.0 m</span>
                  </div>
                  <div className="p-4 rounded-inner bg-canvas border border-border-subtle">
                    <span className="text-xs text-slate-muted block">Wall Height (m)</span>
                    <span className="text-xl font-bold text-slate-ink">2.8 m</span>
                  </div>
                </div>
                <div className="p-4 rounded-inner bg-canvas border border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-muted block">Orientation</span>
                    <span className="text-sm font-semibold text-slate-ink">180° Due South (Optimal Solar Aperture)</span>
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
                  {[
                    { layer: "Exterior Lime Plaster", d: "20mm", k: "0.80 W/m·K" },
                    { layer: "Straw-Clay Insulation", d: "100mm", k: "0.08 W/m·K" },
                    { layer: "Rammed Earth Structural Core", d: "300mm", k: "1.10 W/m·K" },
                    { layer: "Interior Mud Render", d: "15mm", k: "0.75 W/m·K" },
                  ].map((l, i) => (
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
                  <div className="flex justify-between">
                    <span className="text-slate-muted">South Glazing Area:</span>
                    <span className="font-semibold text-slate-ink">4.8 m² (20% WWR)</span>
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
                  <p className="font-medium text-slate-ink">Total Capacitance: 18.4 MJ/K</p>
                  <p className="text-slate-muted">Direct gain floor slab + 300mm South Trombe wall.</p>
                </div>
              </TabsContent>

              {/* PCM Tab */}
              <TabsContent value="pcm" className="space-y-4 pt-4">
                <h3 className="text-sm font-semibold text-slate-ink">Bio-Based Phase Change Materials</h3>
                <div className="p-4 rounded-inner bg-canvas border border-border-subtle text-xs space-y-1">
                  <p className="font-medium text-slate-ink">BioPCM Q21 Integration</p>
                  <p className="text-slate-muted">Melting point: 21°C • Latent heat: 180 kJ/kg • Stabilizes indoor peak temperatures.</p>
                </div>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4 pt-4">
                <h3 className="text-sm font-semibold text-slate-ink">Aggregate Thermal Performance</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-inner bg-canvas border border-border-subtle">
                    <span className="text-slate-muted block">Overall Area-Weighted U:</span>
                    <span className="font-bold text-slate-ink text-sm">0.44 W/m²·K</span>
                  </div>
                  <div className="p-3 rounded-inner bg-canvas border border-border-subtle">
                    <span className="text-slate-muted block">Total Envelope Heat Loss:</span>
                    <span className="font-bold text-slate-ink text-sm">1.82 kW</span>
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

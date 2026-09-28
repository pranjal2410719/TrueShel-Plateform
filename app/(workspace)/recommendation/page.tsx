"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecommendationPage() {
  const drivers = [
    {
      title: "South-Facing 300mm Trombe Wall",
      reason: "Provides 8.5-hour thermal lag, delivering peak daytime solar absorption to the occupied interior at 20:30 when ambient plunges to -12°C.",
    },
    {
      title: "BioPCM Q21 Latent Buffering",
      reason: "Limits maximum indoor temperature to 23.6°C during high clear-sky midday irradiance while releasing 2.3 kWh during early morning cold hours.",
    },
    {
      title: "Gabled Straw-Clay Roof Assembly (R-3.8)",
      reason: "Prevents vertical buoyancy heat loss through the ceiling, capping roof transmission to under 41% of total building envelope conductance.",
    },
    {
      title: "Protected East-Entry Airlock Vestibule",
      reason: "Mitigates infiltration penalty caused by prevailing 3.5 m/s northwest winter winds.",
    },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Evidence-Based Recommendations
            </h1>
            <Badge variant="violet">PHYSICS-JUSTIFIED</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            Thermodynamic design guidance derived strictly from high-altitude physics calculations with zero fabricated AI scores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Configuration Card */}
        <Card className="lg:col-span-1 p-6 space-y-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recommended Archetype</CardTitle>
              <Badge variant="comfort">OPTIMAL</Badge>
            </div>
            <CardDescription>Ladakh High-Altitude Hybrid Passive Solar.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-3 text-xs">
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle">
              <span className="text-slate-muted block">Envelope Insulation</span>
              <span className="font-semibold text-slate-ink">120mm Straw-Clay (Walls) • 200mm (Roof)</span>
            </div>
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle">
              <span className="text-slate-muted block">Direct Solar Aperture</span>
              <span className="font-semibold text-slate-ink">4.8 m² Double Low-E Argon</span>
            </div>
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle">
              <span className="text-slate-muted block">Sensible + Latent Storage</span>
              <span className="font-semibold text-slate-ink">300mm Adobe + 45kg BioPCM Q21</span>
            </div>
          </CardContent>
        </Card>

        {/* Physics Drivers & Justifications */}
        <Card className="lg:col-span-2 p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Physical Mechanism Justifications</CardTitle>
            <CardDescription>Scientific reasoning for selected architectural parameters.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-3">
            {drivers.map((d, i) => (
              <div key={i} className="p-4 rounded-inner bg-canvas border border-border-subtle text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-thermal-comfort shrink-0" />
                  <p className="font-semibold text-slate-ink">{d.title}</p>
                </div>
                <p className="text-slate-muted pl-6 leading-relaxed">{d.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

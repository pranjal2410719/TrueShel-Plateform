"use client";

import React from "react";
import { Wind, Gauge, SunMedium, ThermometerSnowflake } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ClimatePage() {
  const climateStats = [
    { label: "Altitude & Pressure", value: "3,500m", sub: "65.2 kPa • 0.88 kg/m³", icon: Gauge },
    { label: "Ambient Diurnal Range", value: "-15.0°C", sub: "Max -1.5°C • Min -15.0°C", icon: ThermometerSnowflake },
    { label: "Clear-Sky Peak GHI", value: "850 W/m²", sub: "Direct 710 • Diffuse 140", icon: SunMedium },
    { label: "Design Wind Velocity", value: "3.5 m/s", sub: "Northwest Winter Jet", icon: Wind },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Climate Explorer
            </h1>
            <Badge variant="violet">LEH, LADAKH</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            High-altitude sub-zero climate baseline with extreme diurnal temperature oscillation and high solar potential.
          </p>
        </div>
      </div>

      {/* Atmospheric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {climateStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-muted">{stat.label}</span>
                <Icon className="w-4 h-4 text-slate-muted" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tighter text-slate-ink">{stat.value}</p>
                <p className="text-xs text-slate-muted mt-1">{stat.sub}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Diurnal Temperature Profile (24h)</CardTitle>
            <CardDescription>Sub-zero temperature curve showing nocturnal plunge to -15°C and afternoon rise.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 min-h-[280px] flex items-center justify-center bg-canvas rounded-inner">
            <div className="text-center p-6 space-y-2">
              <p className="text-sm font-semibold text-slate-ink">Ladakh Winter Ambient Diurnal Profile</p>
              <p className="text-xs text-slate-muted">
                T_min: -15.0°C (05:00) • T_max: -1.5°C (14:00) • Diurnal Amplitude: 13.5°C
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Solar Radiation (GHI / DNI / DHI)</CardTitle>
            <CardDescription>High atmospheric clarity results in 850 W/m² peak global horizontal irradiance.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 min-h-[280px] flex items-center justify-center bg-canvas rounded-inner">
            <div className="text-center p-6 space-y-2">
              <p className="text-sm font-semibold text-slate-ink">High-Altitude Clear-Sky Solar Radiation</p>
              <p className="text-xs text-slate-muted">
                Solar Window: 07:30 to 17:00 • Clear-Sky Clearness Index K_t: 0.78
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

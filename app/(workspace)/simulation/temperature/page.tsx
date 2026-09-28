"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SimulationTemperaturePage() {
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
              Temperature Deep-Dive
            </h1>
            <Badge variant="violet">AIR & SURFACES</Badge>
          </div>
          <p className="text-xs text-slate-muted">Operative, indoor dry-bulb, mean radiant, and surface layer temperatures.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Operative Temperature (T_op)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">21.4°C</p>
            <p className="text-slate-muted">Average over diurnal cycle • Range: 18.2°C – 23.6°C</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Mean Radiant Temperature (MRT)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">22.1°C</p>
            <p className="text-slate-muted">Elevated by south Trombe wall thermal mass radiance.</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Ambient Delta (ΔT)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">+29.2 K</p>
            <p className="text-slate-muted">Maximum thermal lift above sub-zero ambient (-15.0°C outdoors).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

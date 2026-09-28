"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SimulationSolarPage() {
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
              Solar Aperture Performance
            </h1>
            <Badge variant="violet">DIRECT GAIN</Badge>
          </div>
          <p className="text-xs text-slate-muted">Incident solar flux, transmitted aperture energy, and internal storage capture.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Peak Solar Transmitted</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">2.45 kW</p>
            <p className="text-slate-muted">At 12:00 solar noon (850 W/m² GHI, SHGC = 0.62).</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">24h Cumulative Solar Energy</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">14.8 kWh</p>
            <p className="text-slate-muted">Delivered through 4.8 m² South aperture.</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Solar Aperture Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">78.4%</p>
            <p className="text-slate-muted">Absorbed by Trombe wall and exposed floor slab.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

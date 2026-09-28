"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ShelterOpeningsPage() {
  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/shelter">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Openings & Glazing Apertures
            </h1>
            <Badge variant="violet">SOLAR GAIN</Badge>
          </div>
          <p className="text-xs text-slate-muted">South-facing passive solar apertures, window-to-wall ratios, and thermal breaks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base">South Passive Solar Window</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-slate-muted">Aperture Area: <span className="font-semibold text-slate-ink">4.8 m²</span></p>
            <p className="text-slate-muted">Window-to-Wall Ratio (WWR): <span className="font-semibold text-slate-ink">28.5% (South Facade)</span></p>
            <p className="text-slate-muted">U-Value: <span className="font-semibold text-slate-ink">1.4 W/m²·K</span></p>
            <p className="text-slate-muted">Solar Heat Gain Coefficient (SHGC): <span className="font-semibold text-slate-ink">0.62</span></p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base">Airlock Entry Door</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-slate-muted">Door Area: <span className="font-semibold text-slate-ink">1.8 m² (East Sheltered Entry)</span></p>
            <p className="text-slate-muted">Airlock Vestibule: <span className="font-semibold text-slate-ink">Enabled (Prevents direct cold draft)</span></p>
            <p className="text-slate-muted">Door U-Value: <span className="font-semibold text-slate-ink">0.95 W/m²·K (Insulated Timber Core)</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SimulationHeatFlowPage() {
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
              Heat Flow Breakdown
            </h1>
            <Badge variant="violet">FLUX VECTORS</Badge>
          </div>
          <p className="text-xs text-slate-muted">Conduction, convection, radiation, and infiltration heat loss trajectories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base">Transmission Losses by Envelope</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-muted">Roof Conduction:</span>
              <span className="font-semibold text-slate-ink">0.75 kW (41.2%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">Opaque Wall Conduction:</span>
              <span className="font-semibold text-slate-ink">0.33 kW (18.1%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">Window Conduction:</span>
              <span className="font-semibold text-slate-ink">0.15 kW (8.2%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">Floor Slab Conduction:</span>
              <span className="font-semibold text-slate-ink">0.08 kW (4.4%)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base">High-Altitude Air Infiltration</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-muted">Infiltration Rate:</span>
              <span className="font-semibold text-slate-ink">0.60 ACH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">Barometric Correction:</span>
              <span className="font-semibold text-slate-ink">65.2 kPa (-27% mass flow)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">Sensible Infiltration Heat Loss:</span>
              <span className="font-semibold text-slate-ink">0.51 kW (28.0%)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

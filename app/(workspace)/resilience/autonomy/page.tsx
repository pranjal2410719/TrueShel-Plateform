"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ResilienceAutonomyPage() {
  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/resilience">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Thermal Autonomy Blackout Analysis
            </h1>
            <Badge variant="comfort">14.2 HOURS</Badge>
          </div>
          <p className="text-xs text-slate-muted">Lumped capacitance exponential decay dynamics under total auxiliary heating loss.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Threshold Temperature</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">16.0°C</p>
            <p className="text-slate-muted">WHO / ISO 7730 indoor health safety limit for vulnerable occupants.</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Effective Time Constant (τ)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">81.0 Hours</p>
            <p className="text-slate-muted">Ratio of lumped thermal mass (18.4 MJ/K) to overall heat loss conductance (63 W/K).</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Survival Buffer Window</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">14.2 Hours</p>
            <p className="text-slate-muted">Outage starting at 21.4°C comfortably spans a complete sub-zero nocturnal blackout.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

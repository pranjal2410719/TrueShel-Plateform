"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ShelterPCMPage() {
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
              Phase Change Materials (PCM)
            </h1>
            <Badge variant="violet">LATENT STORAGE</Badge>
          </div>
          <p className="text-xs text-slate-muted">Bio-based latent heat thermal storage parameters and enthalpy-temperature curves.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base">PCM Material Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-slate-muted">Material: <span className="font-semibold text-slate-ink">BioPCM Q21 Pouch Mat</span></p>
            <p className="text-slate-muted">Phase Transition Range: <span className="font-semibold text-slate-ink">20.5°C to 22.0°C</span></p>
            <p className="text-slate-muted">Latent Heat of Fusion: <span className="font-semibold text-slate-ink">185 kJ/kg</span></p>
            <p className="text-slate-muted">Installed Mass: <span className="font-semibold text-slate-ink">45 kg (Ceiling & South Partition)</span></p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base">Buffering Dynamics</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-slate-muted">Total Latent Capacity: <span className="font-semibold text-slate-ink">8.33 MJ (2.31 kWh)</span></p>
            <p className="text-slate-muted">Overheat Suppression: <span className="font-semibold text-slate-ink">Limits peak indoor temp to ≤24.2°C</span></p>
            <p className="text-slate-muted">Nighttime Discharge: <span className="font-semibold text-slate-ink">Releases stored heat between 22:00 and 04:00</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

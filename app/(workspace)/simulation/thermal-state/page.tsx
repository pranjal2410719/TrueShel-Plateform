"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SimulationThermalStatePage() {
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
              Thermal State Segmentation
            </h1>
            <Badge variant="violet">24H TIMELINE</Badge>
          </div>
          <p className="text-xs text-slate-muted">Hourly categorization across Under-Comfort, Comfort, and Overheating physical regimes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Under-Comfort (&le;12°C - 18°C)</CardTitle>
              <Badge variant="cold">4.5 HOURS</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-slate-muted">Observed between 03:00 and 07:30 before morning solar gain activates.</p>
            <p className="text-slate-muted font-medium mt-2">Minimum: 18.2°C (Only 0.8 K below comfort target at 06:00).</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Optimal Comfort (18°C – 26°C)</CardTitle>
              <Badge variant="comfort">19.5 HOURS</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-slate-muted">Sustained throughout daytime and extended through midnight via flywheel mass.</p>
            <p className="text-slate-muted font-medium mt-2">Mean operative comfort temperature: 21.4°C.</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Overheating (&ge;26°C)</CardTitle>
              <Badge variant="hot">0.0 HOURS</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-slate-muted">Zero overheating hours. BioPCM and roof overhang maintain peak temp at 23.6°C.</p>
            <p className="text-slate-muted font-medium mt-2">Safe thermal stability without active cooling.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

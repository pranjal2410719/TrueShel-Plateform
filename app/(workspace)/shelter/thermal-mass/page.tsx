"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ShelterThermalMassPage() {
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
              Thermal Mass & Capacitance
            </h1>
            <Badge variant="violet">18.4 MJ/K</Badge>
          </div>
          <p className="text-xs text-slate-muted">Lumped thermal capacitance and diurnal heat flywheel dynamics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Internal Mass Level</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <Badge variant="comfort">VERY HIGH MASS</Badge>
            <p className="text-slate-muted mt-2">
              Combined mass of 300mm adobe exterior walls, 200mm stone floor slab, and internal partition.
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Diurnal Time Lag (φ)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-2xl font-bold text-slate-ink">8.5 Hours</p>
            <p className="text-slate-muted">Peak solar heat absorbed at 12:00 reaches internal living space at 20:30.</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Decrement Factor (μ)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-2xl font-bold text-slate-ink">0.24</p>
            <p className="text-slate-muted">Attenuates 13.5°C outside diurnal temperature swing down to 3.2°C indoors.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ShelterGeometryPage() {
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
              Shelter Geometry & Orientation
            </h1>
            <Badge variant="violet">DEEP LINK</Badge>
          </div>
          <p className="text-xs text-slate-muted">Parametric shelter length, width, height, roof pitch, and solar azimuth angle.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Floor Footprint</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-slate-muted">Length: <span className="font-semibold text-slate-ink">6.0 m</span></p>
            <p className="text-slate-muted">Width: <span className="font-semibold text-slate-ink">4.0 m</span></p>
            <p className="text-slate-muted">Floor Area: <span className="font-semibold text-slate-ink">24.0 m²</span></p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Vertical Extrusion</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-slate-muted">Eaves Height: <span className="font-semibold text-slate-ink">2.8 m</span></p>
            <p className="text-slate-muted">Ridge Height: <span className="font-semibold text-slate-ink">3.7 m</span></p>
            <p className="text-slate-muted">Internal Volume: <span className="font-semibold text-slate-ink">78.0 m³</span></p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Solar Orientation</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-slate-muted">Azimuth: <span className="font-semibold text-slate-ink">180° (Due South)</span></p>
            <p className="text-slate-muted">Roof Pitch: <span className="font-semibold text-slate-ink">25° Dual Gabled</span></p>
            <p className="text-slate-muted">Overhang: <span className="font-semibold text-slate-ink">0.60 m (Summer Shading)</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShelterDesign } from "@/stores/shelter-store";

const ORIENTATION_LABELS: Record<string, string> = {
  north: "0° (North)",
  east: "90° (East)",
  south: "180° (Due South)",
  west: "270° (West)",
};

const ROOF_LABELS: Record<string, string> = {
  flat: "Flat Roof",
  gabled: "Dual Gabled",
  shed: "Shed / Mono-Pitch",
};

export default function ShelterGeometryPage() {
  const design = useShelterDesign();
  const { length, width, height, roofType } = design.geometry;

  const floorArea = length * width;
  const internalVolume = floorArea * height;

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/shelter">
          <Button variant="ghost" size="icon" aria-label="Back to Shelter Designer">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Shelter Geometry & Orientation
            </h1>
            <Badge variant="violet">LIVE DESIGN</Badge>
          </div>
          <p className="text-xs text-slate-muted">
            Parametric shelter length, width, height, roof type, and solar orientation — reflects the current designer state.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Floor Footprint</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-slate-muted">
              Length: <span className="font-semibold text-slate-ink">{length.toFixed(1)} m</span>
            </p>
            <p className="text-slate-muted">
              Width: <span className="font-semibold text-slate-ink">{width.toFixed(1)} m</span>
            </p>
            <p className="text-slate-muted">
              Floor Area: <span className="font-semibold text-slate-ink">{floorArea.toFixed(1)} m²</span>
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Vertical Extrusion</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-slate-muted">
              Eaves Height: <span className="font-semibold text-slate-ink">{height.toFixed(1)} m</span>
            </p>
            <p className="text-slate-muted">
              Roof Type:{" "}
              <span className="font-semibold text-slate-ink">
                {ROOF_LABELS[roofType] ?? roofType}
              </span>
            </p>
            <p className="text-slate-muted">
              Internal Volume:{" "}
              <span className="font-semibold text-slate-ink">{internalVolume.toFixed(1)} m³</span>
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Solar Orientation</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <p className="text-slate-muted">
              Azimuth:{" "}
              <span className="font-semibold text-slate-ink">
                {ORIENTATION_LABELS[design.orientation] ?? design.orientation}
              </span>
            </p>
            <p className="text-slate-muted">
              Roof Geometry:{" "}
              <span className="font-semibold text-slate-ink">
                {ROOF_LABELS[roofType] ?? roofType}
              </span>
            </p>
            <p className="text-slate-muted">
              Window-to-Wall Ratio:{" "}
              <span className="font-semibold text-slate-ink">
                {((design.openings.windowArea / floorArea) * 100).toFixed(1)}% (floor-based)
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

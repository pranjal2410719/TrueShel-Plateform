"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ShelterMaterialsPage() {
  const materials = [
    { name: "Ladakh Adobe Brick", k: 0.85, rho: 1750, cp: 1000, tag: "Mass" },
    { name: "Rammed Earth", k: 1.10, rho: 1950, cp: 1050, tag: "Mass" },
    { name: "Straw-Clay Mixture", k: 0.08, rho: 350, cp: 1400, tag: "Insulation" },
    { name: "Expanded Corkboard", k: 0.04, rho: 120, cp: 1800, tag: "Insulation" },
    { name: "Poplar Local Timber", k: 0.13, rho: 520, cp: 1600, tag: "Structure" },
    { name: "Double Low-E Glazing", k: 0.03, rho: 2500, cp: 840, tag: "Glazing" },
  ];

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
              Material Library & Thermophysical Database
            </h1>
            <Badge variant="violet">14+ MATERIALS</Badge>
          </div>
          <p className="text-xs text-slate-muted">Conductivity k, density ρ, specific heat capacity Cp, and emissivity properties.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((m) => (
          <Card key={m.name} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-ink">{m.name}</span>
              <Badge variant="default">{m.tag}</Badge>
            </div>
            <div className="space-y-1 text-xs text-slate-muted mt-3">
              <p>Thermal Conductivity (k): <span className="font-semibold text-slate-ink">{m.k} W/m·K</span></p>
              <p>Density (ρ): <span className="font-semibold text-slate-ink">{m.rho} kg/m³</span></p>
              <p>Specific Heat (Cp): <span className="font-semibold text-slate-ink">{m.cp} J/kg·K</span></p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

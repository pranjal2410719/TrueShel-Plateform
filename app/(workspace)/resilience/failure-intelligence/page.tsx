"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ResilienceFailureIntelligencePage() {
  const failurePatterns = [
    {
      issue: "Perimeter Thermal Bridging at Wall-Foundation Junction",
      climate: "Alpine Sub-Zero (Leh, 3500m)",
      observedPattern: "Uninsulated stone plinth causes 2D thermal bypass, dropping interior baseboard surface to -2°C.",
      consequence: "Internal condensation, freeze-thaw spalling, mold formation behind base perimeter.",
      riskLevel: "hot" as const,
      mitigation: "Install 80mm continuous perimeter expanded cork or aerated pumice thermal break below slab.",
      source: "Ladakh Renewable Energy Agency (LREA) Field Survey & EN ISO 10211 Numerical Simulation",
    },
    {
      issue: "Nocturnal Reverse Thermosiphoning in Unvented Trombe Wall",
      climate: "Extreme Diurnal Range (Amplitude 15°C)",
      observedPattern: "Air column between glazing and mass wall cools at night, reversing airflow and dumping heat outdoors.",
      consequence: "Net negative 24h heat balance through the passive solar aperture.",
      riskLevel: "warn" as const,
      mitigation: "Incorporate lightweight gravity backdraft dampers on upper and lower convective air vents.",
      source: "Passive Solar Architecture in High-Altitude Himalaya (TERI Press / NREL Case 402)",
    },
    {
      issue: "Interstitial Vapor Condensation in Straw-Clay Envelope",
      climate: "Sub-Zero Alpine Winter with High Indoor Relative Humidity",
      observedPattern: "Water vapor permeates from warm interior into cold straw core without vapor-open exterior breathing layer.",
      consequence: "Insulation wetting, reduction of thermal resistance by up to 60%, structural rot.",
      riskLevel: "warn" as const,
      mitigation: "Strict vapor barrier hierarchy: continuous vapor retarder inside (Sd > 2.0m) and breathable lime render outside (Sd < 0.2m).",
      source: "Fraunhofer IBP WUFI Hygrothermal Research Report & Eco-Solutions Leh",
    },
  ];

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
              Cold-Climate Failure Intelligence Repository
            </h1>
            <Badge variant="violet">RAG EVIDENCE BASE</Badge>
          </div>
          <p className="text-xs text-slate-muted">Field-verified failure patterns and physics-based mitigation architectures for high-altitude shelters.</p>
        </div>
      </div>

      {/* RAG Vector Pipeline Architecture Stub Banner */}
      <Card className="p-4 bg-shop-violet-subtle border border-shop-violet-border text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-shop-violet" />
            <span className="font-semibold text-slate-ink">Vector Evidence Pipeline Stub</span>
          </div>
          <Badge variant="violet">EMBEDDING READY</Badge>
        </div>
        <p className="text-slate-muted mt-1 text-[11px]">
          Pipeline architecture: Document Ingestion → Chunking (512 tokens) → Vector Embeddings → Similarity Search → Evidence Verification → Justified Mitigation.
        </p>
      </Card>

      {/* Failure Cases Catalog */}
      <div className="space-y-4">
        {failurePatterns.map((item, i) => (
          <Card key={i} className="p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-ink">{item.issue}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={item.riskLevel}>RISK: {item.riskLevel.toUpperCase()}</Badge>
                <Badge variant="default">{item.climate}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-inner bg-canvas border border-border-subtle space-y-1">
                <span className="font-semibold text-slate-ink block">Observed Failure Mode</span>
                <p className="text-slate-muted leading-relaxed">{item.observedPattern}</p>
                <p className="text-thermal-hot font-medium mt-1">Consequence: {item.consequence}</p>
              </div>

              <div className="p-3 rounded-inner bg-canvas border border-border-subtle space-y-1">
                <span className="font-semibold text-slate-ink block">Engineering Mitigation Barrier</span>
                <p className="text-slate-muted leading-relaxed">{item.mitigation}</p>
                <p className="text-slate-secondary text-[11px] mt-1 font-mono">Source: {item.source}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

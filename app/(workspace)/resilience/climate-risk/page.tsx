"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ResilienceClimateRiskPage() {
  const risks = [
    { hazard: "Sub-Zero Freeze-Thaw", probability: "High (28 Cycles)", impact: "Spalling of unplastered adobe blocks", level: "warn" as const },
    { hazard: "Winter Blizzard Snow Load", probability: "Moderate (0.8 kN/m²)", impact: "Roof rafter structural deflection", level: "comfort" as const },
    { hazard: "Multi-Day Solar Blackout", probability: "Low (Consecutive overcast)", impact: "Reliance on emergency firewood backup", level: "warn" as const },
    { hazard: "High-Altitude UV Degradation", probability: "High (>8 Index)", impact: "Surface embrittlement of exterior membranes", level: "default" as const },
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
              Climate Hazard & Risk Matrix
            </h1>
            <Badge variant="violet">MULTI-HAZARD</Badge>
          </div>
          <p className="text-xs text-slate-muted">High-altitude sub-zero environmental stressors and structural mitigation barriers.</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[600px] border-collapse text-xs">
            <thead>
              <tr className="border-y border-border-subtle bg-canvas text-slate-muted">
                <th className="py-3 px-6 text-left font-semibold">Hazard Category</th>
                <th className="py-3 px-6 text-left font-semibold">Probability</th>
                <th className="py-3 px-6 text-left font-semibold">Potential Impact</th>
                <th className="py-3 px-6 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {risks.map((r) => (
                <tr key={r.hazard} className="hover:bg-canvas/50 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-ink">{r.hazard}</td>
                  <td className="py-3.5 px-6 text-slate-muted">{r.probability}</td>
                  <td className="py-3.5 px-6 text-slate-secondary">{r.impact}</td>
                  <td className="py-3.5 px-6">
                    <Badge variant={r.level}>{r.level.toUpperCase()}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

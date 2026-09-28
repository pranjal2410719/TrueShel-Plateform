"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ComparePage() {
  const comparisonRows = [
    { param: "Wall Insulation", designA: "120mm Straw-Clay", designB: "80mm Straw-Clay", delta: "+40mm (+50%)", positive: true },
    { param: "South Aperture Area", designA: "4.8 m² (Double Low-E)", designB: "3.2 m² (Single Clear)", delta: "+1.6 m² (+50%)", positive: true },
    { param: "Thermal Mass System", designA: "300mm Adobe + BioPCM", designB: "200mm Adobe only", delta: "+PCM Buffering", positive: true },
    { param: "Adaptive Comfort Hours", designA: "19.5 h (81.3%)", designB: "14.2 h (59.2%)", delta: "+5.3 h (+37.3%)", positive: true },
    { param: "Peak Heat Loss", designA: "1.82 kW", designB: "2.64 kW", delta: "-0.82 kW (-31.1%)", positive: true },
    { param: "Autonomy to 16°C", designA: "14.2 Hours", designB: "7.8 Hours", delta: "+6.4 h (+82.1%)", positive: true },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Design Comparison & Trade-Off Analysis
            </h1>
            <Badge variant="violet">DESIGN A vs DESIGN B</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            Side-by-side engineering evaluation between optimized passive solar design and uninsulated standard baseline.
          </p>
        </div>
      </div>

      {/* Delta KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs font-medium text-slate-muted block mb-1">Comfort Differential (Δ)</span>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink">+5.3 Hours</p>
          <span className="text-xs text-thermal-comfort flex items-center mt-1">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +37.3% longer comfort window
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-slate-muted block mb-1">Heat Loss Reduction (Δ)</span>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink">-0.82 kW</p>
          <span className="text-xs text-thermal-comfort flex items-center mt-1">
            <TrendingDown className="w-3.5 h-3.5 mr-1" />
            31.1% reduced envelope heat leakage
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-slate-muted block mb-1">Autonomy Extension (Δ)</span>
          <p className="text-2xl font-bold tracking-tighter text-slate-ink">+6.4 Hours</p>
          <span className="text-xs text-thermal-comfort flex items-center mt-1">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Nearly double blackout survival time
          </span>
        </Card>
      </div>

      {/* Side-by-side Comparison Table with Horizontal Scroll Containment */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <CardTitle>Parameter & Output Delta Matrix</CardTitle>
          <CardDescription>Direct comparative inspection across thermodynamic properties.</CardDescription>
        </div>
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[600px] border-collapse text-xs">
            <thead>
              <tr className="border-y border-border-subtle bg-canvas text-slate-muted">
                <th className="py-3 px-6 text-left font-semibold">Parameter / Metric</th>
                <th className="py-3 px-6 text-left font-semibold">Design A (Optimized)</th>
                <th className="py-3 px-6 text-left font-semibold">Design B (Baseline)</th>
                <th className="py-3 px-6 text-left font-semibold">Variance (Δ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {comparisonRows.map((row) => (
                <tr key={row.param} className="hover:bg-canvas/50 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-ink">{row.param}</td>
                  <td className="py-3.5 px-6 text-slate-ink font-semibold">{row.designA}</td>
                  <td className="py-3.5 px-6 text-slate-muted">{row.designB}</td>
                  <td className="py-3.5 px-6">
                    <Badge variant={row.positive ? "comfort" : "default"}>
                      {row.delta}
                    </Badge>
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

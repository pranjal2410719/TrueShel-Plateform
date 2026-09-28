"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Clock,
  Snowflake,
  Wind,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ResiliencePage() {
  const resilienceStats = [
    { label: "Thermal Autonomy", value: "14.2 h", sub: "Decay to 16°C", variant: "comfort" as const, icon: Clock },
    { label: "Freeze-Thaw Risk", value: "MODERATE", sub: "28 Annual Cycles", variant: "warn" as const, icon: Snowflake },
    { label: "Wind Exposure", value: "LOW", sub: "NW Shielded Entry", variant: "comfort" as const, icon: Wind },
    { label: "Envelope Degradation", value: "-0.8%/yr", sub: "Moisture Intrusion", variant: "default" as const, icon: TrendingDown },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Resilience & Autonomy Command Center
            </h1>
            <Badge variant="violet">SURVIVABILITY ANALYSIS</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            Evaluation of thermal survivability during extended heating blackout, freeze-thaw risks, and long-term envelope degradation.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resilienceStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-muted">{stat.label}</span>
                <Icon className="w-4 h-4 text-slate-muted" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tighter text-slate-ink">{stat.value}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={stat.variant}>{stat.sub}</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Autonomy Decay Model Visualizer */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blackout Lumped Exponential Decay Model</CardTitle>
              <CardDescription>
                Predicts hours until indoor operative temperature drops to the 16°C critical health threshold during a total heating outage at -15°C ambient.
              </CardDescription>
            </div>
            <Badge variant="comfort">14.2 HOURS AUTONOMY</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-2 min-h-[260px] flex items-center justify-center bg-canvas rounded-inner">
          <div className="text-center p-6 space-y-2">
            <ShieldAlert className="w-8 h-8 text-shop-violet mx-auto" />
            <p className="text-sm font-semibold text-slate-ink">Exponential Temperature Decay: T(t) = T_out + (T_0 - T_out) · e^(-t / τ)</p>
            <p className="text-xs text-slate-muted max-w-md">
              System Time Constant τ = C_th / UA = 18.4 MJ/K / 63 W/K = 81.0 hours • Predicted Time to 16.0°C: 14.2 Hours
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Deep-Dive Sub-Pages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Autonomy Decay", href: "/resilience/autonomy", desc: "Thermal flywheel decay to 16°C" },
          { label: "Climate Risk Matrix", href: "/resilience/climate-risk", desc: "Sub-zero multi-hazard exposure" },
          { label: "20-Year Degradation", href: "/resilience/degradation", desc: "Moisture & seal infiltration aging" },
          { label: "Failure Intelligence", href: "/resilience/failure-intelligence", desc: "Cold-climate failure database" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-4 rounded-card bg-surface shadow-card hover:bg-surface-hover transition-all flex flex-col justify-between"
          >
            <div>
              <p className="font-semibold text-xs text-slate-ink">{item.label}</p>
              <p className="text-[11px] text-slate-muted mt-1">{item.desc}</p>
            </div>
            <div className="mt-3 flex items-center text-xs text-shop-violet font-medium">
              <span>Inspect</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

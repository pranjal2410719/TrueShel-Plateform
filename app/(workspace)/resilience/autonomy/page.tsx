"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShelterStore } from "@/stores/shelter-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { evaluateShelterDesign } from "@/lib/calculations/evaluateDesign";

const THRESHOLD_TEMP = 16;

export default function ResilienceAutonomyPage() {
  const currentDesign = useShelterStore((s) => s.design);
  const simResult = useSimulationStore((s) => s.result);

  // Prefer the latest real simulation; fall back to evaluating the current
  // design so the page never shows numbers that contradict the store.
  const result = useMemo(
    () => simResult ?? evaluateShelterDesign(currentDesign),
    [simResult, currentDesign],
  );

  const autonomy = result.autonomy;
  const peakHeatLoss = result.peakHeatLoss;

  // Effective time constant τ = C / UA, derived from the thermal-mass level
  // (kJ/K, matching evaluateDesign) and the steady-state conductance at the
  // peak ΔT. Replaces the previously hardcoded "81.0 hours".
  const { tauHours, massKJ, conductanceWK } = useMemo(() => {
    const mass =
      currentDesign.thermalMass.level === "low"
        ? 500
        : currentDesign.thermalMass.level === "medium"
        ? 1000
        : 2000;
    const peakIndoor = Math.max(...result.indoorTemperature);
    const minOutdoor = Math.min(...result.outdoorTemperature);
    const deltaT = Math.max(peakIndoor - minOutdoor, 1);
    const ua = (peakHeatLoss * 1000) / deltaT; // W/K
    // τ = C/UA: C in kJ/K → ×1000 for J/K, result in seconds → ÷3600 for hours.
    const tau = ua > 0 ? (mass * 1000) / ua / 3600 : 0; // hours
    return { tauHours: tau, massKJ: mass, conductanceWK: ua };
  }, [currentDesign.thermalMass.level, result, peakHeatLoss]);

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/resilience">
          <Button variant="ghost" size="icon" aria-label="Back to Resilience">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Thermal Autonomy Blackout Analysis
            </h1>
            <Badge variant={autonomy >= 12 ? "comfort" : autonomy >= 8 ? "warn" : "error"}>
              {autonomy.toFixed(1)} HOURS
            </Badge>
          </div>
          <p className="text-xs text-slate-muted">
            Lumped capacitance exponential decay dynamics under total auxiliary heating loss.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Threshold Temperature</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-1 text-xs">
            <p className="text-2xl font-bold text-slate-ink">{THRESHOLD_TEMP.toFixed(1)}°C</p>
            <p className="text-slate-muted">
              WHO / ISO 7730 indoor health safety limit for vulnerable occupants.
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Effective Time Constant (τ)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-1 text-xs">
            <p className="text-2xl font-bold text-slate-ink">
              {tauHours > 0 ? `${tauHours.toFixed(1)} Hours` : "—"}
            </p>
            <p className="text-slate-muted">
              Ratio of lumped thermal mass ({massKJ.toLocaleString()} kJ/K for the{" "}
              {currentDesign.thermalMass.level} thermal-mass configuration) to overall heat loss
              conductance ({conductanceWK.toFixed(0)} W/K).
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Survival Buffer Window</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-1 text-xs">
            <p className="text-2xl font-bold text-slate-ink">{autonomy.toFixed(1)} Hours</p>
            <p className="text-slate-muted">
              Outage starting from a peak indoor temperature of{" "}
              {Math.max(...result.indoorTemperature).toFixed(1)}°C spans{" "}
              {autonomy >= 12 ? "a complete sub-zero nocturnal blackout" : "part of the nocturnal blackout"}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAGES = [
  "Validating Climate Boundary Conditions (Ladakh 3,500m AMSL)",
  "Meshing Procedural Shelter Geometry & Orientation",
  "Computing ISO 6946 Multi-Layer Thermal Resistances",
  "Executing Incident Solar Radiation Ray-Casting",
  "Formulating Multi-Node Transient Heat Transfer Balance",
  "Integrating Thermal Mass & BioPCM Enthalpy State",
  "Solving 24-Hour Transient Temperature Matrix",
  "Evaluating ASHRAE 55 Adaptive Comfort & Thermal Autonomy",
];

export default function SimulationRunningPage() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => router.push("/simulation/results"), 400);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-xl p-6 sm:p-8">
        <CardHeader className="p-0 pb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="violet">TRANSIENT SIMULATION ENGINE</Badge>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-warm-fog/60 border border-border-subtle text-[11px] font-medium text-slate-muted">
              <Database className="w-3 h-3 text-slate-muted" />
              <span>SEED DATA</span>
            </div>
          </div>
          <CardTitle className="text-xl">Executing Thermal Model</CardTitle>
          <CardDescription>
            Multi-node transient thermal energy balance solving across 24 hourly steps.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4 space-y-3">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;

            return (
              <div
                key={stage}
                className="flex items-center justify-between p-3 rounded-inner bg-canvas border border-border-subtle text-xs transition-colors"
              >
                <span className={isCompleted ? "text-slate-ink font-medium" : isCurrent ? "text-shop-violet font-semibold" : "text-slate-muted"}>
                  {stage}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-thermal-comfort shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-shop-violet animate-spin shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-pill bg-warm-fog shrink-0" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

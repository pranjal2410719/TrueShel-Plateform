"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  useSimulationStore,
  useSimulationStatus,
  useSimulationProgress,
  useSimulationCurrentStep,
  useSimulationError,
} from "@/stores/simulation-store";

export default function SimulationRunningPage() {
  const router = useRouter();
  const status = useSimulationStatus();
  const progress = useSimulationProgress();
  const currentStep = useSimulationCurrentStep();
  const error = useSimulationError();
  // Track whether THIS mount started the run, so a late redirect from a
  // previous visit doesn't double-fire runSimulation.
  const startedRef = useRef(false);
  // Redirect only on the complete -> (fresh run) -> complete transition so
  // a pre-existing completed result (seeded store) doesn't bounce instantly.
  const prevStatusRef = useRef(status);

  // Kick off the real simulation when the page mounts.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const store = useSimulationStore.getState();
    if (store.status !== "running") {
      void store.runSimulation();
    }
  }, []);

  // Redirect to results as soon as the engine reports completion of this run.
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (status === "complete" && prev !== "complete") {
      const timeout = setTimeout(() => router.replace("/simulation/results"), 500);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  const isRunning = status === "running";
  const isError = status === "error";

  const handleRetry = () => {
    startedRef.current = true;
    void useSimulationStore.getState().runSimulation();
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-xl p-6 sm:p-8">
        <CardHeader className="p-0 pb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="violet">TRANSIENT SIMULATION ENGINE</Badge>
          </div>
          <CardTitle className="text-xl">
            {isError ? "Simulation Failed" : status === "complete" ? "Solver Converged" : "Executing Thermal Model"}
          </CardTitle>
          <CardDescription>
            {isError
              ? "The transient solver could not complete this run."
              : status === "complete"
              ? "24-hour transient matrix solved — loading results…"
              : "Multi-node transient thermal energy balance solving across 24 hourly steps."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4 space-y-3">
          {/* Real progress bar driven by the simulation store */}
          {(isRunning || status === "complete") && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-muted">
                <span className="flex items-center gap-1.5">
                  {status === "complete" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-thermal-comfort" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-shop-violet" />
                  )}
                  {currentStep ?? (status === "complete" ? "Complete" : "Preparing solver…")}
                </span>
                <span className="font-mono font-semibold text-slate-ink">{progress}%</span>
              </div>
              <Progress value={progress} aria-label="Simulation progress" />
            </div>
          )}

          {isError && (
            <div role="alert" className="rounded-inner bg-thermal-hot/10 border border-thermal-hot/30 p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-thermal-hot mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-thermal-hot break-words">{error ?? "Unknown solver error."}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={handleRetry}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Retry Run
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => router.push("/simulation/setup")}>
                    Back to Setup
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stage checklist — reflects the store's current progress band */}
          {isRunning &&
            [
              "Validating climate boundary conditions (Ladakh 3,500m AMSL)",
              "Meshing procedural shelter geometry & orientation",
              "Computing ISO 6946 multi-layer thermal resistances",
              "Integrating thermal mass & BioPCM enthalpy state",
              "Solving 24-hour transient temperature matrix",
              "Evaluating ASHRAE 55 adaptive comfort & thermal autonomy",
            ].map((stage, idx, arr) => {
              const band = ((idx + 1) / arr.length) * 100;
              const isCompleted = progress >= band;
              const isCurrent = !isCompleted && progress >= (idx / arr.length) * 100;

              return (
                <div
                  key={stage}
                  className="flex items-center justify-between p-3 rounded-inner bg-canvas border border-border-subtle text-xs transition-colors"
                >
                  <span
                    className={
                      isCompleted
                        ? "text-slate-ink font-medium"
                        : isCurrent
                        ? "text-shop-violet font-semibold"
                        : "text-slate-muted"
                    }
                  >
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

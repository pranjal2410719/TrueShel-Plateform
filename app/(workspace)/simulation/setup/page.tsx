"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSimulationStore } from "@/stores/simulation-store";

export default function SimulationSetupPage() {
  const router = useRouter();
  // Toggles are wired to the real store configuration so the solver honours
  // them. Previously they were local state that Execute Simulation ignored.
  const configuration = useSimulationStore((s) => s.configuration);
  const setConfiguration = useSimulationStore((s) => s.setConfiguration);

  const handleRun = () => {
    // Navigate first: the running page starts the run and redirects to
    // results with real progress instead of a fire-and-forget race.
    router.push("/simulation/running");
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Simulation Setup & Engine Configuration
            </h1>
            <Badge variant="violet">SOLVER SETUP</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-muted">
            Configure boundary parameters, numerical timesteps, and physics sub-models prior to execution.
          </p>
        </div>
        <Button onClick={handleRun} variant="default" size="default">
          <Play className="w-4 h-4 mr-2 fill-surface text-surface" />
          Execute Simulation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Parameters Card */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Temporal Domain & Comfort Criteria</CardTitle>
            <CardDescription>Specify simulation duration and thermal evaluation range.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-4 text-xs">
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-ink block">Simulation Duration</span>
                <span className="text-slate-muted">Transient 24-hour diurnal cycle</span>
              </div>
              <Badge variant="default">24 Hours</Badge>
            </div>
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-ink block">Numerical Timestep (dt)</span>
                <span className="text-slate-muted">Hourly discrete resolution</span>
              </div>
              <Badge variant="default">1 Hour</Badge>
            </div>
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-ink block">Comfort Temperature Band</span>
                <span className="text-slate-muted">Adaptive ASHRAE 55-2020</span>
              </div>
              <Badge variant="comfort">18.0°C – 26.0°C</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Physics Modules Toggle Card */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Physics Sub-Models & Couplings</CardTitle>
            <CardDescription>Activate or deactivate specific thermodynamic mechanisms.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-3 text-xs">
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-ink block">Thermal Mass Capacitance</span>
                <span className="text-slate-muted">Internal wall & slab flywheel storage</span>
              </div>
              <Switch
                checked={configuration.useThermalMass}
                onCheckedChange={(v) => setConfiguration({ useThermalMass: v })}
                aria-label="Toggle thermal mass capacitance"
              />
            </div>

            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-ink block">Phase Change Material (PCM)</span>
                <span className="text-slate-muted">BioPCM latent enthalpy buffering</span>
              </div>
              <Switch
                checked={configuration.usePCM}
                onCheckedChange={(v) => setConfiguration({ usePCM: v })}
                aria-label="Toggle phase change material"
              />
            </div>

            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-ink block">Solar Ray-Tracing & Transmittance</span>
                <span className="text-slate-muted">Clear-sky solar radiation through south aperture</span>
              </div>
              <Switch
                checked={configuration.useSolar}
                onCheckedChange={(v) => setConfiguration({ useSolar: v })}
                aria-label="Toggle solar ray tracing"
              />
            </div>

            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-ink block">Nighttime Natural Flush Ventilation</span>
                <span className="text-slate-muted">High-rate night purge ventilation</span>
              </div>
              <Switch
                checked={configuration.useVentilation}
                onCheckedChange={(v) => setConfiguration({ useVentilation: v })}
                aria-label="Toggle nighttime flush ventilation"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

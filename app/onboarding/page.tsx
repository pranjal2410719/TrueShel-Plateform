"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Package,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { LADAKH_CLIMATE } from "@/lib/mock/repository";

// ── Mock climate fetch (replace with real API in production) ───────────────
function fetchClimateForLocation(lat?: number, lng?: number) {
  void lat;
  void lng;
  return new Promise<typeof LADAKH_CLIMATE>((resolve) =>
    setTimeout(() => resolve(LADAKH_CLIMATE), 2000)
  );
}

// ── Supply catalogue ────────────────────────────────────────────────────────
const SUPPLY_CATALOGUE = [
  { name: "Wood logs", unit: "pieces", description: "Essential for fire & structural framing" },
  { name: "Firestarter", unit: "packs", description: "Ignition source for heat in cold climates" },
  { name: "Tarp / Polyethylene sheet", unit: "sheets", description: "Waterproof roofing & wind barrier" },
  { name: "Rope / Paracord", unit: "metres", description: "Structural binding and lashing" },
  { name: "Insulation blankets", unit: "blankets", description: "Thermal retention layer for walls" },
  { name: "Cooking pot", unit: "pots", description: "Boiling water and food preparation" },
  { name: "Stones / Rocks", unit: "kg", description: "Thermal mass — stores and radiates heat" },
  { name: "Snow blocks", unit: "blocks", description: "Insulating outer wall material (igloos)" },
  { name: "Bamboo / PVC pipes", unit: "pieces", description: "Framework and structural ribs" },
  { name: "Soil / Clay", unit: "kg", description: "Rammed earth filling and adobe construction" },
];

type Step = "location" | "loading" | "supplies" | "complete";

// ── Progress indicator ──────────────────────────────────────────────────────
const STEPS = ["Location", "Climate", "Supplies"] as const;
function StepIndicator({ current }: { current: Step }) {
  const idx = current === "location" ? 0 : current === "loading" ? 1 : current === "supplies" ? 2 : 3;
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5">
            <div
              className={[
                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                i < idx
                  ? "bg-shop-violet text-white"
                  : i === idx
                  ? "border-2 border-shop-violet text-shop-violet"
                  : "border border-border-subtle text-slate-muted",
              ].join(" ")}
            >
              {i < idx ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={[
                "text-xs font-medium hidden sm:inline",
                i === idx ? "text-slate-ink" : "text-slate-muted",
              ].join(" ")}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={["flex-1 h-px", i < idx ? "bg-shop-violet" : "bg-border-subtle"].join(" ")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Main onboarding page ────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { setLocation, setClimate, addSupply, setCompleted } = useOnboardingStore();

  const [step, setStep] = useState<Step>("location");
  const [loadProgress, setLoadProgress] = useState(0);
  const [selectedSupplies, setSelectedSupplies] = useState<Record<string, number>>({});
  const [geoError, setGeoError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  // ── Step 1: Fetch geolocation ─────────────────────────────────────────────
  const startLocationFetch = (lat: number, lng: number) => {
    setGeoError(null);
    setLocation({ latitude: lat, longitude: lng });
    setStep("loading");
    setLoadProgress(10);

    // Simulate progressive loading
    const ticks = [30, 55, 75, 90];
    ticks.forEach((v, i) => {
      setTimeout(() => setLoadProgress(v), (i + 1) * 400);
    });

    fetchClimateForLocation(lat, lng).then((climate) => {
      setLoadProgress(100);
      setClimate({
        altitude: climate.altitude,
        hourlyTemperature: climate.hourlyTemperature,
        hourlySolarIrradiance: climate.hourlySolarIrradiance,
      });
      setLocationLabel(`${climate.location} — ${climate.altitude}m AMSL`);
      setTimeout(() => setStep("supplies"), 400);
    });
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser. Please enter coordinates manually.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => startLocationFetch(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        setGeoError(`Could not retrieve location: ${err.message}. Please enter coordinates manually.`);
      }
    );
  };

  const handleManualCoords = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setGeoError("Please enter valid latitude (−90 to 90) and longitude (−180 to 180).");
      return;
    }
    startLocationFetch(lat, lng);
  };

  // ── Step 2: Supply selection ──────────────────────────────────────────────
  const toggleSupply = (name: string) => {
    setSelectedSupplies((prev) => {
      if (prev[name] !== undefined) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return { ...prev, [name]: 1 };
    });
  };

  const adjustQty = (name: string, delta: number) => {
    setSelectedSupplies((prev) => {
      const next = Math.max(0, (prev[name] ?? 0) + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return { ...prev, [name]: next };
    });
  };

  const handleSuppliesSubmit = () => {
    Object.entries(selectedSupplies).forEach(([name, qty]) => {
      if (qty > 0) addSupply({ name, quantity: qty });
    });
    setCompleted(true);
    setStep("complete");
    setTimeout(() => router.push("/dashboard"), 600);
  };

  // ── Rendering ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-xl space-y-4">
        {/* Branding */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-ink">TRUESHEL</h1>
          <p className="text-sm text-slate-muted mt-1">Passive Shelter Engineering Platform</p>
        </div>

        <Card className="p-6 sm:p-8">
          <StepIndicator current={step} />

          {/* ── Step: Location ───────────────────────────────────────── */}
          {step === "location" && (
            <div className="space-y-6">
              <CardHeader className="p-0">
                <CardTitle>Your Location</CardTitle>
                <CardDescription>
                  We&apos;ll fetch local climate conditions, altitude, and environmental risk factors for your site.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <Button
                  onClick={handleFetchLocation}
                  size="lg"
                  className="w-full"
                  aria-label="Use my current GPS location"
                >
                  <MapPin className="mr-2 w-4 h-4" />
                  Use My Location
                </Button>

                {/* Manual fallback */}
                <div className="relative flex items-center gap-2">
                  <div className="flex-1 h-px bg-border-subtle" />
                  <span className="text-xs text-slate-muted px-2">or enter manually</span>
                  <div className="flex-1 h-px bg-border-subtle" />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 space-y-1">
                    <label htmlFor="lat" className="text-xs font-medium text-slate-muted">Latitude</label>
                    <Input
                      id="lat"
                      type="number"
                      placeholder="34.166"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      step="0.001"
                      aria-label="Latitude"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label htmlFor="lng" className="text-xs font-medium text-slate-muted">Longitude</label>
                    <Input
                      id="lng"
                      type="number"
                      placeholder="77.585"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      step="0.001"
                      aria-label="Longitude"
                    />
                  </div>
                </div>

                {(manualLat || manualLng) && (
                  <Button variant="outline" className="w-full" onClick={handleManualCoords}>
                    Use These Coordinates
                  </Button>
                )}

                {geoError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-card p-3 bg-thermal-hot/10 border border-thermal-hot/30"
                  >
                    <AlertTriangle className="w-4 h-4 text-thermal-hot mt-0.5 shrink-0" />
                    <p className="text-xs text-thermal-hot">{geoError}</p>
                  </div>
                )}
              </CardContent>
            </div>
          )}

          {/* ── Step: Loading ────────────────────────────────────────── */}
          {step === "loading" && (
            <div className="flex flex-col items-center gap-6 py-6">
              <Loader2 className="animate-spin text-shop-violet" size={44} aria-hidden="true" />
              <div className="w-full space-y-2" role="status" aria-label="Loading climate data">
                <div className="flex justify-between text-xs text-slate-muted">
                  <span>Fetching climate profile…</span>
                  <span>{loadProgress}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-warm-fog rounded-pill overflow-hidden">
                  <div
                    className="h-full bg-shop-violet rounded-pill transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-muted text-center">
                  Resolving altitude · solar irradiance · wind exposure · freeze-thaw risk
                </p>
              </div>
            </div>
          )}

          {/* ── Step: Supplies ───────────────────────────────────────── */}
          {step === "supplies" && (
            <div className="space-y-5">
              <CardHeader className="p-0">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-shop-violet" />
                  <CardTitle>What&apos;s in Your Pack?</CardTitle>
                </div>
                {locationLabel && (
                  <Badge variant="violet" className="self-start">{locationLabel}</Badge>
                )}
                <CardDescription className="mt-2">
                  Select available materials. These determine which shelter designs and optimisations the engine can suggest.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {SUPPLY_CATALOGUE.map((item) => {
                    const checked = selectedSupplies[item.name] !== undefined;
                    const qty = selectedSupplies[item.name] ?? 0;
                    return (
                      <div
                        key={item.name}
                        className={[
                          "flex items-start gap-3 p-3 rounded-card border transition-colors cursor-pointer",
                          checked
                            ? "border-shop-violet bg-shop-violet-subtle"
                            : "border-border-subtle bg-surface hover:bg-surface-hover",
                        ].join(" ")}
                        onClick={() => toggleSupply(item.name)}
                        role="checkbox"
                        aria-checked={checked}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && toggleSupply(item.name)}
                      >
                        {/* Checkbox visual */}
                        <div
                          className={[
                            "mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                            checked ? "bg-shop-violet border-shop-violet" : "border-border-subtle",
                          ].join(" ")}
                        >
                          {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-sm font-medium text-slate-ink">{item.name}</span>
                            <span className="text-[11px] text-slate-muted">{item.unit}</span>
                          </div>
                          <p className="text-xs text-slate-muted mt-0.5">{item.description}</p>

                          {/* Quantity stepper */}
                          {checked && (
                            <div
                              className="flex items-center gap-2 mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="w-6 h-6 rounded-full border border-border-subtle flex items-center justify-center hover:bg-surface-hover"
                                onClick={() => adjustQty(item.name, -1)}
                                aria-label={`Decrease ${item.name} quantity`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <Input
                                type="number"
                                min={1}
                                value={qty}
                                onChange={(e) =>
                                  setSelectedSupplies((prev) => ({
                                    ...prev,
                                    [item.name]: Math.max(0, Number(e.target.value)),
                                  }))
                                }
                                className="w-16 h-7 text-center text-xs px-2"
                                aria-label={`${item.name} quantity`}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                className="w-6 h-6 rounded-full border border-border-subtle flex items-center justify-center hover:bg-surface-hover"
                                onClick={() => adjustQty(item.name, 1)}
                                aria-label={`Increase ${item.name} quantity`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs text-slate-muted">
                    {Object.keys(selectedSupplies).length} items selected
                  </span>
                  <Button
                    onClick={handleSuppliesSubmit}
                    disabled={Object.keys(selectedSupplies).length === 0}
                    className="min-w-[180px]"
                  >
                    Continue to Dashboard
                    <ChevronRight className="ml-1.5 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </div>
          )}

          {/* ── Step: Complete ───────────────────────────────────────── */}
          {step === "complete" && (
            <div className="flex flex-col items-center gap-3 py-8" role="status">
              <CheckCircle2 className="w-12 h-12 text-thermal-comfort" />
              <p className="text-sm font-semibold text-slate-ink">All set — launching dashboard…</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

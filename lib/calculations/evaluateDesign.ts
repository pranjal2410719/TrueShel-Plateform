/*
 * lib/calculations/evaluateDesign.ts – Deterministic evaluation of a ShelterDesign
 * Uses the real type definitions from '@/types' and the mock climate data.
 * The calculation is still simplified but respects the required shapes:
 *   – proper SimulationConfiguration & SimulationResult
 *   – ComfortAnalysis, HeatFlowBreakdown, ThermalState values
 *   – autonomy, risk, IDs, timestamps
 */

import {
  computeRValue,
  computeUValue,
  estimateHeatLoss,
  estimateSolarGain,
} from '@/lib/calculations/thermal';
import type {
  ShelterDesign,
  ClimateData,
  SimulationResult,
  SimulationConfiguration,
  ComfortAnalysis,
  HeatFlowBreakdown,
  ThermalState,
} from '@/types';
import { LADAKH_CLIMATE } from '@/lib/mock/repository';
import { v4 as uuidv4 } from 'uuid'; // simple UUID generator (installed via npm)

/** Default simulation configuration – can be overridden when needed */
const DEFAULT_SIM_CONFIG: SimulationConfiguration = {
  durationHours: 24,
  timeStepHours: 1,
  comfortTempMin: 18,
  comfortTempMax: 26,
  useThermalMass: true,
  usePCM: false,
  useSolar: true,
  useVentilation: true,
};

/**
 * Helper: map indoor temperature to a ThermalState string required by the type.
 */
function mapToThermalState(tempC: number, min: number, max: number): ThermalState {
  if (tempC < min) return 'under-comfort';
  if (tempC > max) return 'overheating';
  return 'comfort';
}

/**
 * Evaluate a shelter design for the supplied climate and configuration.
 * Returns a fully typed SimulationResult compatible with the rest of the app.
 */
export function evaluateShelterDesign(
  design: ShelterDesign,
  climate: ClimateData = LADAKH_CLIMATE,
  config: SimulationConfiguration = DEFAULT_SIM_CONFIG,
): SimulationResult {
  const {
    durationHours,
    timeStepHours,
    comfortTempMin,
    comfortTempMax,
    useThermalMass,
    usePCM,
    useSolar,
  } = config;

  const steps = Math.floor(durationHours / timeStepHours);

  // ----- Envelope U‑values ---------------------------------------------------
  const wallU = computeUValue(computeRValue(design.envelope.wall.layers));
  const roofU = computeUValue(computeRValue(design.envelope.roof.layers));
  const floorU = computeUValue(computeRValue(design.envelope.floor.layers));

  // ----- Geometry -----------------------------------------------------------
  const { length, width, height } = design.geometry;
  const floorArea = length * width; // m²
  const wallArea = 2 * (length + width) * height; // m² (all four walls)
  const roofArea = length * width; // projection – simple for flat/gabled approximation

  // ----- Thermal mass (simplified) ------------------------------------------
  // Use level to pick a numeric heat capacity factor (kJ/K).
  const massFactor = useThermalMass
    ? design.thermalMass.level === 'low'
      ? 500
      : design.thermalMass.level === 'medium'
      ? 1000
      : 2000
    : 0; // no thermal mass -> 0 capacity

  // ----- PCM (simplified) ---------------------------------------------------
  const pcmEnabled = usePCM && design.pcm.enabled;

  // ----- Simulation arrays ---------------------------------------------------
  const indoorTemperature: number[] = [];
  const outdoorTemperature: number[] = [];
  const solarIrradiance: number[] = [];
  const heatGain: number[] = [];
  const heatLoss: number[] = [];
  const storage: number[] = [];
  const thermalStates: ThermalState[] = [];

  // Initial indoor temperature – start a few degrees above outdoor for stability.
  let prevIndoor = climate.hourlyTemperature[0] + 5;

  for (let step = 0; step < steps; step++) {
    const hourIdx = step * timeStepHours;
    const outdoor = climate.hourlyTemperature[hourIdx % climate.hourlyTemperature.length];
    const irradiance = climate.hourlySolarIrradiance[hourIdx % climate.hourlySolarIrradiance.length];

    // ---- Solar gain --------------------------------------------------------
    const shgc = 0.6; // generic solar heat‑gain coefficient for glazing
    const solarGain = useSolar ? estimateSolarGain(shgc, irradiance, design.openings.windowArea) : 0;

    // ---- Envelope heat loss ------------------------------------------------
    const deltaT = prevIndoor - outdoor;
    const qWall = estimateHeatLoss(wallU, wallArea, deltaT);
    const qRoof = estimateHeatLoss(roofU, roofArea, deltaT);
    const qFloor = estimateHeatLoss(floorU, floorArea, deltaT);
    const totalLoss = qWall + qRoof + qFloor;

    // ---- Heat balance ------------------------------------------------------
    // Simplified energy balance: Q = m·c·ΔT => ΔT = (gain - loss) / (massFactor * 1000)
    // massFactor is in kJ/K, so convert to J/K by *1000.
    const netEnergy = solarGain - totalLoss; // watts (J/s)
    const dtSeconds = timeStepHours * 3600;
    const deltaTemp = massFactor > 0 ? netEnergy * dtSeconds / (massFactor * 1000) : 0;
    const indoor = prevIndoor + deltaTemp;

    // ---- PCM effect (very coarse) ------------------------------------------
    // If PCM is enabled and indoor crosses melting point, add/subtract latent heat.
    let storageChange = 0;
    if (pcmEnabled) {
      const { meltingPoint, latentHeat, thickness } = design.pcm;
      // Approximate stored energy as latentHeat * mass (kg) where mass = density * volume.
      // Use material density from library; for simplicity assume density = 860 (paraffin).
      const pcmDensity = 860; // kg/m³ (paraffin typical)
      const volume = (design.geometry.length * design.geometry.width * thickness) / 1_000_000; // m³ from mm
      const pcmMass = pcmDensity * volume; // kg
      const energyStored = pcmMass * latentHeat; // kJ
      // If indoor > melting point, assume PCM absorbs latent heat (cooling effect).
      if (indoor > meltingPoint) storageChange = -energyStored / dtSeconds; // negative contribution to netEnergy
      else storageChange = energyStored / dtSeconds; // release heat when below point
    }

    const indoorAdjusted = indoor + storageChange * dtSeconds / (massFactor > 0 ? massFactor * 1000 : 1);

    // Record arrays
    indoorTemperature.push(indoorAdjusted);
    outdoorTemperature.push(outdoor);
    solarIrradiance.push(irradiance);
    heatGain.push(solarGain);
    heatLoss.push(totalLoss);
    storage.push(storageChange);
    thermalStates.push(mapToThermalState(indoorAdjusted, comfortTempMin, comfortTempMax));

    // Prepare for next step
    prevIndoor = indoorAdjusted;
  }

  // ----- Comfort analysis ---------------------------------------------------
  const comfortHours = indoorTemperature.filter(
    (t) => t >= comfortTempMin && t <= comfortTempMax,
  ).length * timeStepHours;
  const underComfortHours = indoorTemperature.filter((t) => t < comfortTempMin).length * timeStepHours;
  const overheatingHours = indoorTemperature.filter((t) => t > comfortTempMax).length * timeStepHours;
  const comfortRatio = comfortHours / durationHours;

  const comfort: ComfortAnalysis = {
    comfortHours,
    underComfortHours,
    overheatingHours,
    comfortRatio,
  };

  // ----- Heat flow breakdown ------------------------------------------------
  const totalHeatLoss = heatLoss.reduce((a, b) => a + b, 0);
  const wallsLoss = heatLoss.reduce((sum, _, i) => {
    const deltaT = indoorTemperature[i] - outdoorTemperature[i];
    return sum + estimateHeatLoss(wallU, wallArea, deltaT);
  }, 0);
  const roofLoss = heatLoss.reduce((sum, _, i) => {
    const deltaT = indoorTemperature[i] - outdoorTemperature[i];
    return sum + estimateHeatLoss(roofU, roofArea, deltaT);
  }, 0);
  const floorLoss = heatLoss.reduce((sum, _, i) => {
    const deltaT = indoorTemperature[i] - outdoorTemperature[i];
    return sum + estimateHeatLoss(floorU, floorArea, deltaT);
  }, 0);

  const heatFlowBreakdown: HeatFlowBreakdown = {
    roof: Math.round((roofLoss / totalHeatLoss) * 100),
    walls: Math.round((wallsLoss / totalHeatLoss) * 100),
    floor: Math.round((floorLoss / totalHeatLoss) * 100),
    windows: 0,
    infiltration: 0,
  };

  // ----- Autonomy (hours until indoor falls below 16°C after the last sunny hour) -----
  const threshold = 16;
  let autonomy = 0;
  for (let i = steps - 1; i >= 0; i--) {
    if (indoorTemperature[i] >= threshold) autonomy++;
    else break;
  }

  // ----- Risk categorisation (simple heuristic) ----------------------------
  let risk: 'low' | 'moderate' | 'high' | 'critical' = 'low';
  if (autonomy < 8) risk = 'critical';
  else if (autonomy < 12) risk = 'high';
  else if (autonomy < 18) risk = 'moderate';
  else risk = 'low';

  // ----- Build result -------------------------------------------------------
  const result: SimulationResult = {
    id: uuidv4(),
    projectId: 'project-1',
    shelterDesignId: design.id,
    configuration: config,
    timeline: Array.from({ length: steps }, (_, i) => i * timeStepHours),
    indoorTemperature,
    outdoorTemperature,
    solarIrradiance,
    heatGain,
    heatLoss,
    storage,
    comfort,
    thermalStates,
    heatFlowBreakdown,
    peakHeatLoss: Math.max(...heatLoss),
    peakSolarGain: Math.max(...solarIrradiance.map((irr) => estimateSolarGain(0.6, irr, design.openings.windowArea))),
    autonomy,
    risk,
    completedAt: new Date().toISOString(),
  };

  return result;
}

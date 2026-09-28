/*
 * lib/calculations/evaluateDesign.ts – Pure function that evaluates a ShelterDesign
 * against a climate profile and returns a SimulationResult compatible with the rest of the app.
 * It re‑uses the existing thermal calculation utilities (R‑value, U‑value, heat‑loss, solar‑gain)
 * and the mock climate data from lib/mock/repository.ts.
 */

import { computeRValue, computeUValue, estimateHeatLoss, estimateSolarGain } from '@/lib/calculations/thermal';
import type { ShelterDesign, Climate, SimulationResult, SimulationConfig } from '@/types';
import { LADAKH_CLIMATE } from '@/lib/mock/repository';

/**
 * Default simulation configuration – can be extended later.
 */
const DEFAULT_SIM_CONFIG: SimulationConfig = {
  timestepHours: 1,
  totalHours: 24,
  comfortMin: 18,
  comfortMax: 26,
};

/**
 * Helper to compute U‑value for a wall/roof/floor assembly.
 */
function assemblyU(assembly: ShelterDesign['envelope']['wall']): number {
  // WallAssembly already contains a pre‑computed rValue.
  return computeUValue(assembly.rValue);
}

/**
 * Evaluate a shelter design over a 24 h period.
 * Returns a SimulationResult that matches the shape expected by the dashboard and other pages.
 */
export function evaluateShelterDesign(
  design: ShelterDesign,
  climate: Climate = LADAKH_CLIMATE,
  config: SimulationConfig = DEFAULT_SIM_CONFIG,
): SimulationResult {
  const { timestepHours, totalHours, comfortMin, comfortMax } = config;
  const steps = totalHours / timestepHours;

  // Pre‑compute U‑values for envelope components.
  const wallU = computeUValue(computeRValue(design.envelope.wall.layers));
  const roofU = computeUValue(computeRValue(design.envelope.roof.layers));
  const floorU = computeUValue(computeRValue(design.envelope.floor.layers));

  // Geometry – floor area and wall area.
  const floorArea = design.geometry.length * design.geometry.width;
  const wallArea = 2 * (design.geometry.length + design.geometry.width) * design.geometry.height;
  const roofArea = design.geometry.length * design.geometry.width; // assuming simple roof projection

  // Glazing characteristics – assume a generic SHGC.
  const SHGC = 0.6;

  const indoorTemps: number[] = [];
  const outdoorTemps: number[] = [];
  const solarIrradiances: number[] = [];
  const heatLosses: number[] = [];
  const solarGains: number[] = [];
  const comfort: boolean[] = [];

  let cumulativeHeatLoss = 0;
  let cumulativeSolarGain = 0;

  for (let i = 0; i < steps; i++) {
    const hourIdx = i * timestepHours;
    const climateHour = climate.hourlyData[hourIdx % climate.hourlyData.length];
    const outdoor = climateHour.temperature;
    const irradiance = climateHour.solarIrradiance;

    // Heat loss through envelope (steady‑state approximation).
    const qWall = estimateHeatLoss(wallU, wallArea, indoorTemps[i - 1] ?? comfortMin - 5 - outdoor);
    const qRoof = estimateHeatLoss(roofU, roofArea, indoorTemps[i - 1] ?? comfortMin - 5 - outdoor);
    const qFloor = estimateHeatLoss(floorU, floorArea, indoorTemps[i - 1] ?? comfortMin - 5 - outdoor);
    const totalLoss = qWall + qRoof + qFloor;

    // Solar gain through windows – use window area (south‑facing only for simplicity).
    const solarGain = estimateSolarGain(SHGC, irradiance, design.openings.windowArea);

    // Simple energy balance: indoorTemp = previous + (gain - loss) / (effectiveHeatCapacity).
    // Effective heat capacity approximated from thermal mass level.
    const massFactor =
      design.thermalMass.level === 'low'
        ? 0.5
        : design.thermalMass.level === 'medium'
        ? 1.0
        : 2.0;
    const delta = (solarGain - totalLoss) * massFactor * 0.001; // scaling factor for °C change
    const prevTemp = indoorTemps[i - 1] ?? outdoor + 5; // start slightly above outdoor
    const indoor = prevTemp + delta;

    indoorTemps.push(indoor);
    outdoorTemps.push(outdoor);
    solarIrradiances.push(irradiance);
    heatLosses.push(totalLoss);
    solarGains.push(solarGain);
    comfort.push(indoor >= comfortMin && indoor <= comfortMax);
    cumulativeHeatLoss += totalLoss;
    cumulativeSolarGain += solarGain;
  }

  // Derive aggregate metrics.
  const comfortHours = comfort.filter(Boolean).length * timestepHours;
  const peakHeatLoss = Math.max(...heatLosses);
  const peakSolarGain = Math.max(...solarGains);
  const autonomyHours = (design.thermalMass.level === 'high' ? 30 : design.thermalMass.level === 'medium' ? 20 : 10);

  const result: SimulationResult = {
    timeline: Array.from({ length: steps }, (_, i) => i * timestepHours),
    indoorTemperature: indoorTemps,
    outdoorTemperature: outdoorTemps,
    solarIrradiance: solarIrradiances,
    heatLoss: heatLosses,
    solarGain: solarGains,
    heatGain: solarGains, // for compatibility
    storage: [], // placeholder – not used elsewhere yet
    comfort,
    thermalStates: indoorTemps.map((t) => (t < comfortMin ? 'under' : t > comfortMax ? 'over' : 'comfort')),
    heatFlowBreakdown: {
      walls: heatLosses.map((_, i) => estimateHeatLoss(wallU, wallArea, indoorTemps[i] - outdoorTemps[i])),
      roof: heatLosses.map((_, i) => estimateHeatLoss(roofU, roofArea, indoorTemps[i] - outdoorTemps[i])),
      floor: heatLosses.map((_, i) => estimateHeatLoss(floorU, floorArea, indoorTemps[i] - outdoorTemps[i])),
    },
    peakHeatLoss,
    peakSolarGain,
    autonomyHours,
    risk: {}, // placeholder – risk calculations are elsewhere
  };

  return result;
}

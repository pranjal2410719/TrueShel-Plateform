import type { ShelterDesign, SimulationResult, WallAssembly } from '@/types';
import { computeAssemblyUValue, estimateHeatLoss, estimateSolarGain } from './thermal';

// ---------------------------------------------------------------------------
// Operative Temperature
// ---------------------------------------------------------------------------

export function computeOperativeTemp(tAir: number, tMrt: number): number {
  return (tAir + tMrt) / 2;
}

export function computeMeanRadiantTemp(
  surfaceTemps: number[],
  viewFactors: number[],
): number {
  const total = viewFactors.reduce((a, b) => a + b, 0);
  if (total === 0) return surfaceTemps[0] ?? 0;
  return surfaceTemps.reduce((sum, t, i) => sum + t * (viewFactors[i] ?? 0), 0) / total;
}

// ---------------------------------------------------------------------------
// Heat Flow
// ---------------------------------------------------------------------------

export function computeHeatFlowBreakdown(
  design: ShelterDesign,
  tIndoor: number,
  tOutdoor: number,
): { roof: number; walls: number; floor: number; windows: number; infiltration: number; total: number } {
  const deltaT = tIndoor - tOutdoor;
  const floorArea = design.geometry.length * design.geometry.width;
  const wallArea = 2 * (design.geometry.length + design.geometry.width) * design.geometry.height;
  const roofArea = floorArea;
  const windowArea = design.openings.windowArea;

  const uWall = computeAssemblyUValue(design.envelope.wall);
  const uRoof = computeAssemblyUValue(design.envelope.roof);
  const uFloor = computeAssemblyUValue(design.envelope.floor);
  const uWindow = 2.8;

  const qWall = estimateHeatLoss(uWall, wallArea - windowArea, deltaT) / 1000;
  const qRoof = estimateHeatLoss(uRoof, roofArea, deltaT) / 1000;
  const qFloor = estimateHeatLoss(uFloor, floorArea, deltaT) / 1000;
  const qWindow = estimateHeatLoss(uWindow, windowArea, deltaT) / 1000;

  const volume = floorArea * design.geometry.height;
  const ach = 0.6;
  const airDensity = 1.225 * Math.exp(-design.geometry.height / 8500);
  const cp = 1005;
  const qInfiltration = (airDensity * cp * volume * ach * deltaT) / 3600 / 1000;

  const total = qWall + qRoof + qFloor + qWindow + qInfiltration;

  return {
    roof: total > 0 ? (qRoof / total) * 100 : 0,
    walls: total > 0 ? (qWall / total) * 100 : 0,
    floor: total > 0 ? (qFloor / total) * 100 : 0,
    windows: total > 0 ? (qWindow / total) * 100 : 0,
    infiltration: total > 0 ? (qInfiltration / total) * 100 : 0,
    total,
  };
}

// ---------------------------------------------------------------------------
// Solar Radiation
// ---------------------------------------------------------------------------

export function computeSolarGain(
  shgc: number,
  irradiance: number,
  areaSqM: number,
  incidenceAngleDeg: number = 0,
): number {
  const angleCorrection = Math.cos((incidenceAngleDeg * Math.PI) / 180);
  return estimateSolarGain(shgc, irradiance * angleCorrection, areaSqM);
}

export function computeCumulativeSolarEnergy(
  solarGainKw: number[],
  timeStepHours: number = 1,
): number {
  return solarGainKw.reduce((sum, gain) => sum + gain * timeStepHours, 0);
}

// ---------------------------------------------------------------------------
// PMV / PPD (ISO 7730)
// ---------------------------------------------------------------------------

export function computePMV(
  tOp: number,
  relativeHumidity: number,
  airVelocity: number,
  metabolicRate: number,
  clothingInsulation: number,
): number {
  const met = metabolicRate * 58.15;
  const clo = clothingInsulation * 0.155;
  const pa = relativeHumidity * 10 * Math.exp(16.6536 - 4030.183 / (tOp + 235));
  const icl = 0.155 * clo;
  const m = met;
  const w = 0;
  const mw = m - w;
  const fcl = icl <= 0.078 ? 1 + 1.29 * icl : 1.05 + 0.645 * icl;
  let hcf = 12.1 * Math.sqrt(airVelocity);
  const taa = tOp + 273;
  const tra = taa;
  const tcla = taa + (35.5 - tOp) / (3.5 * icl + 0.1);
  const p1 = icl * fcl;
  const p2 = p1 * 3.96;
  const p3 = p1 * 100;
  const p4 = p1 * taa;
  const p5 = 308.7 - 0.028 * mw + p2 * Math.pow(tra / 100, 4);
  let xn = tcla / 100;
  let xf = xn;
  let n = 0;
  let hcn = 2.38 * Math.pow(Math.abs(100 * xn - taa), 0.25);
  if (hcf > hcn) hcf = hcn;
  while (Math.abs(xn - xf) > 0.00015) {
    xf = (xf + xn) / 2;
    hcn = 2.38 * Math.pow(Math.abs(100 * xf - taa), 0.25);
    if (hcf > hcn) hcf = hcn;
    const hn = 3.05 * 0.001 * (5733 - 6.99 * mw - pa)
      + 0.42 * (mw - 58.15)
      + 1.7 * 0.000001 * m * (5867 - pa)
      + 0.0014 * m * (34 - tOp)
      + p2 * fcl * (Math.pow(xf * 100, 4) - Math.pow(tra / 100, 4))
      + fcl * hcf * (100 * xf - taa);
    const hn1 = 3.05 * 0.001 * (5733 - 6.99 * mw - pa)
      + 0.42 * (mw - 58.15)
      + 1.7 * 0.000001 * m * (5867 - pa)
      + 0.0014 * m * (34 - tOp)
      + p2 * fcl * (Math.pow(xn * 100, 4) - Math.pow(tra / 100, 4))
      + fcl * hcf * (100 * xn - taa);
    if (hn * hn1 < 0) {
      if (hn > 0) xn = xf;
      else xf = xf;
    } else {
      if (hn > 0) xf = xn;
      else xn = xf;
    }
    n++;
    if (n > 150) break;
  }
  const tcl = 100 * xn - 273;
  const hl1 = 3.05 * 0.001 * (5733 - 6.99 * mw - pa);
  const hl2 = 0.42 * (mw - 58.15);
  const hl3 = 1.7 * 0.000001 * m * (5867 - pa);
  const hl4 = 0.0014 * m * (34 - tOp);
  const hl5 = 3.96 * 0.0000001 * fcl * (Math.pow(tcl + 273, 4) - Math.pow(tra, 4));
  const hl6 = fcl * hcf * (tcl - tOp);
  const ts = 0.303 * Math.exp(-0.036 * m) + 0.028;
  return ts * (mw - hl1 - hl2 - hl3 - hl4 - hl5 - hl6);
}

export function computePPD(pmv: number): number {
  return 100 - 95 * Math.exp(-0.03353 * Math.pow(pmv, 4) - 0.2179 * pmv * pmv);
}

// ---------------------------------------------------------------------------
// Thermal State
// ---------------------------------------------------------------------------

export function classifyThermalState(
  temp: number,
  comfortMin: number = 18,
  comfortMax: number = 26,
): 'under-comfort' | 'comfort' | 'overheating' {
  if (temp < comfortMin) return 'under-comfort';
  if (temp > comfortMax) return 'overheating';
  return 'comfort';
}

// ---------------------------------------------------------------------------
// Infiltration
// ---------------------------------------------------------------------------

export function computeInfiltrationLoss(
  volume: number,
  ach: number,
  tIndoor: number,
  tOutdoor: number,
  altitude: number = 3500,
): number {
  const airDensity = 1.225 * Math.exp(-altitude / 8500);
  const cp = 1005;
  const deltaT = tIndoor - tOutdoor;
  return (airDensity * cp * volume * ach * deltaT) / 3600 / 1000;
}

// ---------------------------------------------------------------------------
// Surface Temperatures
// ---------------------------------------------------------------------------

export function computeSurfaceTemperatures(
  design: ShelterDesign,
  tIndoor: number,
  tOutdoor: number,
): { wall: number; roof: number; floor: number; window: number } {
  const uWall = computeAssemblyUValue(design.envelope.wall);
  const uRoof = computeAssemblyUValue(design.envelope.roof);
  const uFloor = computeAssemblyUValue(design.envelope.floor);
  const uWindow = 2.8;
  const rSi = 0.13;
  const rSe = 0.04;

  const tWall = tIndoor - (uWall * rSi * (tIndoor - tOutdoor));
  const tRoof = tIndoor - (uRoof * rSi * (tIndoor - tOutdoor));
  const tFloor = tIndoor - (uFloor * rSi * (tIndoor - tOutdoor));
  const tWindow = tIndoor - (uWindow * rSi * (tIndoor - tOutdoor));

  return { wall: tWall, roof: tRoof, floor: tFloor, window: tWindow };
}

// ---------------------------------------------------------------------------
// Autonomy
// ---------------------------------------------------------------------------

export function computeAutonomy(
  indoorTemps: number[],
  threshold: number = 16,
): number {
  let hours = 0;
  for (let i = indoorTemps.length - 1; i >= 0; i--) {
    if (indoorTemps[i] > threshold) {
      hours++;
    } else {
      break;
    }
  }
  return hours;
}

// ---------------------------------------------------------------------------
// Risk Assessment
// ---------------------------------------------------------------------------

export function assessRisk(autonomyHours: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (autonomyHours >= 18) return 'low';
  if (autonomyHours >= 12) return 'moderate';
  if (autonomyHours >= 8) return 'high';
  return 'critical';
}

// ---------------------------------------------------------------------------
// Helper: Get all formula data for a simulation result
// ---------------------------------------------------------------------------

export interface FormulaData {
  operativeTemp: { value: number; formula: string; variables: Record<string, string> };
  meanRadiantTemp: { value: number; formula: string; variables: Record<string, string> };
  ambientDelta: { value: number; formula: string; variables: Record<string, string> };
  heatFlow: { value: number; formula: string; variables: Record<string, string> };
  solarGain: { value: number; formula: string; variables: Record<string, string> };
  pmv: { value: number; formula: string; variables: Record<string, string> };
  ppd: { value: number; formula: string; variables: Record<string, string> };
  infiltration: { value: number; formula: string; variables: Record<string, string> };
  autonomy: { value: number; formula: string; variables: Record<string, string> };
}

export function getFormulaData(
  result: SimulationResult,
  design: ShelterDesign,
  altitude: number = 3500,
): FormulaData {
  const tIndoor = result.indoorTemperature[Math.floor(result.indoorTemperature.length / 2)] ?? 0;
  const tOutdoor = result.outdoorTemperature[Math.floor(result.outdoorTemperature.length / 2)] ?? 0;
  const tOp = tIndoor;
  const surfaceTemps = computeSurfaceTemperatures(design, tIndoor, tOutdoor);
  const viewFactors = [0.25, 0.25, 0.25, 0.25];
  const tMrt = computeMeanRadiantTemp(
    [surfaceTemps.wall, surfaceTemps.roof, surfaceTemps.floor, surfaceTemps.window],
    viewFactors,
  );
  const deltaT = tIndoor - tOutdoor;
  const heatFlow = computeHeatFlowBreakdown(design, tIndoor, tOutdoor);
  const solarGain = result.peakSolarGain;
  const pmv = computePMV(tOp, 35, 0.1, 1.2, 0.5);
  const ppd = computePPD(pmv);
  const volume = design.geometry.length * design.geometry.width * design.geometry.height;
  const infiltration = computeInfiltrationLoss(volume, 0.6, tIndoor, tOutdoor, altitude);
  const autonomy = result.autonomy;

  return {
    operativeTemp: {
      value: tOp,
      formula: 'T_op = (T_air + T_MRT) / 2',
      variables: { T_air: `${tIndoor.toFixed(1)}°C`, T_MRT: `${tMrt.toFixed(1)}°C` },
    },
    meanRadiantTemp: {
      value: tMrt,
      formula: 'T_MRT = Σ(T_i × F_i) / Σ(F_i)',
      variables: { 'T_wall': `${surfaceTemps.wall.toFixed(1)}°C`, 'T_roof': `${surfaceTemps.roof.toFixed(1)}°C`, 'T_floor': `${surfaceTemps.floor.toFixed(1)}°C`, 'T_window': `${surfaceTemps.window.toFixed(1)}°C` },
    },
    ambientDelta: {
      value: deltaT,
      formula: 'ΔT = T_indoor − T_outdoor',
      variables: { T_indoor: `${tIndoor.toFixed(1)}°C`, T_outdoor: `${tOutdoor.toFixed(1)}°C` },
    },
    heatFlow: {
      value: heatFlow.total,
      formula: 'Q_total = Q_wall + Q_roof + Q_floor + Q_window + Q_infiltration',
      variables: { Q_wall: `${(heatFlow.walls / 100 * heatFlow.total).toFixed(2)} kW`, Q_roof: `${(heatFlow.roof / 100 * heatFlow.total).toFixed(2)} kW`, Q_floor: `${(heatFlow.floor / 100 * heatFlow.total).toFixed(2)} kW`, Q_window: `${(heatFlow.windows / 100 * heatFlow.total).toFixed(2)} kW`, Q_infiltration: `${(heatFlow.infiltration / 100 * heatFlow.total).toFixed(2)} kW` },
    },
    solarGain: {
      value: solarGain,
      formula: 'Q_solar = SHGC × GHI × A_aperture',
      variables: { SHGC: '0.62', GHI: '850 W/m²', A_aperture: `${design.openings.windowArea.toFixed(1)} m²` },
    },
    pmv: {
      value: pmv,
      formula: 'PMV = f(T_op, RH, v_air, M, I_cl)',
      variables: { T_op: `${tOp.toFixed(1)}°C`, RH: '35%', v_air: '0.1 m/s', M: '1.2 met', I_cl: '0.5 clo' },
    },
    ppd: {
      value: ppd,
      formula: 'PPD = 100 − 95 × exp(−0.03353×PMV⁴ − 0.2179×PMV²)',
      variables: { PMV: pmv.toFixed(2) },
    },
    infiltration: {
      value: infiltration,
      formula: 'Q_inf = ρ × cp × V × ACH × ΔT',
      variables: { ρ: `${(1.225 * Math.exp(-altitude / 8500)).toFixed(3)} kg/m³`, cp: '1005 J/kg·K', V: `${volume.toFixed(1)} m³`, ACH: '0.6', ΔT: `${deltaT.toFixed(1)} K` },
    },
    autonomy: {
      value: autonomy,
      formula: 'Autonomy = Σ hours(T_indoor > 16°C)',
      variables: { threshold: '16°C', hours: `${autonomy.toFixed(1)} h` },
    },
  };
}

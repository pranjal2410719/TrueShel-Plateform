/**
 * lib/calculations/thermal.ts — Pure thermal calculation utilities
 * Conforms to types/material.ts (ThermalMaterial, WallLayer, WallAssembly).
 */

import type { ThermalMaterial, WallLayer, WallAssembly } from '@/types';

// ---------------------------------------------------------------------------
// R-value computation
// ---------------------------------------------------------------------------

/**
 * Compute the total thermal resistance (R-value, m²·K/W) of a WallAssembly's layers.
 * R = Σ (thickness_m / thermalConductivity) for each layer.
 * Surface resistances are NOT included — add Rsi + Rse separately.
 */
export function computeRValue(layers: WallLayer[]): number {
  return layers.reduce((sum, layer) => {
    const thicknessM = layer.thickness / 1000;
    return sum + thicknessM / layer.material.thermalConductivity;
  }, 0);
}

// ---------------------------------------------------------------------------
// U-value
// ---------------------------------------------------------------------------

/**
 * Convert total R-value to U-value (W/m²·K).
 * Includes standard ISO 6946 surface resistances:
 *   Rsi = 0.13 m²K/W (interior), Rse = 0.04 m²K/W (exterior)
 */
export function computeUValue(rValue: number): number {
  const Rsi = 0.13;
  const Rse = 0.04;
  const totalR = Rsi + rValue + Rse;
  if (totalR <= 0) return Infinity;
  return 1 / totalR;
}

/**
 * Compute the U-value directly from a WallAssembly (convenience wrapper).
 */
export function computeAssemblyUValue(assembly: WallAssembly): number {
  return computeUValue(assembly.rValue);
}

// ---------------------------------------------------------------------------
// Per-layer thermal resistance
// ---------------------------------------------------------------------------

/**
 * Thermal resistance of a single material at given thickness.
 * @param material     ThermalMaterial with thermalConductivity in W/(m·K)
 * @param thicknessMm  Thickness in millimetres
 * @returns            R-value in m²·K/W
 */
export function computeThermalResistance(material: ThermalMaterial, thicknessMm: number): number {
  if (material.thermalConductivity <= 0) return 0;
  return thicknessMm / 1000 / material.thermalConductivity;
}

// ---------------------------------------------------------------------------
// Temperature → CSS colour token mapping
// ---------------------------------------------------------------------------

export type ThermalColorToken =
  | 'thermal-cold'
  | 'thermal-comfort'
  | 'thermal-warn'
  | 'thermal-hot';

/**
 * Returns a CSS colour token name based on indoor temperature vs. comfort band.
 * All tokens are defined in styles/tokens.css as --color-thermal-*.
 *
 * @param tempC        Current indoor temperature in °C
 * @param minComfort   Lower comfort boundary (default 18°C)
 * @param maxComfort   Upper comfort boundary (default 26°C)
 */
export function getTemperatureColorToken(
  tempC: number,
  minComfort: number = 18,
  maxComfort: number = 26,
): ThermalColorToken {
  if (tempC < minComfort) return 'thermal-cold';
  if (tempC <= maxComfort) return 'thermal-comfort';
  if (tempC <= maxComfort + 4) return 'thermal-warn';
  return 'thermal-hot';
}

/**
 * Returns the full CSS custom property reference for the temperature colour.
 * e.g. `"var(--color-thermal-cold)"`
 */
export function getTemperatureColor(
  tempC: number,
  minComfort: number = 18,
  maxComfort: number = 26,
): string {
  const token = getTemperatureColorToken(tempC, minComfort, maxComfort);
  return `var(--color-${token})`;
}

// ---------------------------------------------------------------------------
// Three.js hex colour for temperature (no hardcoded hex outside tokens)
// All colour values below are sourced from styles/tokens.css
// ---------------------------------------------------------------------------

/**
 * Maps a temperature to a Three.js-compatible packed hex integer.
 * Colours sourced from CSS tokens:
 *   thermal-cold    #3b82f6
 *   thermal-comfort #22c55e
 *   thermal-warn    #f59e0b
 *   thermal-hot     #ef4444
 *
 * @returns Packed RGB integer suitable for THREE.Color
 */
export function getTemperatureHex(
  tempC: number,
  minComfort: number = 18,
  maxComfort: number = 26,
): number {
  // Token-sourced hex values — DO NOT change without updating tokens.css
  const COLD    = 0x3b82f6; // --color-thermal-cold
  const COMFORT = 0x22c55e; // --color-thermal-comfort
  const WARN    = 0xf59e0b; // --color-thermal-warn
  const HOT     = 0xef4444; // --color-thermal-hot

  const coldFloor = minComfort - 10;

  if (tempC <= coldFloor)    return COLD;
  if (tempC < minComfort) {
    const t = (tempC - coldFloor) / 10;
    return lerpColor(COLD, COMFORT, t);
  }
  if (tempC <= maxComfort)   return COMFORT;
  if (tempC <= maxComfort + 4) {
    const t = (tempC - maxComfort) / 4;
    return lerpColor(COMFORT, WARN, t);
  }
  const t = Math.min((tempC - maxComfort - 4) / 4, 1);
  return lerpColor(WARN, HOT, t);
}

/** Linear interpolation between two packed RGB hex colours. */
function lerpColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8)  & 0xff;
  const ab = a         & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8)  & 0xff;
  const bb = b         & 0xff;
  const r  = Math.round(ar + (br - ar) * t);
  const g  = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bv;
}

// ---------------------------------------------------------------------------
// Steady-state heat loss estimate
// ---------------------------------------------------------------------------

/**
 * Estimate steady-state conductive heat loss through an assembly element.
 * Q = U × A × ΔT  (watts)
 *
 * @param uValue   W/(m²·K)
 * @param areaSqM  Element area in m²
 * @param deltaTK  Temperature difference (T_indoor − T_outdoor) in K
 * @returns        Heat loss in watts
 */
export function estimateHeatLoss(uValue: number, areaSqM: number, deltaTK: number): number {
  return uValue * areaSqM * deltaTK;
}

// ---------------------------------------------------------------------------
// Solar gain estimate
// ---------------------------------------------------------------------------

/**
 * Estimate instantaneous solar heat gain through a glazing element.
 * Q = SHGC × irradiance × area  (watts)
 *
 * @param shgc        Solar Heat Gain Coefficient (0–1)
 * @param irradiance  Incident irradiance in W/m²
 * @param areaSqM     Glazing area in m²
 * @returns           Gain in watts
 */
export function estimateSolarGain(shgc: number, irradiance: number, areaSqM: number): number {
  return shgc * irradiance * areaSqM;
}

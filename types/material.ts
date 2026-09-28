/**
 * Thermal material and wall assembly types for TRUESHEL V2.
 * All thermal property values use SI units.
 */

export interface ThermalMaterial {
  id: string;
  name: string;
  category: 'insulation' | 'structural' | 'finish' | 'composite' | 'pcm';
  /** Thermal conductivity k in W/m·K */
  thermalConductivity: number;
  /** Density ρ in kg/m³ */
  density: number;
  /** Specific heat capacity Cp in J/kg·K */
  specificHeat: number;
  /** Emissivity ε, dimensionless 0–1 */
  emissivity: number;
  /** Solar absorptivity α, dimensionless 0–1 */
  solarAbsorptivity: number;
  /** Default layer thickness in mm */
  defaultThickness: number;
}

export interface WallLayer {
  id: string;
  material: ThermalMaterial;
  /** Actual thickness in mm */
  thickness: number;
  /** Position order from exterior (0) to interior (n) */
  order: number;
}

export interface WallAssembly {
  id: string;
  name: string;
  layers: WallLayer[];
  /** Computed thermal resistance in m²K/W */
  rValue: number;
  /** Computed thermal transmittance in W/m²K */
  uValue: number;
}

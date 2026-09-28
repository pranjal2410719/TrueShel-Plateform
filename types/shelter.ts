/**
 * Shelter design types for TRUESHEL V2.
 * Encodes geometry, envelope assemblies, openings, thermal mass, and PCM configuration.
 */

import { WallAssembly } from './material';

export type Orientation =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest';

export type ThermalMassLevel = 'low' | 'medium' | 'high';
export type VentilationMode = 'natural' | 'controlled' | 'mechanical' | 'none';

export interface ShelterGeometry {
  /** Internal length in meters */
  length: number;
  /** Internal width in meters */
  width: number;
  /** Wall height to eave in meters */
  height: number;
  roofType: 'flat' | 'gabled' | 'shed';
}

export interface ShelterOpenings {
  /** Total glazed area in m² */
  windowArea: number;
  windowCount: number;
  doorCount: number;
  windowOrientation: Orientation;
}

export interface ThermalMassConfig {
  level: ThermalMassLevel;
  material: string;
  /** Effective thickness of thermal mass element in mm */
  thickness: number;
}

export interface PCMConfig {
  enabled: boolean;
  /** Phase-change melting point in °C */
  meltingPoint: number;
  /** Latent heat of fusion in kJ/kg */
  latentHeat: number;
  /** PCM layer thickness in mm */
  thickness: number;
  location: 'wall' | 'ceiling' | 'floor';
}

export interface ShelterEnvelope {
  wall: WallAssembly;
  roof: WallAssembly;
  floor: WallAssembly;
}

export interface ShelterDesign {
  id: string;
  name: string;
  geometry: ShelterGeometry;
  orientation: Orientation;
  envelope: ShelterEnvelope;
  openings: ShelterOpenings;
  thermalMass: ThermalMassConfig;
  pcm: PCMConfig;
  shadingEnabled: boolean;
  ventilationMode: VentilationMode;
  createdAt: string;
  updatedAt: string;
}

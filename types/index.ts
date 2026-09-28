/**
 * types/index.ts — central barrel for all TRUESHEL V2 domain types.
 * Import from '@/types' throughout the application.
 */

export * from './climate';
export * from './material';
export * from './shelter';
export * from './simulation';
export * from './recommendation';
export * from './resilience';

/** Visualisation mode for the 3D thermal twin viewer. */
export type ThermalTwinMode = 'normal' | 'thermal' | 'heat-flow' | 'solar' | 'storage';


// ---------------------------------------------------------------------------
// Top-level application state shapes
// ---------------------------------------------------------------------------

import type { ClimateData } from './climate';
import type { ShelterDesign } from './shelter';
import type { SimulationResult, SimulationState } from './simulation';
import type { Recommendation } from './recommendation';
import type { ResilienceAssessment } from './resilience';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectState {
  project: Project;
  climate: ClimateData;
  shelter: ShelterDesign;
  simulation: SimulationState;
  comparison: {
    designA: ShelterDesign | null;
    designB: ShelterDesign | null;
    resultA: SimulationResult | null;
    resultB: SimulationResult | null;
  };
  optimization: {
    status: 'idle' | 'running' | 'complete';
    objective: string;
    variables: string[];
    constraints: Record<string, number>;
    result: ShelterDesign | null;
    candidatesEvaluated: number;
    feasibleDesigns: number;
  };
  recommendation: Recommendation | null;
  resilience: ResilienceAssessment | null;
  thermalTwin: {
    activeTimestep: number;
    mode: 'normal' | 'thermal' | 'heat-flow' | 'solar' | 'storage';
    isPlaying: boolean;
    selectedComponent: string | null;
  };
}

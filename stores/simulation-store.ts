/**
 * stores/simulation-store.ts — Simulation state store
 * Conforms to SimulationState and SimulationResult from @/types.
 * Seeded with mock Ladakh result on initialisation.
 */

'use client';

import { create } from 'zustand';
import { LADAKH_SIMULATION_RESULT } from '@/lib/mock/repository';
import type {
  SimulationConfiguration,
  SimulationResult,
  SimulationStatus,
  SimulationState,
} from '@/types';

// ---------------------------------------------------------------------------
// Store state — extends SimulationState with actions
// ---------------------------------------------------------------------------

interface SimulationStoreState extends SimulationState {
  // --- Actions ---
  setConfiguration: (patch: Partial<SimulationConfiguration>) => void;
  startSimulation: () => void;
  updateProgress: (progress: number, stepLabel: string) => void;
  setResult: (result: SimulationResult) => void;
  setError: (message: string) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Default configuration
// ---------------------------------------------------------------------------

const DEFAULT_CONFIGURATION: SimulationConfiguration = {
  durationHours: 24,
  timeStepHours: 1,
  comfortTempMin: 18,
  comfortTempMax: 26,
  useThermalMass: true,
  usePCM: true,
  useSolar: true,
  useVentilation: true,
};

// ---------------------------------------------------------------------------
// Initial state — seeded with mock result so UI renders immediately
// ---------------------------------------------------------------------------

const SEEDED_STATE: SimulationState = {
  status: 'complete' as SimulationStatus,
  configuration: DEFAULT_CONFIGURATION,
  result: LADAKH_SIMULATION_RESULT,
  progress: 100,
  currentStep: null,
  error: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSimulationStore = create<SimulationStoreState>()((set) => ({
  ...SEEDED_STATE,

  setConfiguration: (patch) =>
    set((state) => ({
      configuration: { ...state.configuration, ...patch },
      // Invalidate result if config changes after a complete run
      status: state.status === 'complete' ? 'idle' : state.status,
    })),

  startSimulation: () =>
    set({
      status: 'running',
      progress: 0,
      currentStep: 'Initialising…',
      error: null,
      result: null,
    }),

  updateProgress: (progress, stepLabel) =>
    set({
      progress: Math.round(Math.min(Math.max(progress, 0), 100)),
      currentStep: stepLabel,
    }),

  setResult: (result) =>
    set({
      status: 'complete',
      result,
      progress: 100,
      currentStep: null,
      error: null,
    }),

  setError: (message) =>
    set({
      status: 'error',
      error: message,
      currentStep: null,
    }),

  reset: () =>
    set({
      status: 'idle',
      progress: 0,
      currentStep: null,
      error: null,
      result: null,
      configuration: DEFAULT_CONFIGURATION,
    }),
}));

// ---------------------------------------------------------------------------
// Selectors (hooks)
// ---------------------------------------------------------------------------

/** Current simulation status */
export const useSimulationStatus = (): SimulationStatus =>
  useSimulationStore((s) => s.status);

/** 0–100 progress value */
export const useSimulationProgress = (): number =>
  useSimulationStore((s) => s.progress);

/** Human-readable current step label (null when idle/complete) */
export const useSimulationCurrentStep = (): string | null =>
  useSimulationStore((s) => s.currentStep);

/** Error message (null if none) */
export const useSimulationError = (): string | null =>
  useSimulationStore((s) => s.error);

/** Full simulation configuration */
export const useSimulationConfiguration = (): SimulationConfiguration =>
  useSimulationStore((s) => s.configuration);

/** Full result (null until complete) */
export const useSimulationResult = (): SimulationResult | null =>
  useSimulationStore((s) => s.result);

/** Whether a result is currently available */
export const useHasResult = (): boolean =>
  useSimulationStore((s) => s.result !== null);

/** Indoor temperature time-series (empty array if no result) */
export const useIndoorTemperatureTimeseries = (): number[] =>
  useSimulationStore((s) => s.result?.indoorTemperature ?? []);

/** Comfort analysis from result (null if no result) */
export const useComfortAnalysis = () =>
  useSimulationStore((s) => s.result?.comfort ?? null);

/** Risk level from result (null if no result) */
export const useSimulationRisk = () =>
  useSimulationStore((s) => s.result?.risk ?? null);

/** Whether the simulation is currently running */
export const useIsSimulating = (): boolean =>
  useSimulationStore((s) => s.status === 'running');

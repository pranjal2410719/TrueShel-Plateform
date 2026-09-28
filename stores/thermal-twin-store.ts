/**
 * stores/thermal-twin-store.ts — Thermal twin visualisation state
 * Controls active timestep, visualisation mode, playback, and
 * selected building component. Derives data from simulation-store.
 */

'use client';

import { create } from 'zustand';
import { useSimulationStore } from './simulation-store';
import type { ThermalState } from '@/types';

export type ThermalTwinMode = 'normal' | 'thermal' | 'heat-flow' | 'solar' | 'storage';

// ---------------------------------------------------------------------------
// State & actions interface
// ---------------------------------------------------------------------------

interface ThermalTwinStoreState {
  /** Active hour index 0–23 */
  activeTimestep: number;
  /** Current visualisation mode */
  mode: ThermalTwinMode;
  /** Whether the 24-hour playback animation is running */
  isPlaying: boolean;
  /** ID of the selected building component (null = none) */
  selectedComponent: string | null;

  // --- Actions ---
  setTimestep: (step: number) => void;
  setMode: (mode: ThermalTwinMode) => void;
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  selectComponent: (id: string | null) => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useThermalTwinStore = create<ThermalTwinStoreState>()((set) => ({
  activeTimestep: 12, // Start at solar noon — best initial visualisation
  mode: 'thermal',
  isPlaying: false,
  selectedComponent: null,

  setTimestep: (step) =>
    set({ activeTimestep: Math.max(0, Math.min(23, step)) }),

  setMode: (mode) =>
    set({ mode }),

  play: () =>
    set({ isPlaying: true }),

  pause: () =>
    set({ isPlaying: false }),

  togglePlayback: () =>
    set((state) => ({ isPlaying: !state.isPlaying })),

  selectComponent: (id) =>
    set({ selectedComponent: id }),

  stepForward: () =>
    set((state) => ({
      activeTimestep: (state.activeTimestep + 1) % 24,
    })),

  stepBackward: () =>
    set((state) => ({
      activeTimestep: (state.activeTimestep - 1 + 24) % 24,
    })),

  reset: () =>
    set({
      activeTimestep: 0,
      mode: 'thermal',
      isPlaying: false,
      selectedComponent: null,
    }),
}));

// ---------------------------------------------------------------------------
// Derived data — cross-store read via getState() (non-reactive, call-time only)
// ---------------------------------------------------------------------------

export interface TimestepSnapshot {
  timestep: number;
  indoorTemp: number | null;
  outdoorTemp: number | null;
  solarIrradiance: number | null;
  heatGain: number | null;
  heatLoss: number | null;
  storage: number | null;
  thermalState: ThermalState | null;
}

/**
 * Returns the full temperature/energy snapshot for the active timestep.
 * Uses Zustand getState() — NOT a React hook. Safe to call in Three.js
 * render loops and imperative contexts.
 */
export function getCurrentTemperatureData(): TimestepSnapshot {
  const { activeTimestep } = useThermalTwinStore.getState();
  const { result } = useSimulationStore.getState();

  if (!result) {
    return {
      timestep: activeTimestep,
      indoorTemp: null,
      outdoorTemp: null,
      solarIrradiance: null,
      heatGain: null,
      heatLoss: null,
      storage: null,
      thermalState: null,
    };
  }

  return {
    timestep: activeTimestep,
    indoorTemp: result.indoorTemperature[activeTimestep] ?? null,
    outdoorTemp: result.outdoorTemperature[activeTimestep] ?? null,
    solarIrradiance: result.solarIrradiance[activeTimestep] ?? null,
    heatGain: result.heatGain[activeTimestep] ?? null,
    heatLoss: result.heatLoss[activeTimestep] ?? null,
    storage: result.storage[activeTimestep] ?? null,
    thermalState: result.thermalStates[activeTimestep] ?? null,
  };
}

// ---------------------------------------------------------------------------
// React hooks — subscribe to specific slices to minimise re-renders
// ---------------------------------------------------------------------------

/** Active hour index (0–23) */
export const useActiveTimestep = () =>
  useThermalTwinStore((s) => s.activeTimestep);

/** Current visualisation mode */
export const useThermalTwinMode = () =>
  useThermalTwinStore((s) => s.mode);

/** Whether 24h playback is running */
export const useIsPlaying = () =>
  useThermalTwinStore((s) => s.isPlaying);

/** Currently selected building component ID */
export const useSelectedComponent = () =>
  useThermalTwinStore((s) => s.selectedComponent);

/**
 * Hook: indoor temperature at the active timestep.
 * Subscribes to both twin store (timestep) and simulation store (result).
 */
export function useActiveIndoorTemperature(): number | null {
  const timestep = useThermalTwinStore((s) => s.activeTimestep);
  const result = useSimulationStore((s) => s.result);
  return result?.indoorTemperature[timestep] ?? null;
}

/**
 * Hook: outdoor temperature at the active timestep.
 */
export function useActiveOutdoorTemperature(): number | null {
  const timestep = useThermalTwinStore((s) => s.activeTimestep);
  const result = useSimulationStore((s) => s.result);
  return result?.outdoorTemperature[timestep] ?? null;
}

/**
 * Hook: solar irradiance (W/m²) at the active timestep.
 */
export function useActiveSolarIrradiance(): number | null {
  const timestep = useThermalTwinStore((s) => s.activeTimestep);
  const result = useSimulationStore((s) => s.result);
  return result?.solarIrradiance[timestep] ?? null;
}

/**
 * Hook: thermal state classification at the active timestep.
 */
export function useActiveThermalState(): ThermalState | null {
  const timestep = useThermalTwinStore((s) => s.activeTimestep);
  const result = useSimulationStore((s) => s.result);
  return result?.thermalStates[timestep] ?? null;
}

/**
 * Hook: complete timestep snapshot (all channels). Use only when you need
 * multiple values simultaneously to avoid multiple store subscriptions.
 */
export function useActiveTimestepSnapshot(): TimestepSnapshot {
  const timestep = useThermalTwinStore((s) => s.activeTimestep);
  const result = useSimulationStore((s) => s.result);

  if (!result) {
    return {
      timestep,
      indoorTemp: null,
      outdoorTemp: null,
      solarIrradiance: null,
      heatGain: null,
      heatLoss: null,
      storage: null,
      thermalState: null,
    };
  }

  return {
    timestep,
    indoorTemp: result.indoorTemperature[timestep] ?? null,
    outdoorTemp: result.outdoorTemperature[timestep] ?? null,
    solarIrradiance: result.solarIrradiance[timestep] ?? null,
    heatGain: result.heatGain[timestep] ?? null,
    heatLoss: result.heatLoss[timestep] ?? null,
    storage: result.storage[timestep] ?? null,
    thermalState: result.thermalStates[timestep] ?? null,
  };
}

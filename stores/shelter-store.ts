/**
 * stores/shelter-store.ts — Shelter design store
 * Persisted via localStorage. Conforms to ShelterDesign from @/types.
 *
 * Covers: geometry, orientation, envelope, openings, thermal mass, PCM.
 * Actions are granular to minimise unnecessary re-renders.
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SHELTER_DESIGN } from '@/lib/mock/repository';
import type {
  ShelterDesign,
  ShelterGeometry,
  Orientation,
  ShelterEnvelope,
  ShelterOpenings,
  ThermalMassConfig,
  PCMConfig,
  VentilationMode,
} from '@/types';

// ---------------------------------------------------------------------------
// State & actions interface
// ---------------------------------------------------------------------------

interface ShelterStoreState {
  // --- Data ---
  design: ShelterDesign;
  /** True if the design has unsaved local changes */
  isDirty: boolean;

  // --- Geometry ---
  updateGeometry: (patch: Partial<ShelterGeometry>) => void;

  // --- Orientation ---
  updateOrientation: (orientation: Orientation) => void;

  // --- Envelope ---
  updateEnvelope: (patch: Partial<ShelterEnvelope>) => void;

  // --- Openings ---
  updateOpenings: (patch: Partial<ShelterOpenings>) => void;

  // --- Thermal mass ---
  updateThermalMass: (patch: Partial<ThermalMassConfig>) => void;

  // --- PCM ---
  updatePCM: (patch: Partial<PCMConfig>) => void;

  // --- Ventilation ---
  updateVentilationMode: (mode: VentilationMode) => void;

  // --- Shading ---
  setShadingEnabled: (enabled: boolean) => void;

  // --- Persistence ---
  saveDesign: () => void;
  resetToDefault: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useShelterStore = create<ShelterStoreState>()(
  persist(
    (set, get) => ({
      design: DEFAULT_SHELTER_DESIGN,
      isDirty: false,

      // --- Geometry ---
      // Drop non-finite / non-positive values so a bad input (or a NaN
      // persisted by an older version) can never poison the 3D model or
      // downstream calculations.
      updateGeometry: (patch) =>
        set((state) => {
          const clean: Partial<ShelterGeometry> = {};
          for (const [key, value] of Object.entries(patch)) {
            if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
              (clean as Record<string, number>)[key] = value;
            }
          }
          if (Object.keys(clean).length === 0) return state;
          return {
            isDirty: true,
            design: {
              ...state.design,
              geometry: { ...state.design.geometry, ...clean },
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      // --- Orientation ---
      updateOrientation: (orientation) =>
        set((state) => ({
          isDirty: true,
          design: {
            ...state.design,
            orientation,
            updatedAt: new Date().toISOString(),
          },
        })),

      // --- Envelope ---
      updateEnvelope: (patch) =>
        set((state) => ({
          isDirty: true,
          design: {
            ...state.design,
            envelope: { ...state.design.envelope, ...patch },
            updatedAt: new Date().toISOString(),
          },
        })),

      // --- Openings ---
      updateOpenings: (patch) =>
        set((state) => ({
          isDirty: true,
          design: {
            ...state.design,
            openings: { ...state.design.openings, ...patch },
            updatedAt: new Date().toISOString(),
          },
        })),

      // --- Thermal mass ---
      updateThermalMass: (patch) =>
        set((state) => ({
          isDirty: true,
          design: {
            ...state.design,
            thermalMass: { ...state.design.thermalMass, ...patch },
            updatedAt: new Date().toISOString(),
          },
        })),

      // --- PCM ---
      updatePCM: (patch) =>
        set((state) => ({
          isDirty: true,
          design: {
            ...state.design,
            pcm: { ...state.design.pcm, ...patch },
            updatedAt: new Date().toISOString(),
          },
        })),

      // --- Ventilation ---
      updateVentilationMode: (mode) =>
        set((state) => ({
          isDirty: true,
          design: {
            ...state.design,
            ventilationMode: mode,
            updatedAt: new Date().toISOString(),
          },
        })),

      // --- Shading ---
      setShadingEnabled: (enabled) =>
        set((state) => ({
          isDirty: true,
          design: {
            ...state.design,
            shadingEnabled: enabled,
            updatedAt: new Date().toISOString(),
          },
        })),

      // --- Save (marks clean, stamps updatedAt) ---
      saveDesign: () => {
        const { design } = get();
        set({
          isDirty: false,
          design: { ...design, updatedAt: new Date().toISOString() },
        });
      },

      // --- Reset ---
      resetToDefault: () =>
        set({ design: DEFAULT_SHELTER_DESIGN, isDirty: false }),
    }),
    {
      name: 'trueshel-shelter-store',
      version: 1,
    },
  ),
);

// ---------------------------------------------------------------------------
// Selectors (hooks)
// ---------------------------------------------------------------------------

/** Full shelter design */
export const useShelterDesign = () => useShelterStore((s) => s.design);

/** Whether the current design has unsaved changes */
export const useShelterIsDirty = () => useShelterStore((s) => s.isDirty);

/** Geometry sub-slice */
export const useGeometry = () => useShelterStore((s) => s.design.geometry);

/** Orientation */
export const useOrientation = () => useShelterStore((s) => s.design.orientation);

/** Envelope (wall/roof/floor assemblies) */
export const useEnvelope = () => useShelterStore((s) => s.design.envelope);

/** Wall assembly */
export const useWallAssembly = () => useShelterStore((s) => s.design.envelope.wall);

/** Roof assembly */
export const useRoofAssembly = () => useShelterStore((s) => s.design.envelope.roof);

/** Floor assembly */
export const useFloorAssembly = () => useShelterStore((s) => s.design.envelope.floor);

/** Openings config */
export const useOpenings = () => useShelterStore((s) => s.design.openings);

/** Thermal mass config */
export const useThermalMass = () => useShelterStore((s) => s.design.thermalMass);

/** PCM config */
export const usePCM = () => useShelterStore((s) => s.design.pcm);

/** Ventilation mode */
export const useVentilationMode = () => useShelterStore((s) => s.design.ventilationMode);

/** Shading enabled flag */
export const useShadingEnabled = () => useShelterStore((s) => s.design.shadingEnabled);

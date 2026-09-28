/**
 * stores/project-store.ts — Project metadata store
 * Persisted via localStorage. Selectors exported as hooks.
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PROJECT } from '@/lib/mock/repository';
import type { Project } from '@/types';

// ---------------------------------------------------------------------------
// State & actions interface
// ---------------------------------------------------------------------------

interface ProjectStoreState {
  // --- Data ---
  project: Project;
  selectedShelterDesignId: string;
  selectedSimulationResultId: string | null;

  // --- Actions ---
  setProject: (project: Project) => void;
  /** Patch only the fields that exist on Project (name, description). */
  updateProjectMeta: (patch: Partial<Pick<Project, 'name' | 'description'>>) => void;
  selectShelterDesign: (id: string) => void;
  selectSimulationResult: (id: string | null) => void;
  resetProject: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState = {
  project: DEFAULT_PROJECT,
  selectedShelterDesignId: 'shelter-001',
  selectedSimulationResultId: 'sim-ladakh-001',
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setProject: (project) =>
        set({ project }),

      updateProjectMeta: (patch) =>
        set((state) => ({
          project: {
            ...state.project,
            ...patch,
            updatedAt: new Date().toISOString(),
          },
        })),

      selectShelterDesign: (id) =>
        set({ selectedShelterDesignId: id }),

      selectSimulationResult: (id) =>
        set({ selectedSimulationResultId: id }),

      resetProject: () =>
        set({ ...initialState }),
    }),
    {
      name: 'trueshel-project-store',
      version: 1,
    },
  ),
);

// ---------------------------------------------------------------------------
// Selectors (hooks)
// ---------------------------------------------------------------------------

/** Current project entity */
export const useProject = () => useProjectStore((s) => s.project);

/** Active shelter design ID */
export const useSelectedShelterDesignId = () =>
  useProjectStore((s) => s.selectedShelterDesignId);

/** Active simulation result ID (null if none selected) */
export const useSelectedSimulationResultId = () =>
  useProjectStore((s) => s.selectedSimulationResultId);

/** Project name */
export const useProjectName = () =>
  useProjectStore((s) => s.project.name);

/** Project description */
export const useProjectDescription = () =>
  useProjectStore((s) => s.project.description);

// stores/comparison-store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ShelterDesign, SimulationResult } from '@/types';
import { evaluateShelterDesign } from '@/lib/calculations/evaluateDesign';

/**
 * Zustand store for design comparison.
 * Holds two shelter designs (A & B) and their evaluated simulation results.
 * Provides actions to set designs and automatically recompute results.
 */
interface ComparisonState {
  designA: ShelterDesign | null;
  designB: ShelterDesign | null;
  resultA: SimulationResult | null;
  resultB: SimulationResult | null;
  /** Set design A and recompute its simulation result */
  setDesignA: (design: ShelterDesign) => void;
  /** Set design B and recompute its simulation result */
  setDesignB: (design: ShelterDesign) => void;
  /** Reset both designs and results */
  reset: () => void;
}

export const useComparisonStore = create<ComparisonState>()(
  devtools(
    (set, get) => ({
      designA: null,
      designB: null,
      resultA: null,
      resultB: null,
      setDesignA: (design) => {
        const result = evaluateShelterDesign(design);
        set({ designA: design, resultA: result });
      },
      setDesignB: (design) => {
        const result = evaluateShelterDesign(design);
        set({ designB: design, resultB: result });
      },
      reset: () => set({ designA: null, designB: null, resultA: null, resultB: null }),
    }),
    { name: 'comparison-store' },
  ),
);

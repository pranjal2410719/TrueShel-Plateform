/*
 * stores/optimization-store.ts – Zustand store for the optimisation workflow.
 * Generates candidate designs, evaluates them, filters by constraints, ranks by an objective,
 * and stores the selected design for visualisation.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ShelterDesign, SimulationResult } from '@/types';
import { useShelterStore } from '@/stores/shelter-store';
import { evaluateShelterDesign } from '@/lib/calculations/evaluateDesign';

/** Simple design variation helpers */
function cloneDesign(base: ShelterDesign): ShelterDesign {
  return JSON.parse(JSON.stringify(base)) as ShelterDesign;
}

/** Generate a set of candidate designs by tweaking a few parameters. */
function generateCandidates(base: ShelterDesign, count: number): ShelterDesign[] {
  const candidates: ShelterDesign[] = [];
  for (let i = 0; i < count; i++) {
    const cand = cloneDesign(base);
    // Randomly adjust thermal mass level
    const levels: ShelterDesign['thermalMass']['level'][] = ['low', 'medium', 'high'];
    cand.thermalMass.level = levels[Math.floor(Math.random() * levels.length)];
    // Randomly adjust window area +/- 20%
    const factor = 0.8 + Math.random() * 0.4; // 0.8–1.2
    cand.openings.windowArea = Math.max(0.5, cand.openings.windowArea * factor);
    // Randomly toggle shading
    cand.shadingEnabled = Math.random() < 0.5;
    // Randomly toggle PCM
    cand.pcm.enabled = Math.random() < 0.5;
    // Randomly adjust envelope wall material (choose a different material from mock library if available)
    // For simplicity we keep wall assembly unchanged – real implementation could swap layers.
    candidates.push(cand);
  }
  return candidates;
}

/** Simple constraint check – you can customize as needed. */
function passesConstraints(result: SimulationResult, baseResult: SimulationResult) {
  // Example constraints: never increase peak heat loss, never decrease autonomy.
  return result.peakHeatLoss <= baseResult.peakHeatLoss && result.autonomy >= baseResult.autonomy;
}

/** Scoring function – higher comfortHours and lower peakHeatLoss are better. */
function scoreResult(res: SimulationResult) {
  // Weighted score: comfortHours * 2 – peakHeatLoss * 1
  return res.comfort.comfortHours * 2 - res.peakHeatLoss;
}

interface OptimizationState {
  candidates: ShelterDesign[];
  results: SimulationResult[];
  selectedIndex: number | null; // index in candidates array
  running: boolean;
  /** Generate and evaluate candidates based on the current shelter design */
  runOptimization: (candidateCount?: number) => void;
  /** Reset store */
  reset: () => void;
}

export const useOptimizationStore = create<OptimizationState>()(
  devtools((set, get) => ({
    candidates: [],
    results: [],
    selectedIndex: null,
    running: false,
    runOptimization: (candidateCount = 30) => {
      const baseDesign = useShelterStore.getState().design;
      const baseResult = evaluateShelterDesign(baseDesign);
      const cands = generateCandidates(baseDesign, candidateCount);
      const evalResults: SimulationResult[] = [];
      const validIndices: number[] = [];
      cands.forEach((cand, idx) => {
        const res = evaluateShelterDesign(cand);
        if (passesConstraints(res, baseResult)) {
          evalResults.push(res);
          validIndices.push(idx);
        }
      });
      // Pick best by score
      let bestIdx: number | null = null;
      let bestScore = -Infinity;
      validIndices.forEach((i) => {
        const sc = scoreResult(evalResults[i]);
        if (sc > bestScore) {
          bestScore = sc;
          bestIdx = i;
        }
      });
      set({
        candidates: cands,
        results: evalResults,
        selectedIndex: bestIdx,
        running: false,
      });
    },
    reset: () => set({ candidates: [], results: [], selectedIndex: null, running: false }),
  })),
);

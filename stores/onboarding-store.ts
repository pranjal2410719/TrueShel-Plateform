"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingState, LocationData, ClimateData, SupplyItem } from '@/types/onboarding';

// Extended state with a completion flag to prevent flicker on reload
export type OnboardingStoreState = OnboardingState & {
  completed: boolean;
  setLocation: (loc: LocationData) => void;
  setClimate: (climate: ClimateData) => void;
  addSupply: (item: SupplyItem) => void;
  removeSupply: (name: string) => void;
  reset: () => void;
  setCompleted: (v: boolean) => void;
};

const INITIAL: Omit<OnboardingStoreState,
  'setLocation' | 'setClimate' | 'addSupply' | 'removeSupply' | 'reset' | 'setCompleted'
> = {
  supplies: [],
  completed: false,
};

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      setLocation: (loc) => set({ location: loc }),
      setClimate: (climate) => set({ climate }),
      addSupply: (item) => {
        const existing = get().supplies.find((s) => s.name === item.name);
        if (existing) {
          set({ supplies: get().supplies.map((s) => s.name === item.name ? item : s) });
        } else {
          set({ supplies: [...get().supplies, item] });
        }
      },
      removeSupply: (name) => set({ supplies: get().supplies.filter((s) => s.name !== name) }),
      reset: () => set(INITIAL),
      setCompleted: (v) => set({ completed: v }),
    }),
    {
      name: 'trueshel-onboarding-store',
      version: 2,
    },
  ),
);

// ── Selectors ──────────────────────────────────────────────────────────────
export const useLocation = () => useOnboardingStore((s) => s.location);
export const useClimate = () => useOnboardingStore((s) => s.climate);
export const useSupplies = () => useOnboardingStore((s) => s.supplies);
export const useOnboardingCompleted = () => useOnboardingStore((s) => s.completed);

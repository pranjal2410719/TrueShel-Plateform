// OnboardingGuard — ensures the user completes onboarding before accessing workspace pages.
// Uses the 'completed' flag from the persisted store to prevent redirect flicker on reload.
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  useOnboardingCompleted,
  useLocation,
  useClimate,
  useSupplies,
} from "@/stores/onboarding-store";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const completed = useOnboardingCompleted();
  const location = useLocation();
  const climate = useClimate();
  const supplies = useSupplies();

  // Hydration guard — Zustand persist requires one tick to rehydrate from localStorage.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const isReady = completed || (!!location && !!climate && supplies.length > 0);

  useEffect(() => {
    if (!hydrated) return;
    if (!isReady) {
      router.replace("/onboarding");
    }
  }, [hydrated, isReady, router]);

  // Show a minimal full-screen loader while hydrating or redirecting
  if (!hydrated || !isReady) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-canvas"
      >
        <Loader2 className="animate-spin text-shop-violet" size={36} aria-hidden="true" />
        <span className="sr-only">Preparing your workspace…</span>
      </div>
    );
  }

  return <>{children}</>;
}

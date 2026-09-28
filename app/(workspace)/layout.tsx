import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import OnboardingGuard from "@/components/OnboardingGuard";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <OnboardingGuard>
        <AppShell>{children}</AppShell>
      </OnboardingGuard>
    </div>
  );
}

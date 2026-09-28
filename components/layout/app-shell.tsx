"use client";

import React, { useState, useEffect } from "react";
import { HeaderBar } from "./header-bar";
import { SidebarRail } from "./sidebar-rail";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { PageTransition } from "./page-transition";
import { cn } from "@/lib/utils/cn";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("trueshel:sidebar:expanded");
    if (saved !== null) {
      setSidebarExpanded(saved === "true");
    } else if (window.innerWidth >= 1440) {
      setSidebarExpanded(true);
    }
  }, []);

  const handleToggleSidebar = () => {
    const next = !sidebarExpanded;
    setSidebarExpanded(next);
    localStorage.setItem("trueshel:sidebar:expanded", String(next));
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-ink flex flex-col font-sans overflow-x-hidden antialiased selection:bg-shop-violet-subtle selection:text-shop-violet">
      {/* Persistent Top Header */}
      <HeaderBar
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 relative w-full min-w-0">
        {/* Persistent Desktop Sidebar Rail */}
        <SidebarRail
          expanded={sidebarExpanded}
          onToggle={handleToggleSidebar}
        />

        {/* Content Canvas */}
        <main
          className={cn(
            "flex-1 min-w-0 w-full transition-[margin-left] duration-200 ease-in-out",
            "px-4 sm:px-6 lg:px-8 py-6",
            "pb-24 md:pb-10",
            "pt-16",
            sidebarExpanded ? "md:ml-60" : "md:ml-16"
          )}
        >
          <div className="max-w-7xl mx-auto w-full min-w-0">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>

      {/* Persistent Mobile Bottom Navigation (<768px) */}
      <MobileBottomBar />
    </div>
  );
}

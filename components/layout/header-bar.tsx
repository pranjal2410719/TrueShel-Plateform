"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Play,
  Layers,
  ChevronDown,
  Database,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderBarProps {
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

export function HeaderBar({ sidebarExpanded, onToggleSidebar }: HeaderBarProps) {
  const router = useRouter();

  // Active project state
  const activeProject = {
    name: "Ladakh Passive Shelter V1",
    location: "Leh, 3,500m AMSL",
    status: "COMFORT",
    temp: "21.4°C",
  };

  const handleRunSimulation = () => {
    router.push("/simulation/running");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 w-full bg-surface border-b border-border-subtle px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Left: Rail toggle & Brand Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          type="button"
          aria-expanded={sidebarExpanded}
          aria-label={sidebarExpanded ? "Collapse Navigation Rail" : "Expand Navigation Rail"}
          className="hidden md:flex items-center justify-center w-9 h-9 rounded-pill text-slate-muted hover:text-slate-ink hover:bg-warm-fog/40 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-pill bg-shop-violet flex items-center justify-center text-surface font-bold text-sm shadow-card group-hover:scale-105 transition-transform">
            T
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-slate-ink tracking-tight text-base">
              TRUESHEL
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-shop-violet-subtle text-shop-violet rounded-pill tracking-wide">
              V2
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Project Selector Pill */}
      <div className="hidden sm:flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-pill border border-border-subtle bg-surface hover:border-border-active hover:bg-canvas/50 transition-all text-xs font-medium text-slate-ink cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-shop-violet" />
              <span className="max-w-[180px] md:max-w-[240px] truncate">
                {activeProject.name}
              </span>
              <span className="hidden lg:inline text-slate-muted font-normal">
                ({activeProject.location})
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-semibold bg-thermal-comfort-subtle text-thermal-comfort border border-thermal-comfort-border">
                {activeProject.status} {activeProject.temp}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-72 rounded-xl p-2 bg-surface shadow-dropdown border border-border-subtle"
          >
            <DropdownMenuLabel className="text-xs text-slate-muted font-normal px-2 py-1">
              Active Project & Climate
            </DropdownMenuLabel>
            <DropdownMenuItem className="rounded-lg px-2 py-2 cursor-pointer flex items-center justify-between bg-shop-violet-subtle text-slate-ink">
              <div>
                <p className="font-medium text-xs">Ladakh Passive Shelter V1</p>
                <p className="text-[11px] text-slate-muted">High-Altitude Passive Adobe • 3,500m</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-shop-violet" />
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg px-2 py-2 cursor-pointer text-slate-muted hover:text-slate-ink">
              <div>
                <p className="font-medium text-xs">Changthang Nomad Insulated Unit</p>
                <p className="text-[11px] text-slate-muted">Bio-PCM Hybrid • 4,200m</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/onboarding"
                className="rounded-lg px-2 py-1.5 cursor-pointer text-xs font-medium text-shop-violet flex items-center gap-2"
              >
                + Create New Climate Project
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Simulation Action & Mock Data Indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mock Data Pill (R6 requirement) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-warm-fog/60 border border-border-subtle text-[11px] font-medium text-slate-muted">
          <Database className="w-3 h-3 text-slate-muted" />
          <span className="hidden xs:inline">SEED DATA</span>
        </div>

        {/* Global Shop Violet Action CTA */}
        <button
          onClick={handleRunSimulation}
          type="button"
          className="flex items-center gap-2 bg-shop-violet hover:bg-shop-violet-hover text-surface rounded-pill px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-all shadow-card active:scale-[0.98] cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-surface text-surface" />
          <span className="font-medium tracking-tight">Run Simulation</span>
        </button>
      </div>
    </header>
  );
}

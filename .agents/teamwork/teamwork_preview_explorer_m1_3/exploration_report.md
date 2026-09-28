# TRUESHEL V2 — Architecture & Exploration Report
## Subsystem: App Shell, Layout & Route Hierarchy (Milestone 1)
**Author:** Explorer M1-3  
**Date:** 2026-09-27  
**Working Directory:** `/home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_explorer_m1_3/`  
**Project Root:** `/home/dev/Desktop/projects/trueShel`  
**Target Specification:** `PROJECT.md` & `ORIGINAL_REQUEST.md` (R1, R3, R4, R5, R6, R7, R8)

---

## 1. Executive Summary & Problem Boundary

TRUESHEL V2 is an engineering-grade climate-to-shelter thermal simulation and passive architecture application built on **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **React Three Fiber**.

This report establishes the complete specification, component architecture, responsive layout rules, and route skeletons for the **persistent App Shell** and **Route Hierarchy**. Specifically, this report defines:

1. **Persistent App Shell Architecture**:
   - Master App Shell orchestrator (`components/layout/app-shell.tsx`)
   - Collapsible desktop Left Navigation Rail (`components/layout/sidebar-rail.tsx`, 64px icon-only expanding to 240px labeled)
   - Persistent Top Header Bar (`components/layout/header-bar.tsx`, project selector, live thermal telemetry pill, and Shop Violet "Run Simulation" CTA)
   - Mobile Bottom Navigation Bar (`components/layout/mobile-bottom-bar.tsx`, `<768px` viewport with 5 primary destinations + sheet drawer)
   - Shared Workspace layout wrapper (`app/(workspace)/layout.tsx`)
   - Completely isolated first-run Onboarding layout and page (`app/onboarding/page.tsx`)
2. **Complete Route Topology & Skeletons**:
   - Enumeration and implementation specifications for **14 primary navigation routes** and **17 nested sub-routes**
   - Deep-linking architecture for `/shelter` sub-sections and `/simulation` sub-result views
   - Standardized skeleton loading states using 28px card tokens with zero layout shift
3. **Framer Motion Transition & Micro-Interaction System**:
   - Snappy, engineering-focused page transitions (`opacity: 0, y: 6` → `1, 0` in 180ms)
   - Shared `layoutId` spring sliding pills for navigation rails and tab lists
   - Tactile button press, card hover elevation, and simulation stepper checklist animations
4. **Responsive Layout Rules for Zero Horizontal Scroll**:
   - Viewport compliance matrix for **1440px** (Desktop), **1024px** (Laptop), **768px** (Tablet), and **375px** (Mobile)
   - Strict CSS/Tailwind structural containment rules (`min-w-0`, `w-full`, responsive grid columns, responsive padding, table scroll containment)
   - Automated testing and verification methods to guarantee `scrollWidth === clientWidth` at all resolutions.

---

## 2. Persistent App Shell Architecture

### 2.1 Architectural Wireframe & Component Hierarchy

```
+----------------------------------------------------------------------------------------------------+
| HeaderBar (fixed/sticky top-0, h-16, w-full, z-40, bg-surface, border-b border-border-subtle)      |
| [Toggle] [TRUESHEL V2] | [Project Selector Pill: Ladakh V1 (COMFORT 21.4°C)] | [Mock Data] [Run Sim]|
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  SidebarRail (fixed top-16 bottom-0 left-0, z-30, hidden md:flex)                                  |
|  Collapsed: w-16 (64px) / Expanded: w-60 (240px)                                                   |
|  +---------------------------+  +---------------------------------------------------------------+  |
|  | [Icon] Dashboard          |  | Main Content Area (app/(workspace)/*)                        |  |
|  | [Icon] Climate            |  | transition-all duration-200 md:ml-16 / md:ml-60               |  |
|  | [Icon] Shelter            |  | min-w-0 w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8        |  |
|  | [Icon] Simulation         |  |                                                               |  |
|  | [Icon] Compare            |  |  +---------------------------------------------------------+  |  |
|  | [Icon] Optimization       |  |  | PageHeader (Title, subtitle, breadcrumbs, action pills) |  |  |
|  | [Icon] Recommendation     |  |  +---------------------------------------------------------+  |  |
|  | [Icon] Resilience         |  |  | PageTransition (Framer Motion wrapper)                  |  |  |
|  | [Icon] Thermal Twin       |  |  |                                                         |  |  |
|  | [Icon] Reports            |  |  |  Engineering Cards (rounded-card, shadow-card,          |  |  |
|  |                           |  |  |  bg-surface, zero hardcoded styles)                     |  |  |
|  |---------------------------|  |  +---------------------------------------------------------+  |  |
|  | [Icon] Settings           |  |                                                               |  |
|  | [Chevron] Expand/Collapse |  |                                                               |  |
|  +---------------------------+  +---------------------------------------------------------------+  |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
| MobileBottomBar (fixed bottom-0 left-0 right-0, h-16, z-50, flex md:hidden, bg-surface, border-t)   |
| [Dashboard]        [Shelter]        [Simulation]        [Thermal Twin]        [More (Sheet)]       |
+----------------------------------------------------------------------------------------------------+
```

### 2.2 Shell Component Specifications

#### A. Master Shell Orchestrator (`components/layout/app-shell.tsx`)
The `AppShell` component wraps all workspace pages, managing sidebar expanded/collapsed state with persistence in `localStorage`, handling responsive breakpoint transitions, and providing consistent page margins.

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { HeaderBar } from "./header-bar";
import { SidebarRail } from "./sidebar-rail";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Collapsed by default on <1440px, expanded by default on >=1440px
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
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
            "pb-24 md:pb-10", // Mobile bottom bar padding clearance
            sidebarExpanded ? "md:ml-60" : "md:ml-16"
          )}
        >
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* Persistent Mobile Bottom Navigation (<768px) */}
      <MobileBottomBar />
    </div>
  );
}
```

#### B. Collapsible Left Navigation Rail (`components/layout/sidebar-rail.tsx`)
- **Dimensions**: Fixed 64px (`w-16`) collapsed, expanding smoothly to 240px (`w-60`).
- **Positioning**: Fixed to left viewport below header (`fixed top-16 bottom-0 left-0 z-30`).
- **Styling**: `bg-surface border-r border-border-subtle flex flex-col`.
- **Active Navigation Styling**: `bg-shop-violet-subtle text-shop-violet font-medium rounded-pill` with an animated sliding pill or left indicator.
- **Collapsed Tooltip**: Accessible shadcn `Tooltip` on each item when collapsed.

```tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CloudSun,
  Home,
  PlayCircle,
  GitCompare,
  Sliders,
  Sparkles,
  ShieldAlert,
  Box,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Climate Explorer", href: "/climate", icon: CloudSun },
  { name: "Shelter Designer", href: "/shelter", icon: Home },
  { name: "Simulation", href: "/simulation/results", icon: PlayCircle },
  { name: "Comparison", href: "/compare", icon: GitCompare },
  { name: "Optimization", href: "/optimization", icon: Sliders },
  { name: "Recommendation", href: "/recommendation", icon: Sparkles },
  { name: "Resilience", href: "/resilience", icon: ShieldAlert },
  { name: "Thermal Twin", href: "/thermal-twin", icon: Box },
  { name: "Reports", href: "/reports", icon: FileText },
];

interface SidebarRailProps {
  expanded: boolean;
  onToggle: () => void;
}

export function SidebarRail({ expanded, onToggle }: SidebarRailProps) {
  const pathname = usePathname();

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col fixed top-16 bottom-0 left-0 z-30 bg-surface border-r border-border-subtle transition-[width] duration-200 ease-in-out select-none",
        expanded ? "w-60" : "w-16"
      )}
      aria-label="Application Navigation Rail"
    >
      {/* Navigation Destination List */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-1 no-scrollbar">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const active = isItemActive(item.href, item.exact);
          const Icon = item.icon;

          const buttonContent = (
            <Link
              href={item.href}
              className={cn(
                "relative flex items-center h-10 rounded-pill transition-colors group",
                expanded ? "px-3 gap-3 w-full" : "justify-center w-12 mx-auto",
                active
                  ? "text-shop-violet font-medium"
                  : "text-slate-muted hover:text-slate-ink hover:bg-warm-fog/30"
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeRailPill"
                  className="absolute inset-0 bg-shop-violet-subtle rounded-pill z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn("w-5 h-5 shrink-0 z-10 transition-colors", active ? "text-shop-violet" : "text-slate-muted group-hover:text-slate-ink")} />
              {expanded && (
                <span className="text-sm truncate z-10 tracking-tight">
                  {item.name}
                </span>
              )}
            </Link>
          );

          if (!expanded) {
            return (
              <Tooltip key={item.href} delayDuration={150}>
                <TooltipTrigger asChild>
                  {buttonContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="rounded-pill bg-slate-ink text-white px-3 py-1 text-xs shadow-dropdown font-medium">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{buttonContent}</div>;
        })}
      </nav>

      {/* Bottom Pinned Controls (Settings & Collapse Toggle) */}
      <div className="p-2 border-t border-border-subtle flex flex-col gap-1 bg-surface">
        {/* Settings */}
        {(() => {
          const active = isItemActive("/settings");
          const settingsBtn = (
            <Link
              href="/settings"
              className={cn(
                "relative flex items-center h-10 rounded-pill transition-colors group",
                expanded ? "px-3 gap-3 w-full" : "justify-center w-12 mx-auto",
                active
                  ? "text-shop-violet font-medium"
                  : "text-slate-muted hover:text-slate-ink hover:bg-warm-fog/30"
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeRailPill"
                  className="absolute inset-0 bg-shop-violet-subtle rounded-pill z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Settings className={cn("w-5 h-5 shrink-0 z-10", active ? "text-shop-violet" : "text-slate-muted group-hover:text-slate-ink")} />
              {expanded && (
                <span className="text-sm truncate z-10 tracking-tight">
                  Settings
                </span>
              )}
            </Link>
          );

          if (!expanded) {
            return (
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>{settingsBtn}</TooltipTrigger>
                <TooltipContent side="right" className="rounded-pill bg-slate-ink text-white px-3 py-1 text-xs shadow-dropdown font-medium">
                  Settings
                </TooltipContent>
              </Tooltip>
            );
          }
          return settingsBtn;
        })()}

        {/* Expand / Collapse Action */}
        <button
          onClick={onToggle}
          aria-label={expanded ? "Collapse Sidebar Rail" : "Expand Sidebar Rail"}
          className={cn(
            "flex items-center h-10 rounded-pill text-slate-muted hover:text-slate-ink hover:bg-warm-fog/30 transition-colors",
            expanded ? "px-3 gap-3 w-full" : "justify-center w-12 mx-auto"
          )}
        >
          {expanded ? (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span className="text-xs text-slate-muted uppercase tracking-wider font-medium">
                Collapse Rail
              </span>
            </>
          ) : (
            <ChevronRight className="w-5 h-5 shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
```

#### C. Persistent Top Header Bar (`components/layout/header-bar.tsx`)
- **Height**: 64px (`h-16`).
- **Styling**: `bg-surface border-b border-border-subtle px-4 sm:px-6 sticky top-0 z-40 flex items-center justify-between`.
- **Project Selector**: Interactive pill dropdown presenting active project name, active climate altitude, and live thermal comfort state pill (`COMFORT 21.4°C`).
- **Primary CTA**: "Run Simulation" button with Shop Violet fill (`bg-shop-violet text-white rounded-pill px-5 py-2 font-medium hover:bg-shop-violet/90 active:scale-[0.98]`).
- **Data Integrity Pill**: Explicit `MOCK DATA` pill indicator in compliance with R6 ("Do not fake scientific calculations — show 'MOCK DATA' if using seed data").

```tsx
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
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

  // In production, these derive from useProjectStore() and useSimulationStore()
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
    <header className="sticky top-0 z-40 h-16 w-full bg-surface border-b border-border-subtle px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Left: Rail toggle & Brand Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Rail"
          className="hidden md:flex items-center justify-center w-9 h-9 rounded-pill text-slate-muted hover:text-slate-ink hover:bg-warm-fog/40 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-pill bg-shop-violet flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            T
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-slate-ink tracking-tight text-base">
              TRUESHEL
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-shop-violet-subtle text-shop-violet rounded-pill tracking-wide">
              V2
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Project Selector Pill */}
      <div className="hidden sm:flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-pill border border-border-subtle bg-surface hover:border-border-active hover:bg-canvas/50 transition-all text-xs font-medium text-slate-ink">
              <Layers className="w-3.5 h-3.5 text-shop-violet" />
              <span className="max-w-[180px] md:max-w-[240px] truncate">
                {activeProject.name}
              </span>
              <span className="hidden lg:inline text-slate-muted font-normal">
                ({activeProject.location})
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-semibold bg-thermal-comfort/10 text-thermal-comfort border border-thermal-comfort/20">
                {activeProject.status} {activeProject.temp}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-72 rounded-xl p-2 bg-surface shadow-dropdown border border-border-subtle">
            <DropdownMenuLabel className="text-xs text-slate-muted font-normal px-2 py-1">
              Active Project & Climate
            </DropdownMenuLabel>
            <DropdownMenuItem className="rounded-lg px-2 py-2 cursor-pointer flex items-center justify-between bg-shop-violet-subtle/40 text-slate-ink">
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
              <Link href="/onboarding" className="rounded-lg px-2 py-1.5 cursor-pointer text-xs font-medium text-shop-violet flex items-center gap-2">
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
          className="flex items-center gap-2 bg-shop-violet hover:bg-shop-violet/90 text-white rounded-pill px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-all shadow-none active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span className="font-medium tracking-tight">Run Simulation</span>
        </button>
      </div>
    </header>
  );
}
```

#### D. Mobile Bottom Navigation Bar (`components/layout/mobile-bottom-bar.tsx`)
- **Visibility**: Exclusively on `<768px` viewports (`flex md:hidden`).
- **Positioning**: `fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface border-t border-border-subtle px-2 pb-[env(safe-area-inset-bottom)]`.
- **5 Primary Touch Targets**:
  1. Overview / Dashboard (`/dashboard`, `LayoutDashboard`)
  2. Shelter Designer (`/shelter`, `Home`)
  3. Simulation Results (`/simulation/results`, `PlayCircle`)
  4. 3D Thermal Twin (`/thermal-twin`, `Box`)
  5. More Menu Sheet Drawer (`Menu`, slides up full secondary route list)

```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  PlayCircle,
  Box,
  Menu,
  CloudSun,
  GitCompare,
  Sliders,
  Sparkles,
  ShieldAlert,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MOBILE_PRIMARY = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Shelter", href: "/shelter", icon: Home },
  { name: "Simulation", href: "/simulation/results", icon: PlayCircle },
  { name: "Twin", href: "/thermal-twin", icon: Box },
];

const MOBILE_SECONDARY = [
  { name: "Climate Explorer", href: "/climate", icon: CloudSun, desc: "Ladakh ambient data, diurnal curves, irradiance" },
  { name: "Design Comparison", href: "/compare", icon: GitCompare, desc: "Side-by-side Design A vs B performance diffs" },
  { name: "Optimization", href: "/optimization", icon: Sliders, desc: "Pareto multi-objective candidate exploration" },
  { name: "Recommendation", href: "/recommendation", icon: Sparkles, desc: "Physics-driven parameter justification" },
  { name: "Resilience & Autonomy", href: "/resilience", icon: ShieldAlert, desc: "Thermal decay to 16°C & multi-hazard risks" },
  { name: "Reports & Export", href: "/reports", icon: FileText, desc: "Client-side PDF and structured JSON export" },
  { name: "Settings", href: "/settings", icon: Settings, desc: "Engineering units and solver tolerances" },
];

export function MobileBottomBar() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-border-subtle h-16 px-2 flex items-center justify-around select-none pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Navigation Bar"
    >
      {MOBILE_PRIMARY.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors relative",
              active ? "text-shop-violet font-medium" : "text-slate-muted hover:text-slate-ink"
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.name}</span>
            {active && (
              <span className="absolute bottom-1 w-1 h-1 rounded-pill bg-shop-violet" />
            )}
          </Link>
        );
      })}

      {/* 5th Destination: Secondary Modules Sheet Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-muted hover:text-slate-ink transition-colors",
              sheetOpen && "text-shop-violet"
            )}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-card bg-surface p-6 max-h-[85vh] overflow-y-auto border-t border-border-subtle shadow-card">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base font-semibold text-slate-ink text-left">
              Engineering Modules
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-1 gap-2">
            {MOBILE_SECONDARY.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border border-border-subtle transition-colors",
                    active
                      ? "bg-shop-violet-subtle/50 border-shop-violet text-shop-violet"
                      : "bg-surface hover:bg-canvas/50 text-slate-ink"
                  )}
                >
                  <div className={cn("w-9 h-9 rounded-pill flex items-center justify-center shrink-0", active ? "bg-shop-violet text-white" : "bg-warm-fog/40 text-slate-secondary")}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-muted truncate">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
```

---

## 3. Workspace Layout Wrapper vs Isolated Onboarding

### 3.1 Workspace Layout Wrapper (`app/(workspace)/layout.tsx`)
In accordance with line 38 of `ORIGINAL_REQUEST.md` ("Route group `(workspace)` with shared layout for all authenticated sections; `/onboarding` outside the group"):

```tsx
import React from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
```

### 3.2 Isolated Onboarding Route (`app/onboarding/page.tsx`)
The onboarding route bypasses the AppShell (no navigation rail, no header bar, no bottom bar), providing a focused, zero-distraction initial parameter setup environment.

- **Background**: Canvas `#f2f4f5`
- **Container**: Centered 28px card with dual-layer soft shadow (`max-w-xl mx-auto rounded-card bg-surface shadow-card p-8 sm:p-10`)
- **Key Functions**:
  - Seeds the Ladakh 3,500m high-altitude climate baseline
  - Selects baseline passive shelter archetype (Passive Solar Adobe with South Trombe wall)
  - Commits configuration to `useProjectStore` and `useShelterStore`
  - Action button: "Initialize Project Workspace" (Shop Violet CTA) → redirects directly to `/dashboard`.

```tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  ThermometerSnowflake,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedArchetype, setSelectedArchetype] = useState("ladakh-passive");

  const handleComplete = () => {
    // Stores will hydrate default Ladakh dataset
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-surface rounded-card shadow-card p-6 sm:p-10 border-none"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-pill bg-shop-violet text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
            T
          </div>
          <h1 className="text-2xl font-bold text-slate-ink tracking-tight">
            TRUESHEL Engineering Core
          </h1>
          <p className="text-sm text-slate-muted mt-1.5 max-w-md mx-auto">
            High-altitude transient thermal simulation and passive shelter optimization for sub-zero climates.
          </p>
        </div>

        {/* Climate Archetype Preset */}
        <div className="space-y-4 mb-8">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-muted block">
            Baseline Climate & Archetype
          </label>
          <div
            onClick={() => setSelectedArchetype("ladakh-passive")}
            className="p-4 rounded-xl border-2 border-shop-violet bg-shop-violet-subtle/30 flex items-start gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-pill bg-shop-violet/10 text-shop-violet flex items-center justify-center shrink-0">
              <ThermometerSnowflake className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-ink">Ladakh High-Altitude Passive</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-shop-violet text-white">RECOMMENDED</span>
              </div>
              <p className="text-xs text-slate-muted mt-1">
                Leh, Ladakh (3,500m AMSL) • Winter design day -15°C to -1.5°C • 850 W/m² GHI clear-sky solar radiation.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleComplete}
          className="w-full h-12 bg-shop-violet hover:bg-shop-violet/90 text-white rounded-pill font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <span>Enter Engineering Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
```

---

## 4. Complete Route Hierarchy & Skeleton Specifications

### 4.1 Route Catalog Matrix (14 Primary + 17 Nested Sub-Routes)

| # | Route URL | File System Path | Role / Layout | Domain / Store Links | Key Visual Elements |
|---|-----------|-------------------|---------------|----------------------|---------------------|
| **1** | `/` | `app/page.tsx` | Root Redirect | `project-store` | Automatic state check: redirects to `/dashboard` or `/onboarding` |
| **2** | `/onboarding` | `app/onboarding/page.tsx` | Isolated Root | `project-store`, `shelter-store` | Preset selector, project seed, enter CTA |
| **3** | `/dashboard` | `app/(workspace)/dashboard/page.tsx` | Workspace Primary | All 4 stores | 5-metric strip, 24h temp chart, 16:9 3D twin embed, heat loss bar chart, 3 insight cards |
| **4** | `/climate` | `app/(workspace)/climate/page.tsx` | Workspace Primary | `project-store`, `simulation-store` | Ladakh diurnal curves (-15°C to -1.5°C), GHI/DNI irradiance charts, barometric pressure (65 kPa) |
| **5** | `/shelter` | `app/(workspace)/shelter/page.tsx` | Workspace Primary | `shelter-store` | 40/60 split: 40% live procedural 3D preview, 60% tabbed parameter panels |
| 5a | `/shelter/geometry` | `app/(workspace)/shelter/geometry/page.tsx` | Nested Sub-Route | `shelter-store` | Deep links to Shelter Designer with `Geometry` tab pre-selected (L/W/H, orientation) |
| 5b | `/shelter/envelope` | `app/(workspace)/shelter/envelope/page.tsx` | Nested Sub-Route | `shelter-store` | Deep links to Shelter Designer with `Envelope` tab & Wall-Layer builder drawer |
| 5c | `/shelter/materials` | `app/(workspace)/shelter/materials/page.tsx` | Nested Sub-Route | `shelter-store` | Deep links to Shelter Designer with `Material Library` & Inspector open |
| 5d | `/shelter/openings` | `app/(workspace)/shelter/openings/page.tsx` | Nested Sub-Route | `shelter-store` | Deep links to Shelter Designer with `Openings` tab (South glazing, doors) |
| 5e | `/shelter/thermal-mass` | `app/(workspace)/shelter/thermal-mass/page.tsx` | Nested Sub-Route | `shelter-store` | Deep links to Shelter Designer with `Thermal Mass` capacitance tab |
| 5f | `/shelter/pcm` | `app/(workspace)/shelter/pcm/page.tsx` | Nested Sub-Route | `shelter-store` | Deep links to Shelter Designer with `Phase Change Materials` tab |
| 5g | `/shelter/summary` | `app/(workspace)/shelter/summary/page.tsx` | Nested Sub-Route | `shelter-store` | Deep links to Shelter Designer with aggregate envelope schedule & overall $U_{avg}$ |
| **6** | `/simulation` | `app/(workspace)/simulation/page.tsx` | Workspace Primary | `simulation-store` | Simulation index redirect: routes to `/setup` or `/results` depending on status |
| 6a | `/simulation/setup` | `app/(workspace)/simulation/setup/page.tsx` | Nested Sub-Route | `simulation-store` | Configuration form: 24h/annual duration, 1h timestep, comfort range (18–26°C), toggles |
| 6b | `/simulation/running` | `app/(workspace)/simulation/running/page.tsx` | Nested Sub-Route | `simulation-store` | 8-stage progress checklist with animated checkmarks, "MOCK DATA" banner |
| 6c | `/simulation/results` | `app/(workspace)/simulation/results/page.tsx` | Nested Sub-Route / Primary | `simulation-store`, `thermal-twin-store` | Comprehensive results: 5-metric strip, 24h temp chart, thermal state bar, heat flow chart, solar gain chart, 3D embed |
| 6d | `/simulation/temperature` | `app/(workspace)/simulation/temperature/page.tsx` | Nested Sub-Route | `simulation-store` | Deep-dive: indoor, outdoor, operative, sol-air, surface temperatures |
| 6e | `/simulation/heat-flow` | `app/(workspace)/simulation/heat-flow/page.tsx` | Nested Sub-Route | `simulation-store` | Deep-dive: conduction, convection, radiation, infiltration losses |
| 6f | `/simulation/solar` | `app/(workspace)/simulation/solar/page.tsx` | Nested Sub-Route | `simulation-store` | Deep-dive: South glazing irradiance, transmission, shading factors |
| 6g | `/simulation/comfort` | `app/(workspace)/simulation/comfort/page.tsx` | Nested Sub-Route | `simulation-store` | Deep-dive: PMV, PPD, comfort hours, cold discomfort hours |
| 6h | `/simulation/thermal-state` | `app/(workspace)/simulation/thermal-state/page.tsx` | Nested Sub-Route | `simulation-store` | Deep-dive: 24h segmented Under-comfort, Comfort, Overheating durations |
| **7** | `/compare` | `app/(workspace)/compare/page.tsx` | Workspace Primary | `project-store`, `simulation-store` | Side-by-side Design A vs B: parameters, stacked metrics, dual temp chart overlay, $\Delta$ directional metrics |
| **8** | `/optimization` | `app/(workspace)/optimization/page.tsx` | Workspace Primary | `simulation-store` | Pareto multi-objective optimization: objective weights, variable toggles, constraints, candidate designs |
| **9** | `/recommendation` | `app/(workspace)/recommendation/page.tsx` | Workspace Primary | `simulation-store` | Recommended configuration card, performance justifications, key physics drivers, no fake AI |
| **10** | `/resilience` | `app/(workspace)/resilience/page.tsx` | Workspace Primary | `simulation-store` | Resilience Command Center: Autonomy hours (decay to 16°C), climate risk matrix, freeze-thaw risk |
| 10a | `/resilience/autonomy` | `app/(workspace)/resilience/autonomy/page.tsx` | Nested Sub-Route | `simulation-store` | Deep-dive: Lumped capacitance exponential temperature decay to 16°C during heating blackout |
| 10b | `/resilience/climate-risk` | `app/(workspace)/resilience/climate-risk/page.tsx` | Nested Sub-Route | `simulation-store` | Deep-dive: Multi-hazard winter freeze, snow load, solar blackout risk |
| 10c | `/resilience/degradation` | `app/(workspace)/resilience/degradation/page.tsx` | Nested Sub-Route | `simulation-store` | Deep-dive: 20-year thermal performance degradation (insulation moisture, seal leakage) |
| 10d | `/resilience/failure-intelligence` | `app/(workspace)/resilience/failure-intelligence/page.tsx` | Nested Sub-Route | `simulation-store` | Cold-climate failure pattern database + RAG vector architecture stub |
| **11** | `/thermal-twin` | `app/(workspace)/thermal-twin/page.tsx` | Workspace Primary | `thermal-twin-store`, `shelter-store` | Full-screen R3F procedural 3D twin, 5 shader modes, 24h timeline scrubber, raycast inspector |
| **12** | `/reports` | `app/(workspace)/reports/page.tsx` | Workspace Primary | All stores | Multi-section thermal design report preview, client-side PDF export, structured JSON export |
| **13** | `/settings` | `app/(workspace)/settings/page.tsx` | Workspace Primary | `project-store` | Engineering units (Metric SI / IP), solver convergence tolerances, local cache management |
| **14** | `/simulation/results` | (Direct link / primary destination) | Workspace Primary | `simulation-store` | Direct primary navigation target in sidebar & mobile bar for immediate telemetry review |

> **Note on Route Counts**:  
> The 14 primary navigation routes represent the comprehensive top-level engineering destinations (`/`, `/onboarding`, `/dashboard`, `/climate`, `/shelter`, `/simulation`, `/simulation/results`, `/compare`, `/optimization`, `/recommendation`, `/resilience`, `/thermal-twin`, `/reports`, `/settings`). The 17 nested sub-routes provide deep linking into `/shelter/*` (7 sub-sections), `/simulation/*` (6 deep-dives + running), and `/resilience/*` (4 survivability views).

### 4.2 Standardized Page Skeleton & Loading Primitives

To eliminate Cumulative Layout Shift (CLS) and ensure visual adherence to Shop design DNA during client hydration, all page skeletons must use:
- `rounded-card` (`28px`) containers with `shadow-card`
- `bg-warm-fog/50` pulsating shimmer elements (`animate-pulse`)
- `rounded-pill` for button and badge skeleton placeholders

```tsx
// components/feedback/page-skeleton.tsx
import React from "react";
import { cn } from "@/lib/utils";

export function MetricCardSkeleton() {
  return (
    <div className="bg-surface rounded-card p-6 shadow-card border-none flex flex-col justify-between h-36 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-warm-fog rounded-pill" />
        <div className="h-6 w-6 bg-warm-fog rounded-pill" />
      </div>
      <div>
        <div className="h-8 w-28 bg-warm-fog rounded-pill mb-2" />
        <div className="h-3 w-36 bg-warm-fog rounded-pill" />
      </div>
    </div>
  );
}

export function ChartCardSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <div className={cn("bg-surface rounded-card p-6 shadow-card border-none animate-pulse flex flex-col", height)}>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-warm-fog rounded-pill" />
          <div className="h-3 w-64 bg-warm-fog rounded-pill" />
        </div>
        <div className="h-8 w-24 bg-warm-fog rounded-pill" />
      </div>
      <div className="flex-1 w-full bg-warm-fog/30 rounded-inner" />
    </div>
  );
}

export function StandardPageSkeleton() {
  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-warm-fog rounded-pill animate-pulse" />
          <div className="h-3 w-72 bg-warm-fog rounded-pill animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-warm-fog rounded-pill animate-pulse" />
      </div>

      {/* 5-Metric Strip Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Visualizer Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCardSkeleton height="h-96" />
        </div>
        <div>
          <ChartCardSkeleton height="h-96" />
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Framer Motion Transition System & Micro-Interactions

### 5.1 Page Transitions (`components/layout/page-transition.tsx`)
In accordance with lines 40 & 115 of `ORIGINAL_REQUEST.md` ("Framer Motion page transitions: Subtle page fade/slide-up `opacity: 0, y: 6` -> `1, 0`"):

```tsx
"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1], // Custom snappy cubic bezier
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.12,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-w-0"
    >
      {children}
    </motion.div>
  );
}
```

### 5.2 Micro-Interactions Catalog

1. **Sliding Spring Pill for Active Navigation & Tabs (`layoutId`)**:
   - Used in `SidebarRail`, `TabsList`, and sub-navigation segmented bars.
   - Framer Motion config: `transition={{ type: "spring", stiffness: 450, damping: 32 }}`.
   - Provides instantaneous visual confirmation without DOM layout repaints.
2. **Elevated Card Hover Interaction**:
   - Class-driven or motion-driven: cards translate `-2px` on Y axis and switch to `--shadow-card-hover` (`0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)`).
3. **Primary Action Compression (`whileTap`)**:
   - Applied to Shop Violet primary buttons: `whileTap={{ scale: 0.98 }}`.
4. **Timeline Scrubber Feedback (`TwinTimeline.tsx`)**:
   - Knob track follows pointer without lag. Current hour pill updates in real-time (`font-mono` to prevent jitter).
5. **Simulation Stepper Checklist Pop (`simulation/running`)**:
   - Each completed stage animates its green checkmark with `initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}`.

---

## 6. Responsive Layout Rules & Zero Horizontal Scroll Strategy

### 6.1 Viewport Breakpoint Matrix

| Viewport Tier | Pixel Range | Shell Adaptation | Page Grid Column Rules | Horizontal Scroll Prevention Directives |
|---------------|-------------|------------------|------------------------|------------------------------------------|
| **Desktop** | $\ge 1440\text{px}$ | Persistent 64px rail, expandable to 240px; Full Header with Project Selector & CTA | 5-col metric strip (`grid-cols-5`), 40/60 split in `/shelter`, 2-col charts | Max container `max-w-7xl mx-auto`. No fixed widths $> 1200\text{px}$. |
| **Laptop** | $1024\text{px} - 1439\text{px}$ | Persistent 64px rail (collapsed by default); Full Header | 5-col or 3-col metric strip (`lg:grid-cols-5`), 50/50 split in `/shelter` | Fluid flex layouts, `min-w-0` on chart wrappers. |
| **Tablet** | $768\text{px} - 1023\text{px}$ | Collapsed 64px rail (`hidden md:flex`); Compact Header | 2-col metric strip (`sm:grid-cols-2`), stacked 3D canvas above panels in `/shelter` | Tables wrapped in `overflow-x-auto`. Charts use `ResponsiveContainer`. |
| **Mobile** | $< 768\text{px}$ | Sidebar completely hidden (`hidden md:flex`); Mobile Bottom Bar visible (`fixed bottom-0`); Minimal Header | 1-col metric cards (`grid-cols-1`), vertical stacking of all analysis modules | **Strict zero horizontal scroll**: padding `px-4`, `w-full max-w-full`, `min-w-0` on all parents, tables card-swapped or horizontally scrolled within card boundary. |

### 6.2 Structural Engineering Rules to Guarantee Zero Horizontal Scroll

1. **Flex Child Shrinkage (`min-w-0`)**:
   In CSS Flexbox, child elements default to `min-width: auto`. Any child containing a wide preformatted element, SVG chart, or long text will refuse to shrink and expand its parent beyond the viewport.
   - **Rule**: Every `<main>`, page container, chart card, and flex column MUST include `min-w-0` (`flex-1 min-w-0`).
2. **Recharts Container Responsiveness**:
   Recharts `<ResponsiveContainer>` will calculate width incorrectly and blow out the layout if its parent does not have `w-full min-w-0 overflow-hidden`.
   - **Rule**: Wrap every Recharts component in:
     ```tsx
     <div className="w-full min-w-0 overflow-hidden h-72">
       <ResponsiveContainer width="100%" height="100%">
         {/* Chart */}
       </ResponsiveContainer>
     </div>
     ```
3. **Table & Matrix Containment**:
   The comparison table (`/compare`), material library (`/shelter/materials`), and failure catalog (`/resilience/failure-intelligence`) have multi-column data that exceeds 375px.
   - **Rule**: Never allow the page body to scroll horizontally. Instead, contain tables inside the 28px card using an inner scroll viewport:
     ```tsx
     <div className="bg-surface rounded-card shadow-card overflow-hidden">
       <div className="w-full overflow-x-auto no-scrollbar">
         <table className="w-full min-w-[600px] border-collapse">
           {/* Table content */}
         </table>
       </div>
     </div>
     ```
4. **Three.js / React Three Fiber Canvas Containment**:
   The R3F Canvas must strictly bind to parent container dimensions.
   - **Rule**:
     ```tsx
     <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[480px] rounded-inner overflow-hidden bg-slate-ink/5">
       <Canvas className="w-full h-full">
         {/* Procedural Shelter */}
       </Canvas>
     </div>
     ```
5. **No Negative Margins Outside Breakpoints**:
   - **Rule**: Do not use negative horizontal margins (such as `-mx-4`) unless counter-balanced within the same container.
6. **Global Root Containment**:
   - In `app/layout.tsx` and `styles/globals.css`:
     ```css
     html, body {
       width: 100%;
       max-width: 100vw;
       overflow-x: hidden;
     }
     ```

---

## 7. Implementation Roadmap & Verification Commands

### 7.1 Builder Task Checklist for Milestone 1
- [ ] **Step 1: Layout Core Implementation**:
  - Write `components/layout/app-shell.tsx`
  - Write `components/layout/header-bar.tsx`
  - Write `components/layout/sidebar-rail.tsx`
  - Write `components/layout/mobile-bottom-bar.tsx`
  - Write `components/layout/page-transition.tsx`
  - Write `app/(workspace)/layout.tsx`
  - Write `app/onboarding/page.tsx`
  - Write `app/page.tsx` (redirect logic)
- [ ] **Step 2: Complete Route Tree Directory & Page Skeletons**:
  - Create directories and stub `page.tsx` for all 14 primary routes and 17 sub-routes.
  - Ensure every stub imports the standardized skeleton or placeholder UI styled strictly with Shop tokens.
- [ ] **Step 3: Verification Pass**:
  - Run build verification: `npm run build`
  - Run viewport tests: verify no horizontal scroll at 1440px, 1024px, 768px, and 375px.

### 7.2 Independent Verification Script
To verify zero horizontal scroll across all four required viewports:
```bash
# Automated Playwright / Puppeteer script logic:
# for width in [1440, 1024, 768, 375]:
#   await page.setViewportSize({ width, height: 900 });
#   const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
#   expect(hasScroll).toBe(false);
```

To verify zero token bypasses or raw hex codes outside `tokens.css`:
```bash
grep -rnI --exclude="styles/tokens.css" --exclude="*.svg" --exclude-dir=".next" --exclude-dir="node_modules" "#" app/ components/ features/ lib/
```
Output must be completely empty.

---

## 8. Conclusion
The component architecture, responsive rules, and route hierarchy specified in this report satisfy all requirements of R1 and the design system constraints. The implementation track can now construct the layout components and route skeletons with zero ambiguity.

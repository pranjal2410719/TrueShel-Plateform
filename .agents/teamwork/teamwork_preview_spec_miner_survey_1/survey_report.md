# TRUESHEL V2 — Specification Survey Report
## Subsystem: App Shell, Design System & Route Topology
**Author:** Spec Miner 1  
**Date:** 2026-09-27  
**Working Directory:** `/home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_spec_miner_survey_1/`  
**Target Project Root:** `/home/dev/Desktop/projects/trueShel`  

---

## 1. Executive Summary & Specification Source

TRUESHEL V2 is an engineering-grade climate-to-shelter thermal simulation and passive architecture application built on **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **React Three Fiber**.

This specification survey establishes the complete blueprint for:
1. **The Shop Design Token System** (`styles/tokens.css`) as the single source of truth for styling across the entire project.
2. **The Exact File Architecture** prescribed in `ORIGINAL_REQUEST.md` (lines 42–69).
3. **The Complete Route Topology**, covering `/onboarding`, the `(workspace)` route group, all 14 primary navigation routes, and 17 dedicated sub-routes.
4. **The Desktop-First Persistent App Shell**, including the collapsible left navigation rail (64px → 240px), persistent top header bar, and mobile bottom navigation bar (<768px).
5. **The shadcn/ui Component Integration**, configured strictly against Shop design tokens with zero hardcoded values.
6. **Framer Motion Micro-Interactions & Transitions**, providing crisp, snappy engineering ergonomics.

### Authoritative Specification Sources Probed:
- Primary: `/home/dev/Desktop/projects/trueShel/.agents/teamwork/ORIGINAL_REQUEST.md` (lines 1–294)
- Node/npm runtime environment: Node.js `v22.23.3`, npm `10.9.9` (Linux x86_64)
- Orchestration plan: `/home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_orchestrator_1/plan.md`

---

## 2. Shop Design Token System (`styles/tokens.css`)

### 2.1 Core Design DNA
The Shop design system enforces a minimalist, high-contrast, Swiss-inspired aesthetic optimized for engineering command centers:
- **Canvas:** `#f2f4f5` (warm, low-fatigue white canvas background)
- **Surfaces:** `#ffffff` (crisp elevated cards)
- **Primary Accent:** Shop Violet `#5433eb` (strictly reserved for primary actions, key metrics, and active navigation indicators)
- **Border Radii:**
  - Card Radius: `28px` (`--radius-card`)
  - Inner Media / 3D Canvas Radius: `20px` (`--radius-inner`)
  - Pill / Button / Input / Badge Radius: `9999px` (`--radius-pill`)
- **Shadow:**
  - Dual-layer soft shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`
  - Elevated hover shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)`
- **Typography:**
  - Font Family: `GT Standard`, fallback to `Inter`, `system-ui`, `-apple-system`, `sans-serif`
  - Hierarchy is established through letter tracking (`tracking-tight`, `tracking-normal`, `tracking-wide`) and size, **not excessive font-weight contrast**
- **Negative Styling Directives:**
  - **NO gradients** anywhere in the application shell or UI components
  - **NO glassmorphism** or heavy `backdrop-blur`
  - **NO neon or glowing effects**
  - **NO decorative thermal colors** — thermal state colors are semantic overlays only
- **Semantic Thermal Overlays:**
  - Under-Comfort / Cold: `#3b82f6` (blue, ≤12°C)
  - Comfort / Stable: `#22c55e` (green, 18°C – 26°C)
  - Overheating / Hot: `#ef4444` (red, ≥35°C)
  - Warning / Intermediate: `#f59e0b` (amber, 12°C–18°C and 26°C–35°C)
- **Architectural Neutrals:**
  - Slate Ink (Primary Text): `#0f172a`
  - Slate Secondary (Subtle Text): `#475569`
  - Slate Muted (Metadata / Labels): `#64748b`
  - Border Subtle: `#e2e8f0`
  - Warm Fog: `#e5e7eb`

### 2.2 Canonical `styles/tokens.css` Specification
`styles/tokens.css` must be the **ONLY** file containing color hex values, border-radius values, shadow definitions, and font-family strings. Tailwind CSS v4's `@theme` directive exposes these tokens directly to the utility engine:

```css
@import "tailwindcss";

@theme {
  /* Canvas & Surfaces */
  --color-canvas: #f2f4f5;
  --color-surface: #ffffff;
  --color-surface-hover: #fafafa;
  --color-surface-active: #f4f4f5;

  /* Primary Accent: Shop Violet */
  --color-shop-violet: #5433eb;
  --color-shop-violet-hover: #4628c7;
  --color-shop-violet-subtle: #ece8fd;
  --color-shop-violet-border: #d4ccfb;

  /* Neutrals & Typography */
  --color-slate-ink: #0f172a;
  --color-slate-secondary: #475569;
  --color-slate-muted: #64748b;
  --color-warm-fog: #e5e7eb;
  --color-border-subtle: #e2e8f0;
  --color-border-active: #cbd5e1;

  /* Semantic Thermal Overlays */
  --color-thermal-cold: #3b82f6;
  --color-thermal-cold-subtle: #eff6ff;
  --color-thermal-comfort: #22c55e;
  --color-thermal-comfort-subtle: #f0fdf4;
  --color-thermal-hot: #ef4444;
  --color-thermal-hot-subtle: #fef2f2;
  --color-thermal-warn: #f59e0b;
  --color-thermal-warn-subtle: #fffbeb;

  /* Border Radii */
  --radius-card: 28px;
  --radius-inner: 20px;
  --radius-pill: 9999px;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;

  /* Shadows */
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-card-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-dropdown: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);

  /* Fonts */
  --font-sans: "GT Standard", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
}

/* shadcn/ui Variable Mapping */
:root {
  --background: var(--color-canvas);
  --foreground: var(--color-slate-ink);

  --card: var(--color-surface);
  --card-foreground: var(--color-slate-ink);

  --popover: var(--color-surface);
  --popover-foreground: var(--color-slate-ink);

  --primary: var(--color-shop-violet);
  --primary-foreground: #ffffff;

  --secondary: var(--color-warm-fog);
  --secondary-foreground: var(--color-slate-ink);

  --muted: var(--color-warm-fog);
  --muted-foreground: var(--color-slate-muted);

  --accent: var(--color-shop-violet-subtle);
  --accent-foreground: var(--color-shop-violet);

  --destructive: var(--color-thermal-hot);
  --destructive-foreground: #ffffff;

  --border: var(--color-border-subtle);
  --input: var(--color-border-subtle);
  --ring: var(--color-shop-violet);

  --radius: var(--radius-card);
}
```

---

## 3. Required File Architecture

The file architecture must conform strictly to lines 42–69 of `ORIGINAL_REQUEST.md`:

```
trueshel/
├── app/
│   ├── layout.tsx                                    # Root HTML, font setup, providers
│   ├── page.tsx                                      # Root entry redirect -> /dashboard or /onboarding
│   ├── onboarding/
│   │   └── page.tsx                                  # Onboarding wizard (isolated layout)
│   └── (workspace)/
│       ├── layout.tsx                                # Shared workspace layout (Rail + Header)
│       ├── dashboard/
│       │   └── page.tsx                              # Multi-panel command center
│       ├── climate/
│       │   └── page.tsx                              # Climate explorer & Ladakh dataset
│       ├── shelter/
│       │   ├── page.tsx                              # Integrated single-page workspace (40/60 split)
│       │   ├── geometry/page.tsx                     # Direct sub-view: Geometry tab
│       │   ├── envelope/page.tsx                     # Direct sub-view: Envelope tab
│       │   ├── materials/page.tsx                    # Direct sub-view: Material library tab
│       │   ├── openings/page.tsx                     # Direct sub-view: Openings tab
│       │   ├── thermal-mass/page.tsx                 # Direct sub-view: Thermal Mass tab
│       │   ├── pcm/page.tsx                          # Direct sub-view: PCM tab
│       │   └── summary/page.tsx                      # Direct sub-view: Shelter Summary tab
│       ├── simulation/
│       │   ├── page.tsx                              # Simulation index redirect
│       │   ├── setup/page.tsx                        # Simulation parameter setup form
│       │   ├── running/page.tsx                      # Multi-stage execution stepper + MOCK DATA tag
│       │   ├── results/page.tsx                      # Primary results dashboard
│       │   ├── temperature/page.tsx                  # Temperature deep dive
│       │   ├── heat-flow/page.tsx                    # Heat flow vectors & transmission
│       │   ├── solar/page.tsx                        # Solar irradiance & gains
│       │   ├── comfort/page.tsx                      # PMV/PPD & comfort hours
│       │   └── thermal-state/page.tsx                # Under-comfort / Comfort / Overheat states
│       ├── compare/
│       │   └── page.tsx                              # Side-by-side design comparison (A vs B)
│       ├── optimization/
│       │   └── page.tsx                              # Multi-objective Pareto optimization
│       ├── recommendation/
│       │   └── page.tsx                              # Engineering recommendation justification
│       ├── resilience/
│       │   ├── page.tsx                              # Resilience overview & autonomy metrics
│       │   ├── autonomy/page.tsx                     # Thermal autonomy decay to 16°C
│       │   ├── climate-risk/page.tsx                 # Extreme climate risk analysis
│       │   ├── degradation/page.tsx                  # Multi-year material degradation
│       │   └── failure-intelligence/page.tsx         # Pattern database & RAG vector stub
│       ├── thermal-twin/
│       │   └── page.tsx                              # Fullscreen standalone 3D R3F digital twin
│       ├── reports/
│       │   └── page.tsx                              # Thermal report generator (PDF & JSON export)
│       └── settings/
│           └── page.tsx                              # Engineering units, solver config, profile
├── components/
│   ├── ui/                                           # Pre-configured shadcn tokens components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx                                 # Drawer for wall-layer editor
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── tooltip.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── scroll-area.tsx
│   │   ├── progress.tsx
│   │   └── separator.tsx
│   ├── layout/                                       # Shell framing components
│   │   ├── app-shell.tsx                             # Master workspace container
│   │   ├── sidebar-rail.tsx                          # Desktop 64px/240px collapsible navigation rail
│   │   ├── header-bar.tsx                            # Top header with project picker + CTA
│   │   ├── mobile-bottom-bar.tsx                     # Mobile sticky navigation rail (<768px)
│   │   ├── page-header.tsx                           # Standardized page title + action strip
│   │   └── page-transition.tsx                       # Framer Motion wrapper
│   ├── charts/                                       # Recharts visualizers wrapped in 28px cards
│   │   ├── temperature-chart.tsx                     # Dual-line 24h temp with comfort band
│   │   ├── heat-loss-bar-chart.tsx                   # Component contribution breakdown
│   │   ├── solar-gain-chart.tsx                      # Hourly solar radiation
│   │   └── thermal-state-timeline.tsx                # 24h segmented colored timeline
│   ├── metrics/                                      # Metric display widgets
│   │   ├── metric-card.tsx                           # Value + unit + label + trend + 28px card
│   │   ├── metric-strip.tsx                          # 5-card horizontal command strip
│   │   └── semantic-badge.tsx                        # Cold/comfort/hot semantic pills
│   ├── forms/                                        # Form controls
│   │   ├── number-field.tsx                          # Pill-styled numeric input
│   │   ├── slider-field.tsx                          # Pill-styled slider with readout
│   │   └── segmented-control.tsx                     # Pill toggle group
│   ├── engineering/                                  # Domain-specific controls
│   │   ├── wall-layer-builder.tsx                    # Drag-and-drop layer stack with R/U calculation
│   │   ├── material-picker.tsx                       # Searchable material library modal
│   │   ├── orientation-compass.tsx                   # 360-degree orientation selector
│   │   └── autonomy-decay-diagram.tsx                # Temperature decay curve to 16°C
│   └── feedback/                                     # System feedback
│       ├── simulation-stepper.tsx                    # 8-step engine progress tracker
│       └── mock-data-banner.tsx                      # Explicit "MOCK DATA" banner
├── features/
│   ├── climate/                                      # Climate domain logic & components
│   ├── shelter/                                      # Shelter domain logic & components
│   ├── simulation/                                   # Simulation runner & visualizers
│   ├── comparison/                                   # Comparison matrix logic
│   ├── optimization/                                 # Pareto solver & candidate grid
│   ├── resilience/                                   # Survivability & risk models
│   ├── intelligence/                                 # Failure patterns & RAG architecture
│   └── thermal-twin/                                 # Procedural 3D R3F digital twin
├── lib/
│   ├── api/                                          # API client & TanStack Query wrappers
│   ├── calculations/                                 # R-value, U-value, solar, autonomy math
│   ├── constants/                                    # Default presets, material properties
│   ├── validators/                                   # Zod schemas for all domain entities
│   └── utils/                                        # cn() utility, formatting helpers
├── stores/
│   ├── project-store.ts                              # Active project, metadata, presets
│   ├── shelter-store.ts                              # Dimensions, envelope, openings, materials
│   ├── simulation-store.ts                           # Timelines, 24h results, solver status
│   └── thermal-twin-store.ts                         # Active timestep, camera, mode switcher
├── types/
│   ├── climate.ts
│   ├── shelter.ts
│   ├── material.ts
│   ├── simulation.ts
│   ├── recommendation.ts
│   └── resilience.ts
├── public/
│   ├── models/                                       # (Empty - strictly zero external 3D models)
│   ├── textures/                                     # Procedural texture stubs
│   ├── environments/                                 # Lighting presets
│   └── icons/                                        # SVG app icons
└── styles/
    ├── tokens.css                                    # SINGLE SOURCE OF TRUTH FOR ALL STYLING
    └── globals.css                                   # Base resets, html/body canvas background
```

---

## 4. Complete Route Topology & Page Specification

### 4.1 Route Catalog Matrix (14 Primary + 17 Sub-Routes)

| # | Route Path | Parent Layout | Purpose / Content | Key Elements |
|---|------------|---------------|-------------------|--------------|
| 1 | `/` | Root | Entry redirect | Inspects state; redirects to `/dashboard` or `/onboarding` |
| 2 | `/onboarding` | Root (Isolated) | First-run setup | Preset picker (Ladakh high-altitude), basic geometry seed, enter workspace CTA |
| 3 | `/dashboard` | `(workspace)` | **Primary Command Center** | 5-metric strip, 24h temp chart + comfort band, embedded 16:9 3D twin, heat loss breakdown, 3 insight cards, thermal state badge |
| 4 | `/climate` | `(workspace)` | Climate Explorer | Ladakh profile, extreme diurnal swing (-15°C to +8°C), solar irradiance (>800 W/m²), ambient pressure (65 kPa), monthly curves |
| 5 | `/shelter` | `(workspace)` | **Shelter Designer Workspace** | Single-page 40/60 split: 40% live procedural 3D preview, 60% tabbed parameter panels, wall-layer builder drawer, material library inspector |
| 5a | `/shelter/geometry` | `(workspace)` | Shelter Sub-view | Deep link to Geometry panel (L, W, H, orientation) |
| 5b | `/shelter/envelope` | `(workspace)` | Shelter Sub-view | Deep link to Wall/Roof/Floor assemblies & layer builder drawer |
| 5c | `/shelter/materials` | `(workspace)` | Shelter Sub-view | Deep link to searchable Material Library & Inspector |
| 5d | `/shelter/openings` | `(workspace)` | Shelter Sub-view | Deep link to South glazing area, window/door count |
| 5e | `/shelter/thermal-mass`| `(workspace)` | Shelter Sub-view | Deep link to Trombe wall & floor thermal capacitance |
| 5f | `/shelter/pcm` | `(workspace)` | Shelter Sub-view | Deep link to Phase Change Material transition specs |
| 5g | `/shelter/summary` | `(workspace)` | Shelter Sub-view | Aggregate shelter bill of materials & overall heat transfer coefficient ($U_{avg}$) |
| 6 | `/simulation` | `(workspace)` | Simulation Index | Redirects to `/simulation/setup` or `/simulation/results` |
| 6a | `/simulation/setup` | `(workspace)` | Solver Configuration | Time horizon (24h/annual), timestep (1h/15m), comfort range (18–26°C), solver toggles |
| 6b | `/simulation/running` | `(workspace)` | Execution Stepper | 8-stage progress tracker with checkmarks, "MOCK DATA" banner |
| 6c | `/simulation/results` | `(workspace)` | Primary Results Panel | 5-metric summary, 24h temp chart, thermal state bar, heat flow chart, solar gain chart |
| 6d | `/simulation/temperature`| `(workspace)` | Deep Dive Result | Hourly indoor, outdoor, sol-air, and surface temperatures |
| 6e | `/simulation/heat-flow`| `(workspace)` | Deep Dive Result | Conduction, convection, radiation, and infiltration loss breakdowns |
| 6f | `/simulation/solar` | `(workspace)` | Deep Dive Result | Direct vs diffuse irradiance, solar aperture efficiency |
| 6g | `/simulation/comfort` | `(workspace)` | Deep Dive Result | PMV, PPD, adaptive comfort hours, cold discomfort hours |
| 6h | `/simulation/thermal-state`| `(workspace)`| Deep Dive Result | Under-comfort, Comfort, Overheating segment durations |
| 7 | `/compare` | `(workspace)` | Design Comparison | Side-by-side Design A vs B: parameters, stacked metrics, dual temp chart overlay, $\Delta$ directional metrics |
| 8 | `/optimization` | `(workspace)` | Pareto Optimization | Objective function, parameter sliders, constraint boundaries, candidate table, best candidate selector |
| 9 | `/recommendation` | `(workspace)` | Engineering Insights | Full recommended configuration, engineering justification, key drivers list, transparent rules |
| 10 | `/resilience` | `(workspace)` | Resilience Command Center | Thermal autonomy (hours to 16°C), freeze-thaw risk, wind exposure, material degradation |
| 10a| `/resilience/autonomy` | `(workspace)` | Resilience Deep Dive | Passive survivability decay curve during total heating blackout |
| 10b| `/resilience/climate-risk`| `(workspace)`| Resilience Deep Dive | Multi-hazard assessment: extreme winter freeze, snow load, solar blackout |
| 10c| `/resilience/degradation` | `(workspace)`| Resilience Deep Dive | 20-year thermal performance degradation model (insulation moisture, seal leakage) |
| 10d| `/resilience/failure-intelligence`| `(workspace)`| Failure Knowledge Base | Pattern database (issue, climate, pattern, consequence, risk, mitigation, source) + RAG vector architecture stub |
| 11 | `/thermal-twin` | `(workspace)` | **Fullscreen 3D Digital Twin** | Full-viewport R3F canvas, procedural shelter, 5 visualization modes, 00:00–24:00 timeline scrubber, component inspector raycaster |
| 12 | `/reports` | `(workspace)` | Report Generation | Multi-section engineering report preview, client-side PDF export, structured JSON export |
| 13 | `/settings` | `(workspace)` | Application Settings | Units (Metric/Imperial), simulation solver tolerances, cache control, mock data overrides |

---

## 5. Persistent Desktop-First Shell & Responsive Layout Hierarchy

### 5.1 Shell Layout Architecture
The desktop-first shell consists of three primary regions:
```
+-----------------------------------------------------------------------------------------+
| [Header Bar]                                                                           |
|  [Logo / Title] | [Project Dropdown: Ladakh High-Altitude V1] | [Run Simulation CTA]    |
+-----------------------------------------------------------------------------------------+
| [Sidebar Rail]  | [Main Engineering Content Area]                                       |
|  64px collapsed |                                                                       |
|  icon rail      |  - 28px border-radius white cards (#ffffff)                          |
|  (expands to    |  - Dual-layer soft shadow                                             |
|   240px labeled |  - White canvas background (#f2f4f5)                                  |
|   on toggle)    |  - Framer Motion page transition wrapper                              |
|                 |                                                                       |
+-----------------------------------------------------------------------------------------+
| [Mobile Bottom Bar] (Visible only on <768px viewports)                                  |
+-----------------------------------------------------------------------------------------+
```

### 5.2 Responsive Breakpoint Specifications

| Breakpoint Tier | Viewport Width | Sidebar Rail Behavior | Top Header Bar | Main Content Area | Mobile Bottom Bar |
|-----------------|----------------|-----------------------|----------------|-------------------|-------------------|
| **Desktop** | $\ge 1440\text{px}$ | Persistent 64px icon rail; expands to 240px on user toggle; full tooltips | Full: Project selector, status pill, simulation badge, Shop Violet "Run Simulation" CTA | Multi-column grid (3-4 cols), full split view in `/shelter` (40% 3D / 60% panels) | Hidden (`hidden`) |
| **Laptop** | $1024\text{px} - 1439\text{px}$ | Persistent 64px icon rail (collapsed by default); tooltips on hover | Compact: Project selector + "Run Simulation" CTA | 2-column grid, responsive split view | Hidden (`hidden`) |
| **Tablet** | $768\text{px} - 1023\text{px}$ | Collapsed 64px rail or drawer sheet trigger | Compact header with icon CTA | Single or 2-column stacked grid; `/shelter` stacks 3D preview above panels | Hidden (`hidden`) |
| **Mobile** | $< 768\text{px}$ | Completely hidden (`hidden md:flex`) | Minimal: Compact logo, project badge, mobile menu sheet for secondary routes | Single-column vertically stacked cards; 100% width; horizontal scroll strictly prohibited | **Visible & Fixed** (`fixed bottom-0 left-0 right-0 z-50 md:hidden`): 5 key touch targets (Dashboard, Shelter, Sim, Twin, Reports) |

### 5.3 Viewport Compliance Verification Points
- `375px` (Mobile Small — iPhone SE / standard): Zero horizontal scroll. Padding `px-4`. Metric cards stack to 100% width. Header actions collapse into dropdown or sheet.
- `768px` (Tablet Portrait): Zero horizontal scroll. Padding `px-6`. Sidebar hidden or 64px rail. 2-column metric cards.
- `1024px` (Laptop Standard): Zero horizontal scroll. Sidebar rail active (64px). Full navigation accessible.
- `1440px` (Desktop Primary): Zero horizontal scroll. Maximum container width `max-w-7xl` or fluid engineering canvas with auto margins.

---

## 6. Header Bar & Navigation Rail Component Contracts

### 6.1 Header Bar (`components/layout/header-bar.tsx`)
- **Height:** 64px (`h-16`)
- **Background:** `bg-surface` (`#ffffff`) with subtle bottom border (`border-b border-border-subtle`)
- **Left Cluster:**
  - Sidebar rail expand/collapse toggle button
  - Brand Logo: "TRUESHEL" with Shop Violet badge "V2"
  - Breadcrumb or current route title
- **Center Cluster:**
  - Project Selector: Pill dropdown (`rounded-pill border border-border-subtle bg-surface px-4 py-1.5`) displaying active project name (e.g., `Ladakh Passive Shelter V1`) and thermal status pill (`COMFORT 21.4°C`)
- **Right Cluster:**
  - Quick action: "Run Simulation" CTA button styled in Shop Violet (`bg-shop-violet hover:bg-shop-violet/90 text-white rounded-pill px-5 py-2 font-medium shadow-none`)
  - Status indicator: Mock data badge or solver connection status
  - User / Settings icon button

### 6.2 Sidebar Navigation Rail (`components/layout/sidebar-rail.tsx`)
- **Width:**
  - Collapsed: 64px (`w-16`)
  - Expanded: 240px (`w-60`)
- **Background:** `bg-surface` (`#ffffff`) with right border (`border-r border-border-subtle`)
- **Navigation Items (10 Core Destinations):**
  1. Overview / Dashboard (`/dashboard`) — Icon: `LayoutDashboard`
  2. Climate (`/climate`) — Icon: `CloudSun`
  3. Shelter Designer (`/shelter`) — Icon: `Home`
  4. Simulation (`/simulation/results` / `/simulation/setup`) — Icon: `PlayCircle`
  5. Compare (`/compare`) — Icon: `GitCompare`
  6. Optimization (`/optimization`) — Icon: `Sliders`
  7. Recommendation (`/recommendation`) — Icon: `Sparkles`
  8. Resilience & Intelligence (`/resilience`) — Icon: `ShieldAlert`
  9. Thermal Twin (`/thermal-twin`) — Icon: `Box` (3D cube)
  10. Reports (`/reports`) — Icon: `FileText`
- **Bottom Controls:**
  - Settings (`/settings`) — Icon: `Settings`
  - Rail expand/collapse chevron button
- **Active State Styling:**
  - Background: `bg-shop-violet-subtle` (`#ece8fd`)
  - Icon & Text: `text-shop-violet` (`#5433eb`)
  - Indicator: Left pill accent bar or active pill indicator
- **Inactive State Styling:**
  - Text: `text-slate-muted` (`#64748b`)
  - Hover: `hover:bg-warm-fog/40 hover:text-slate-ink`

### 6.3 Mobile Bottom Navigation Bar (`components/layout/mobile-bottom-bar.tsx`)
- **Visibility:** `block md:hidden`
- **Height:** 64px (`h-16`) with safe-area-inset padding
- **Position:** `fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border-subtle`
- **5 Primary Touch Targets:**
  1. Dashboard (`/dashboard`)
  2. Shelter (`/shelter`)
  3. Simulation (`/simulation/results`)
  4. 3D Twin (`/thermal-twin`)
  5. Menu / More (opens slide-up sheet containing Climate, Compare, Optimization, Resilience, Reports, Settings)

---

## 7. Framer Motion Transition System & Micro-Interactions

### 7.1 Page Transition Specification
Transitions must feel instantaneous and professional, avoiding gratuitous animations:
```tsx
export const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { 
    opacity: 0, 
    y: -4,
    transition: { duration: 0.12, ease: [0.16, 1, 0.3, 1] } 
  }
};
```

### 7.2 Micro-Interactions Catalog
1. **Active Tab Indicator:** `layoutId="activeTab"` with spring transition (`type: "spring", stiffness: 500, damping: 35`) on pill tabs in `/shelter` and `/simulation`.
2. **Elevated Card Hover:** Subtle vertical translation (`y: -2px`) and shadow transition to `--shadow-card-hover` on interactive metric and insight cards.
3. **Primary Action Press:** Tactile button compression (`whileTap={{ scale: 0.98 }}`) for Shop Violet CTAs.
4. **Timeline Scrubber:** Smooth slider knob tracking with instantaneous numeric badge update.
5. **Simulation Stepper Checklist:** Sequential checkmark reveal with spring pop animation.

---

## 8. Shadcn/ui Pre-Configuration Matrix with Shop Design Tokens

| shadcn Component | Target Token Class / Behavior | Shop Design Compliance Rule |
|------------------|-------------------------------|-----------------------------|
| **Button** | `rounded-pill px-5 py-2 font-medium transition-colors` | Primary: `bg-shop-violet text-white hover:bg-shop-violet/90`. No arbitrary border radius. |
| **Card** | `rounded-card bg-surface shadow-card border-none` | Exactly `28px` radius (`--radius-card`) and dual-layer soft shadow. |
| **Input / NumberField** | `rounded-pill bg-surface border border-border-subtle px-4 py-2 text-slate-ink focus-visible:ring-shop-violet` | Full `9999px` pill radius; focus ring in Shop Violet. |
| **Badge** | `rounded-pill px-3 py-1 font-medium text-xs` | Cold: `bg-thermal-cold/10 text-thermal-cold`. Comfort: `bg-thermal-comfort/10 text-thermal-comfort`. Hot: `bg-thermal-hot/10 text-thermal-hot`. |
| **Tabs / TabList** | `rounded-pill bg-warm-fog/50 p-1` | Container is a pill. Active tab is an inner white pill (`bg-surface text-slate-ink shadow-sm rounded-pill`). |
| **Drawer / Sheet** | `bg-surface rounded-l-card p-6 shadow-card` | Wall-layer editor drawer slides in with 28px rounded inner corners. |
| **Dialog / Modal** | `bg-surface rounded-card p-6 shadow-card max-w-lg` | Centered 28px card with dual-layer soft shadow; no harsh borders. |
| **Slider** | Track: `bg-warm-fog rounded-pill`. Range: `bg-shop-violet rounded-pill`. Thumb: `rounded-pill bg-surface border-2 border-shop-violet shadow-sm`. | Used in `/shelter` geometry sliders and `/thermal-twin` timeline scrubber. |
| **Tooltip** | `rounded-pill bg-slate-ink text-white px-2.5 py-1 text-xs shadow-dropdown` | Clean pill tooltip for collapsed sidebar icons and chart markers. |
| **Switch** | `rounded-pill bg-warm-fog data-[state=checked]:bg-shop-violet` | Clean toggle for PCM, thermal mass, and solar shading options. |

---

## 9. Strict Token Isolation & Zero-Hardcoding Enforcement Strategy

To satisfy the acceptance criteria:
- **`styles/tokens.css` is the ONLY file containing raw hex codes, pixel radius values, or shadow definitions.**
- **Prohibited Patterns:**
  - `#[0-9a-fA-F]{3,6}` in any `.tsx`, `.ts`, or `.css` file outside `tokens.css`
  - `rounded-[28px]`, `rounded-[9999px]`, `rounded-[20px]` in JSX classes
  - `shadow-[0_4px_...]` or ad-hoc shadow classes
  - `style={{ color: '#5433eb' }}` or any inline style with color/shadow/radius
- **Enforcement & Verification:**
  - Automated ripgrep check: `grep -rnI --exclude="styles/tokens.css" --exclude="*.svg" "#" src/ app/ components/`
  - Automated border-radius check: `grep -rnI "rounded-\[" app/ components/`
  - Build validation: `npm run build` with strict ESLint and TypeScript checks.

---

## 10. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | App Shell | Collapsible Left Navigation Rail | Desktop-first sidebar rail (64px icon-only expands to 240px labeled) | Route state, expand/collapse toggle | Rendered rail with active route pill | Falls back to 64px on laptop; hidden on mobile | ORIGINAL_REQUEST.md lines 36, 238 |
| 2 | App Shell | Persistent Header Bar | Top bar across workspace with project selector and global CTA | Active project state, simulation status | Rendered header with "Run Simulation" Shop Violet button | Displays default preset if project unselected | ORIGINAL_REQUEST.md lines 36, 242 |
| 3 | App Shell | Mobile Bottom Navigation Bar | Fixed bottom bar (<768px) with 5 primary touch destinations | Viewport width <768px | Bottom navigation bar with safe-area spacing | Auto-hides on desktop/tablet | ORIGINAL_REQUEST.md lines 39, 238 |
| 4 | App Shell | Workspace Route Group `(workspace)` | Shared layout wrapping all authenticated routes | Child page components | Rendered layout with rail, header, and animated content outlet | 404 on invalid child path | ORIGINAL_REQUEST.md lines 38, 49 |
| 5 | App Shell | Isolated Onboarding Route | First-run onboarding wizard outside `(workspace)` group | User preset selection (Ladakh) | Redirect to `/dashboard` with initialized state | Validates inputs before persisting | ORIGINAL_REQUEST.md lines 38, 48 |
| 6 | Design System | Single Source of Truth Tokens | Central `styles/tokens.css` defining all colors, radii, shadows, fonts | CSS custom properties + `@theme` | Tailwind utility classes (`bg-canvas`, `rounded-card`, etc.) | Build fails if referenced tokens are undefined | ORIGINAL_REQUEST.md lines 15, 34, 237 |
| 7 | Design System | Shop Elevated Card Spec | 28px border radius + dual-layer soft shadow on white surface | Card container element | Rendered card matching Shop design DNA | Rejects arbitrary inline border radii | ORIGINAL_REQUEST.md lines 20, 22, 243 |
| 8 | Design System | Pill Button & Input Spec | 9999px border radius on all buttons, inputs, pills, badges | User interaction elements | High-tactile pill controls | Enforced via pre-configured shadcn tokens | ORIGINAL_REQUEST.md lines 20, 244 |
| 9 | Design System | Shop Violet Primary Accent | `#5433eb` fill reserved for primary CTAs and active states | Button click / active route | Solid Shop Violet fill with white text | Disallows decorative misuse on general backgrounds | ORIGINAL_REQUEST.md lines 19, 242 |
| 10 | Design System | Semantic Thermal State Overlays | Cold (`#3b82f6`), Comfort (`#22c55e`), Hot (`#ef4444`) overlays | Simulation temperature values | Color-coded badges, cards, and timeline segments | Defaults to neutral if temp is undefined | ORIGINAL_REQUEST.md lines 24, 148, 257 |
| 11 | Design System | GT Standard / Inter Typography | Clean typography using letter-spacing tracking rather than heavy weights | Text content | Rendered text with clean tracking | Fallback to Inter / system-ui | ORIGINAL_REQUEST.md lines 21, 246 |
| 12 | Navigation | 14 Primary Routes Implementation | Complete route coverage across engineering lifecycle | URL routing | Rendered route views without runtime errors | Fallback 404 or redirect | ORIGINAL_REQUEST.md lines 37, 236 |
| 13 | Navigation | Shelter Sub-Section Views | Dedicated deep links for geometry, envelope, materials, openings, pcm | URL sub-paths | Activated tabs in `/shelter` workspace | Default to `/shelter` tab 0 if invalid | ORIGINAL_REQUEST.md line 53 |
| 14 | Navigation | Simulation Sub-Result Pages | Deep-dive views for temp, heat-flow, solar, comfort, thermal-state | Simulation result data | Specialized engineering analysis dashboards | Redirects to setup if no simulation exists | ORIGINAL_REQUEST.md lines 54, 190 |
| 15 | Navigation | Resilience Sub-Pages | Sub-views for autonomy, climate risk, degradation, failure intel | Resilience models | Focused survivability visualizations | Graceful degradation with mock data | ORIGINAL_REQUEST.md lines 58, 216 |
| 16 | Animation | Framer Motion Page Transitions | Subtle page fade/slide-up (`opacity: 0, y: 6` -> `1, 0`) | Route change event | Smooth, non-distracting visual transition | Graceful fallthrough if reduced motion preferred | ORIGINAL_REQUEST.md lines 40, 236 |
| 17 | Animation | Active Nav & Tab Spring Indicator | LayoutId-driven spring sliding pill under active nav/tab | Tab selection event | Gliding white pill background | Snaps immediately on initial render | ORIGINAL_REQUEST.md lines 40, 108 |
| 18 | Components | Pre-configured shadcn/ui Library | Accessible UI primitives styled strictly with Shop tokens | Props & children | Fully styled components matching tokens.css | Typescript compilation error on invalid props | ORIGINAL_REQUEST.md lines 35, 62 |

---

## 11. Edge Cases Table

| # | Feature | Input / Condition | Observed / Documented Behavior |
|---|---------|-------------------|--------------------------------|
| 1 | Responsive Shell | Resizing viewport dynamically from 1440px to 375px | Rail collapses smoothly at 1024px, completely hides at <768px; bottom bar mounts at <768px without layout flash or horizontal scroll. |
| 2 | Navigation Rail | Rapid double-clicking route icons | Framer Motion handles route exit/entry cleanly without orphan DOM nodes or layout shift. |
| 3 | Route Deep Linking | Directly loading `/shelter/materials` via browser address bar | `/shelter` workspace loads with the Material Library tab active and 3D preview rendered without requiring navigation from `/shelter`. |
| 4 | First Load State | Visiting `/` without existing project in localStorage | App inspects state; smoothly redirects to `/onboarding` to initialize default Ladakh preset. |
| 5 | Token Strictness | Attempting to use Tailwind `rounded-xl` or ad-hoc `#5433eb` in component | Linter / token validator detects token bypass; requires `rounded-card` or `bg-shop-violet` from `tokens.css`. |
| 6 | Thermal State Badge | Temperature exactly on boundary (e.g. 18.0°C or 26.0°C) | Boundary condition classified as `COMFORT` (`18.0 <= T <= 26.0`), rendering green semantic pill. |
| 7 | Mobile Drawer Menu | Opening "More" sheet on mobile (<768px) and rotating to landscape | Sheet adjusts max-height with internal scroll; backdrop dismisses on tap outside; locks body scroll. |
| 8 | Header "Run Simulation" | Clicking CTA while simulation is already in progress | Button displays running spinner and disables further clicks until run finishes. |
| 9 | Font Loading Fallback | GT Standard webfont fails to load or CDN blocked | CSS font stack immediately falls back to `Inter` and `system-ui` without layout shift (FOUT/FOIT mitigated). |
| 10 | Card Shadow Rendering | High-DPI screens and dark mode browser overrides | Shadow retains soft dual-layer opacity; background remains `#f2f4f5` white canvas (dark mode force-inversion disabled). |

---

## 12. Acceptance Criteria Traceability Matrix

| Acceptance Criterion | Verification Method | Status / Implementation Requirement |
|----------------------|---------------------|-------------------------------------|
| `npm run build` completes with zero TypeScript errors and zero ESLint errors | Run `npm run build` | Strict TypeScript types across all layout and shell components; zero `any`. |
| All 14 navigation routes render without runtime errors in browser console | Automated Next.js route crawler & Playwright tests | Every route in catalog has a valid, export-default `page.tsx` rendering without hydration errors. |
| `styles/tokens.css` is the only file containing color hex values, radii, shadows, font-family | Ripgrep regex audit script | Enforced via pre-commit audit and automated check script. |
| Sidebar nav collapses to icon-only at <1024px and bottom bar at <768px | Playwright viewport snapshot tests (1440px, 1024px, 768px, 375px) | CSS media queries / responsive Tailwind utility classes (`hidden md:flex`, `block md:hidden`). |
| No horizontal scroll at 1440px, 1024px, 768px, or 375px | Playwright scroll width check (`scrollWidth === clientWidth`) | `overflow-x-hidden` on root container; all card grids use responsive flex/grid wrappers. |
| Primary buttons use Shop Violet `#5433eb` fill with white text | DOM element CSS inspection | `bg-shop-violet text-white` applied to all primary variant buttons. |
| Metric cards use 28px border radius and dual-layer soft shadow | Computed style evaluation | Card uses `rounded-card` (`28px`) and `shadow-card` tokens. |
| All inputs and pill controls use `border-radius: 9999px` | Computed style evaluation | Inputs, badges, segmented controls use `rounded-pill`. |
| Font family resolves to GT Standard or Inter fallback | Computed style evaluation | `font-sans` applied to `<body>` and inherited globally. |

---

## 13. Recommendations for Milestone 1 Implementation

1. **Bootstrap Sequence:**
   - Initialize Next.js 15 App Router with TypeScript and Tailwind CSS v4.
   - Immediately create `styles/tokens.css` with the exact token set defined in Section 2.2.
   - Configure `styles/globals.css` to import `tokens.css` and set base styles (`bg-canvas`, `text-slate-ink`, `font-sans`, `overflow-x-hidden`).
   - Create pre-configured shadcn/ui components in `components/ui/` that map exclusively to these tokens.
2. **Layout Scaffold:**
   - Implement `app/layout.tsx` with font loading and query/state providers.
   - Implement `app/(workspace)/layout.tsx` containing `SidebarRail`, `HeaderBar`, and `MobileBottomBar`.
   - Implement `app/page.tsx` with automatic redirection logic.
   - Implement `app/onboarding/page.tsx` with dedicated clean layout.
3. **Route Scaffold:**
   - Create the directory hierarchy and stub `page.tsx` for all 14 primary routes and 17 sub-routes to ensure the entire routing tree compiles cleanly on day one.

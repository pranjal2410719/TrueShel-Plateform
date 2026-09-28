# Project: TRUESHEL V2

## Architecture
TRUESHEL V2 is a professional climate-to-shelter thermal engineering web application built with Next.js 15, TypeScript, Tailwind CSS v4, and React Three Fiber.
- **Styling Architecture**: Driven exclusively by `styles/tokens.css` (CSS custom properties + Tailwind v4 `@theme` block) implementing Shop design DNA. Zero raw hex codes or pixel radii outside `tokens.css`.
- **State Architecture**: 4 decoupled Zustand stores (`project-store`, `shelter-store`, `simulation-store`, `thermal-twin-store`) accessed via atomic selectors and `useShallow`. Validated at boundaries by Zod schemas.
- **Physics & Calculation Core**: Real-time ISO 6946 multi-layer thermal resistance ($R, U$), high-altitude barometric air infiltration at 3,500m AMSL, clear-sky solar irradiance, and lumped capacitance exponential decay for thermal autonomy to 16°C.
- **Procedural 3D Thermal Digital Twin**: React Three Fiber + Three.js primitives ONLY (`BoxGeometry`, `BufferGeometry`, `PlaneGeometry`). Strict ZERO external 3D models (no GLTF/OBJ/GLB/Blender) and ZERO external physics engines (no rapier/cannon). 5 shader visualization modes (Normal, Thermal, Heat Flow, Solar, Storage), 24h timeline synchronization, raycasting component inspector, dual embed (Dashboard/Results card vs `/thermal-twin` full-screen).
- **Navigation & Routing**: Persistent App Shell (64px desktop rail expanding to 240px, top header bar with Shop Violet CTA, mobile bottom bar <768px). 14 primary navigation routes + 17 nested sub-routes.
- **Dual Track Orchestration**: Implementation Track (M1–M7) and parallel E2E Testing Track (Tiers 1–4, culminating in `TEST_READY.md`).

## Code Layout
```
trueshel/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   └── (workspace)/
│       ├── layout.tsx
│       ├── dashboard/
│       │   └── page.tsx
│       ├── climate/
│       │   └── page.tsx
│       ├── shelter/
│       │   ├── page.tsx
│       │   └── [subsections]/
│       ├── simulation/
│       │   ├── page.tsx
│       │   ├── setup/page.tsx
│       │   ├── running/page.tsx
│       │   ├── results/page.tsx
│       │   ├── temperature/page.tsx
│       │   ├── heat-flow/page.tsx
│       │   ├── solar/page.tsx
│       │   ├── comfort/page.tsx
│       │   └── thermal-state/page.tsx
│       ├── compare/
│       │   └── page.tsx
│       ├── optimization/
│       │   └── page.tsx
│       ├── recommendation/
│       │   └── page.tsx
│       ├── resilience/
│       │   ├── page.tsx
│       │   ├── autonomy/page.tsx
│       │   ├── climate-risk/page.tsx
│       │   ├── degradation/page.tsx
│       │   └── failure-intelligence/page.tsx
│       ├── thermal-twin/
│       │   └── page.tsx
│       ├── reports/
│       │   └── page.tsx
│       └── settings/
│           └── page.tsx
├── components/
│   ├── ui/ (button, card, dialog, drawer, input, slider, badge, tabs, tooltip, select)
│   ├── layout/ (app-shell, navigation-rail, header-bar, mobile-nav, page-container)
│   ├── charts/ (thermal-response-chart, heat-loss-bar-chart, solar-gain-chart, comfort-band-chart)
│   ├── metrics/ (metric-card, metric-strip, state-badge, trend-indicator)
│   ├── forms/ (dimension-inputs, orientation-picker, layer-row, constraint-form)
│   ├── engineering/ (wall-layer-builder, material-inspector, calculation-audit, autonomy-decay)
│   └── feedback/ (simulation-stepper, mock-data-pill, empty-state, error-banner)
├── features/
│   ├── climate/ (components, hooks, data)
│   ├── shelter/ (geometry-panel, envelope-panel, material-library, layer-stack, openings-panel, pcm-panel)
│   ├── simulation/ (setup-form, engine-stepper, results-dashboard, sub-views)
│   ├── comparison/ (design-diff-table, dual-curve-chart, delta-metrics)
│   ├── optimization/ (objective-controls, candidate-table, pareto-frontier)
│   ├── resilience/ (autonomy-card, climate-risk-matrix, degradation-timeline, failure-case-catalog)
│   ├── intelligence/ (rag-architecture-stub, evidence-chain-viewer)
│   └── thermal-twin/ (procedural-meshes, shaders, timeline-scrubber, controls, inspector, canvas-wrapper)
├── lib/
│   ├── api/ (client, query-keys)
│   ├── calculations/ (r-value, u-value, solar-radiation, heat-balance, autonomy-decay, pcm-phase)
│   ├── constants/ (materials-data, ladakh-climate-seed, design-presets, token-mappings)
│   ├── validators/ (project-schema, shelter-schema, simulation-schema, resilience-schema)
│   └── utils/ (formatting, export-json, export-pdf, cn)
├── stores/
│   ├── project-store.ts
│   ├── shelter-store.ts
│   ├── simulation-store.ts
│   └── thermal-twin-store.ts
├── types/
│   ├── climate.ts
│   ├── shelter.ts
│   ├── material.ts
│   ├── simulation.ts
│   ├── recommendation.ts
│   └── resilience.ts
├── public/
│   └── icons/
└── styles/
    ├── tokens.css (SINGLE SOURCE OF STYLING TRUTH)
    └── globals.css
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Single Source of Truth Tokens | Central `styles/tokens.css` defining all colors, radii, shadows, fonts with `@theme` | M1 | Survey 1 (F6) |
| 2 | Shop Design DNA Styling | `#f2f4f5` canvas, `#ffffff` surface, 28px card radius, 9999px pills, soft dual shadow | M1 | Survey 1 (F7, F8) |
| 3 | Shop Violet Primary Accent | `#5433eb` reserved for primary CTAs and active states | M1 | Survey 1 (F9) |
| 4 | GT Standard / Inter Typography | Clean typography using letter-spacing tracking rather than heavy weights | M1 | Survey 1 (F11) |
| 5 | Collapsible Left Navigation Rail | Desktop-first sidebar rail (64px icon-only expands to 240px labeled) | M1 | Survey 1 (F1) |
| 6 | Persistent Header Bar | Top bar across workspace with project selector and global CTA "Run Simulation" | M1 | Survey 1 (F2) |
| 7 | Mobile Bottom Navigation Bar | Fixed bottom bar (<768px) with 5 primary touch destinations | M1 | Survey 1 (F3) |
| 8 | Workspace Route Group `(workspace)` | Shared layout wrapping all authenticated routes | M1 | Survey 1 (F4) |
| 9 | Isolated Onboarding Route | First-run onboarding wizard outside `(workspace)` group initializing state | M1 | Survey 1 (F5) |
| 10 | 14 Primary Routes Implementation | Complete route coverage across engineering lifecycle without runtime errors | M1 | Survey 1 (F12) |
| 11 | Shelter Sub-Section Views | Dedicated deep links for geometry, envelope, materials, openings, pcm | M1 | Survey 1 (F13) |
| 12 | Simulation Sub-Result Views | Deep-dive views for temp, heat-flow, solar, comfort, thermal-state | M1 | Survey 1 (F14) |
| 13 | Resilience Sub-Pages | Sub-views for autonomy, climate risk, degradation, failure intel | M1 | Survey 1 (F15) |
| 14 | Framer Motion Page Transitions | Subtle page fade/slide-up (`opacity: 0, y: 6` -> `1, 0`) | M1 | Survey 1 (F16) |
| 15 | Active Nav & Tab Spring Indicator | LayoutId-driven spring sliding pill under active nav/tab | M1 | Survey 1 (F17) |
| 16 | Pre-configured shadcn/ui Library | Accessible UI primitives styled strictly with Shop tokens | M1 | Survey 1 (F18) |
| 17 | Semantic Thermal State Overlays | Cold (`#3b82f6`), Comfort (`#22c55e`), Hot (`#ef4444`) overlays | M1 | Survey 1 (F10) |
| 18 | Canonical ProjectState Tree | Centralized project model encompassing all subsystems | M2 | Survey 2 (F1) |
| 19 | Canonical SimulationResult Shape | Comprehensive 24h transient simulation result holding aligned time series | M2 | Survey 2 (F2) |
| 20 | Zod Schema Validation Layer | Schema validation for all entities, requests, responses, and store inputs | M2 | Survey 2 (F3) |
| 21 | TanStack Query API Boundary | React Query query hooks and mutations with declarative caching | M2 | Survey 2 (F4) |
| 22 | Zustand Store: `project-store` | Manages active project identity, metadata, save/load status | M2 | Survey 2 (F5) |
| 23 | Zustand Store: `shelter-store` | Manages 3D geometry (L/W/H), orientation, envelope layers, openings, mass, PCM | M2 | Survey 2 (F6) |
| 24 | Zustand Store: `simulation-store` | Manages simulation setup configuration, progress, and `SimulationResult` | M2 | Survey 2 (F7) |
| 25 | Zustand Store: `thermal-twin-store` | Manages active 3D visualization mode, active timestep index (0..24), playback | M2 | Survey 2 (F8) |
| 26 | Store Selector Patterns | Decoupled cross-store access using atomic selectors and `useShallow` | M2 | Survey 2 (F9) |
| 27 | Ladakh High-Altitude Climate Seed | Real-world winter climate baseline for Leh (3500m AMSL, -15°C to -1.5°C, high GHI) | M2 | Survey 2 (F10) |
| 28 | Passive Solar Shelter Preset | Optimized high-altitude passive solar configuration | M2 | Survey 2 (F11) |
| 29 | 24h Aligned Simulation Timeline | Pre-computed hourly physics timeline populating all 14 routes | M2 | Survey 2 (F12) |
| 30 | ISO 6946 Multi-Layer R-Value Engine | Calculates thermal resistance $R_i = d_i / k_i$ and total $R_{\text{total}}$ & $U$ | M2 | Survey 2 (F13) |
| 31 | High-Altitude Air Infiltration Engine | Barometric-corrected air infiltration at 3,500m AMSL | M2 | Survey 2 (p.15) |
| 32 | Solar Radiation Irradiance Engine | Vertical glazing incident irradiance, clear sky solar model | M2 | Survey 2 (p.16) |
| 33 | Lumped Capacitance Autonomy Decay Engine | Exponential temperature decay predicting hours to 16°C threshold | M2 | Survey 2 (F26) |
| 34 | Material Library Catalog (14+ items) | Searchable, filterable catalog of materials with thermophysical properties | M3 | Survey 2 (F14) |
| 35 | Visual Wall-Layer Stack Editor | Interactive drawer editor showing layers EXTERIOR to INTERIOR with live R/U | M3 | Survey 2 (F15) |
| 36 | Thermal Mass & PCM Configuration | Parametric controls for mass level and bio-PCM phase change | M3 | Survey 2 (F16) |
| 37 | Shelter Designer Split Layout | Left 40% live 3D preview, Right 60% parameter panels | M3 | R4 Spec |
| 38 | Material Inspector Sidebar | Full thermophysical properties ($k, \rho, C_p, \epsilon, \alpha$) & Apply to Layer action | M3 | R4 Spec |
| 39 | Real-time Dimension Reactive Binding | Updating L/W/H reflects immediately in 3D scene (<200ms) | M3 | Survey 3 (F7) |
| 40 | Procedural Box Walls (`Wall.tsx`) | 4 cardinal walls generated procedurally via `BoxGeometry` | M4 | Survey 3 (F1) |
| 41 | Parametric Gabled Roof (`Roof.tsx`) | Dual-pitch gabled roof created procedurally via `BufferGeometry` / shapes | M4 | Survey 3 (F2) |
| 42 | Parametric Flat Roof (`Roof.tsx`) | Single slab flat roof with perimeter overhang | M4 | Survey 3 (F3) |
| 43 | Foundation Floor Slab (`Floor.tsx`) | Ground plane slab at $Y = 0$ with foundation pad | M4 | Survey 3 (F4) |
| 44 | South Glazing Aperture (`Window.tsx`) | Passive solar window positioned on south wall face | M4 | Survey 3 (F5) |
| 45 | Architectural Door (`Door.tsx`) | Standard access door placed on south/east wall | M4 | Survey 3 (F6) |
| 46 | Normal Mode Architectural Rendering | Neutral architectural rendering using Shop design tokens (`warm-fog`, `slate-ink`) | M4 | Survey 3 (F8) |
| 47 | Thermal Mode Shader Ramp | Custom GLSL shader mapping surface temp to blue/green/red gradient | M4 | Survey 3 (F9) |
| 48 | Heat Flow Flux Vectors / Particles | Particle system or instanced arrows showing flux direction and rate | M4 | Survey 3 (F10) |
| 49 | Solar Irradiance Overlay | Incident solar radiation overlay on roof & south wall (`uSolarIntensity`) | M4 | Survey 3 (F11) |
| 50 | Thermal Storage / PCM Charge Shader | Visualizes thermal mass & PCM phase change charge % | M4 | Survey 3 (F13) |
| 51 | 24-Hour Timeline Scrubber (`TwinTimeline`) | Interactive slider scrubbing 00:00 to 24:00 simulation data | M4 | Survey 3 (F14) |
| 52 | Play/Pause Auto-Advance Engine | Advances simulation timestep at 1 hour per second | M4 | Survey 3 (F15) |
| 53 | Live Synchronized Telemetry Header | Displays outdoor temp, solar flux, indoor temp, and state pill | M4 | Survey 3 (F16) |
| 54 | OrbitControls & Camera Reset Action | Rotate, pan, zoom controls; reset button returns to default isometric view | M4 | Survey 3 (F17, F18) |
| 55 | Raycasting Component Selection & Inspector | Pointer click highlights component and opens thermal inspector card | M4 | Survey 3 (F19, F20) |
| 56 | Full-Screen Thermal Twin Page | Standalone `/thermal-twin` route with full viewport command center | M4 | Survey 3 (F22) |
| 57 | SSR-Safe Canvas Mount Pipeline | Client-only Canvas mount preventing Node SSR crash during build | M4 | Survey 3 (F25) |
| 58 | Strict Zero-External-Model Enforcement | Zero GLTF/OBJ/GLB/Blender files, zero rapier/cannon packages | M4 | Survey 3 (F26) |
| 59 | Dashboard 5-Metric Strip | Indoor Temp, Comfort Hours, Heat Loss, Solar Gain, Autonomy cards | M5 | R3 Spec |
| 60 | 24-Hour Thermal Response Chart | Recharts line chart of indoor vs outdoor temp, comfort band (18–26°C), time marker | M5 | R3 Spec |
| 61 | Dashboard 3D Thermal Twin Embed | 16:9 embedded R3F scene with timeline scrubber and mode toggle | M5 | R3 Spec, Survey 3 (F21) |
| 62 | Heat Loss Breakdown Chart | Horizontal bar chart showing % contribution by component (Roof, Walls, Floor, etc.) | M5 | R3 Spec |
| 63 | Top 3 Design Insight Cards | Actionable engineering insights derived from current simulation result | M5 | R3 Spec |
| 64 | Simulation Setup Configuration Form | Form for duration, time step, comfort range, and feature toggles | M6 | Survey 2 (F17) |
| 65 | Multi-Stage Simulation Engine Stepper | 8-stage progress checklist with checkmark animations + MOCK DATA pill | M6 | Survey 2 (F17) |
| 66 | Simulation Results Multi-Panel Dashboard | Results dashboard with metrics, charts, thermal state timeline, 3D embed | M6 | Survey 2 (F17), Survey 3 (F23) |
| 67 | Sub-Result Deep Dives (5 views) | Temperature, Heat Flow, Solar, Comfort, and Thermal State focused dashboards | M6 | Survey 2 (F18-F22) |
| 68 | Side-by-Side Design Compare Module | Design A vs Design B comparison table, delta metrics, overlaid curves | M6 | Survey 2 (F23) |
| 69 | Parametric Shelter Optimization Module | Objective selector, variable toggles, constraints, best design candidate | M6 | Survey 2 (F24) |
| 70 | Evidence-Based Recommendation Module | Parameter recommendations, performance justifications, key physics drivers | M6 | Survey 2 (F25) |
| 71 | Resilience & Autonomy Analysis Module | Autonomy diagram (decay to 16°C), exposure metrics, climate risk matrix | M6 | Survey 2 (F26) |
| 72 | Failure Intelligence Repository | Case study catalog of cold-climate failures + RAG architecture stub | M6 | Survey 2 (F27) |
| 73 | Structured JSON Export | Exports schema-validated snapshot of ProjectState + SimulationResult | M6 | Survey 2 (F28) |
| 74 | Engineering PDF Report Generator | Compiles design report, climate profile, envelope schedule, charts to PDF | M6 | Survey 2 (F29) |
| 75 | E2E Opaque-Box Test Suite Pass | 100% pass on Tiers 1-4 opaque-box automated test suites | M7 | E2E Testing Track |
| 76 | Adversarial Coverage Hardening | Tier 5 white-box stress testing, boundary fuzzing, edge case closure | M7 | E2E Testing Track |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | App Shell & Design System | Next.js 15 App Router setup, `styles/tokens.css` with Shop design DNA, shadcn/ui integration, persistent desktop rail / mobile bottom bar, 14 routes + sub-routes skeletons, Framer Motion transitions | none | PLANNED |
| M2 | Data, Schemas & Physics Core | Canonical TypeScript interfaces, Zod schemas, 4 Zustand stores, `lib/calculations/` physics engines (R/U, solar, heat loss, autonomy decay), and `MockRepository` with Ladakh dataset | M1 | PLANNED |
| M3 | Shelter Designer Workspace | `/shelter` single-page workspace, 3D preview, visual wall-layer stack editor with live R/U calculations, 14-material searchable library, parameter controls | M1, M2 | PLANNED |
| M4 | Pure Three.js Procedural Thermal Twin | `features/thermal-twin/` procedural primitives (walls, roof, floor, window, door), 5 shader/overlay modes, 24h scrubber, OrbitControls, raycasting inspector, `/thermal-twin` page & embed components | M1, M2 | PLANNED |
| M5 | Dashboard & Telemetry | `/dashboard` command center: top 5 metric cards, 24h Recharts thermal response chart with shaded comfort band, embedded 3D twin, horizontal heat loss bar chart, 3 insight cards, semantic state badge | M1, M2, M4 | PLANNED |
| M6 | Simulation Workspace & Advanced Modules | Simulation setup, 8-stage stepper, results page, 5 deep-dive sub-results, `/compare`, `/optimization`, `/recommendation`, `/resilience` (autonomy decay & failure intel), `/reports` (PDF/JSON export) | M1, M2, M4, M5 | PLANNED |
| M7 | Final E2E Test Suite Pass & Adversarial Hardening | Verification of 100% passing E2E test suite (Tiers 1-4) published in `TEST_READY.md`, Tier 5 adversarial testing, Forensic Integrity Audit, and final handoff | M1, M2, M3, M4, M5, M6 | PLANNED |

## Parallel Track: E2E Testing Track
- **Orchestrator**: Dispatched in parallel with implementation track
- **Artifacts**: `TEST_INFRA.md`, automated opaque-box test suites (Tier 1 Feature, Tier 2 Boundary, Tier 3 Cross-feature, Tier 4 Real-world), culminating in `TEST_READY.md`.

## Interface Contracts
### `styles/tokens.css` ↔ All Components
- Single source of styling truth.
- CSS variables: `--color-canvas: #f2f4f5`, `--color-surface: #ffffff`, `--color-shop-violet: #5433eb`, `--radius-card: 28px`, `--radius-pill: 9999px`, `--shadow-soft-card: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)`.
- Semantic thermal state tokens: `--color-cold: #3b82f6`, `--color-comfort: #22c55e`, `--color-hot: #ef4444`.
- Tailwind v4 `@theme` block exposes classes: `bg-canvas`, `bg-surface`, `bg-shop-violet`, `rounded-card`, `rounded-pill`, `shadow-card`.

### `shelter-store` ↔ `thermal-twin` & `shelter` UI
- `useShelterStore`:
  - `geometry: { length: number, width: number, height: number, wallThickness: number }`
  - `orientation: number` (0–360 degrees)
  - `roof: { type: 'gabled' | 'flat', pitch: number, overhang: number }`
  - `openings: { windowArea: number, windowCount: number, doorCount: number }`
  - `envelope: { wallLayers: WallLayer[], roofLayers: WallLayer[], floorLayers: WallLayer[] }`
  - `thermalMass: { level: 'low' | 'medium' | 'high' | 'very-high', pcmEnabled: boolean, pcmTemp: number }`
  - `actions`: `setGeometry`, `setRoof`, `setOpenings`, `addWallLayer`, `removeWallLayer`, `reorderWallLayers`, `updateWallLayer`, `resetToPreset`

### `simulation-store` ↔ `thermal-twin` & `dashboard` & `simulation/results`
- `useSimulationStore`:
  - `status: 'idle' | 'running' | 'completed' | 'error'`
  - `progress: number` (0–100)
  - `activeStage: SimulationStage`
  - `config: SimulationConfig`
  - `result: SimulationResult | null`
  - `actions`: `runSimulation`, `setConfig`, `setResult`

### `thermal-twin-store` ↔ `R3F Scene` & `TwinTimeline`
- `useThermalTwinStore`:
  - `activeMode: 'normal' | 'thermal' | 'heat-flow' | 'solar' | 'storage'`
  - `activeTimestep: number` (0..24)
  - `isPlaying: boolean`
  - `playbackSpeed: number` (1 | 2 | 4)
  - `selectedComponentId: string | null`
  - `cameraTarget: [number, number, number]`
  - `actions`: `setMode`, `setTimestep`, `togglePlayback`, `selectComponent`, `resetCamera`

### `lib/calculations/` ↔ UI Components
- `calculateAssemblyThermalResistance(layers: WallLayer[], surfaceType: 'wall' | 'roof' | 'floor'): { rTotal: number, uValue: number }`
- `calculateSolarGain(surfaceArea: number, orientation: number, shgc: number, ghi: number, dni: number, dhi: number): number`
- `calculateHeatLoss(uValue: number, area: number, tInside: number, tOutside: number, infiltrationRate: number, altitude: number): { transmission: number, infiltration: number, total: number }`
- `calculateThermalAutonomy(thermalCapacitance: number, totalUA: number, tInsideInitial: number, tOutside: number, thresholdTemp?: number): { autonomyHours: number, decayCurve: number[] }`

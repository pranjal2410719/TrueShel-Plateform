# Original User Request

## 2026-09-27T04:09:43Z

TRUESHEL V2 is a professional climate-to-shelter thermal engineering web application built with Next.js 15, TypeScript, Tailwind CSS v4, and React Three Fiber. The application guides engineers and researchers through a physics-driven workflow: define a climate → design a passive shelter → run transient thermal simulation → compare designs → optimize → receive evidence-based recommendations → assess resilience → visualize results in a physics-linked 3D thermal digital twin.

Working directory: /home/dev/Desktop/projects/trueShel

Integrity mode: development

---

## Design System Constraint

**All styling is driven by the Shop design token system** (provided in `design.md`). Tokens must be implemented in a dedicated `styles/tokens.css` file (CSS custom properties + Tailwind v4 `@theme` block) that is imported once and never duplicated. Every component uses only token-referenced values — no hardcoded hex, no inline pixel values, no ad-hoc Tailwind classes that bypass tokens.

Key Shop design DNA applied to TRUESHEL:
- White canvas `#f2f4f5` background, `#ffffff` surface cards
- Single saturated accent: Shop Violet `#5433eb` (primary actions, key metrics, active nav states)
- 28px card radius, 9999px pill/button/input radius, 20px inner image radius
- GT Standard font family (fallback: Inter, system-ui) — hierarchy through tracking, not weight contrast
- Dual-layer soft shadow on elevated cards: `rgba(0,0,0,0.1) 0 4px 6px -1px, rgba(0,0,0,0.1) 0 2px 4px -2px`
- No gradients, no glassmorphism, no neon — engineering precision through whitespace and typography
- Thermal state colors are semantic overlays on top of the achromatic shell (cold/comfort/hot), not decorative

---

## Requirements

### R1. Next.js Application Shell with Design System

Bootstrap a full Next.js 15 (App Router) + TypeScript project with:

- Tailwind CSS v4 configured with a dedicated `styles/tokens.css` containing the complete Shop design token set (CSS custom properties + `@theme` block). This file is the single styling source of truth — no token values appear elsewhere.
- shadcn/ui component library pre-configured to consume the token system
- A persistent desktop-first application shell: left sidebar navigation rail (64px icon-only, expands to labeled), top header bar (project selector + "Run Simulation" action), main content area
- Navigation routes: Overview / Dashboard, Climate, Shelter, Simulation, Compare, Intelligence, Thermal Twin, Reports, Settings
- Route group `(workspace)` with shared layout for all authenticated sections; `/onboarding` outside the group
- Responsive breakpoints: Desktop (1440+) primary, Laptop (1024–1439), Tablet (768–1023), Mobile (<768 simplified)
- Framer Motion page transitions and micro-interactions

**File architecture must match exactly:**
```
trueshel/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── onboarding/
│   └── (workspace)/
│       ├── layout.tsx
│       ├── dashboard/
│       ├── climate/
│       ├── shelter/ (geometry, envelope, materials, openings, thermal-mass, pcm, summary)
│       ├── simulation/ (setup, results, temperature, heat-flow, solar, comfort, thermal-state)
│       ├── compare/
│       ├── optimization/
│       ├── recommendation/
│       ├── resilience/ (autonomy, climate-risk, degradation, failure-intelligence)
│       ├── thermal-twin/
│       ├── reports/
│       └── settings/
├── components/ (ui/, layout/, charts/, metrics/, forms/, engineering/, feedback/)
├── features/ (climate/, shelter/, simulation/, comparison/, optimization/, resilience/, intelligence/, thermal-twin/)
├── lib/ (api/, calculations/, constants/, validators/, utils/)
├── stores/ (project-store.ts, shelter-store.ts, simulation-store.ts, thermal-twin-store.ts)
├── types/ (climate.ts, shelter.ts, material.ts, simulation.ts, recommendation.ts, resilience.ts)
├── public/ (models/, textures/, environments/, icons/)
└── styles/ (tokens.css, globals.css)
```

### R2. Canonical Project State and Zod Schema Layer

Define and export a canonical TypeScript type system and Zod validation schema layer covering:

**ProjectState** tree:
```
ProjectState { project, climate, shelter { geometry, orientation, envelope, openings, thermalMass, pcm }, simulation { status, configuration, result }, comparison, optimization, recommendation, resilience, thermalTwin }
```

**SimulationResult** shape:
```
SimulationResult { timeline[], indoorTemperature[], outdoorTemperature[], solarIrradiance[], heatGain[], heatLoss[], storage[], comfort[], thermalStates[], autonomy, risk }
```

Implement four Zustand stores: `project-store`, `shelter-store`, `simulation-store`, `thermal-twin-store`. Stores share state via selectors, not by direct import chains. Include a `MockRepository` that seeds realistic Ladakh high-altitude climate + passive shelter data so every page renders populated content without a live backend.

TanStack Query wrappers for all API calls. Zod schemas validate both request payloads and API responses at the boundary.

### R3. Full Dashboard — Engineering Command Center

Build `/dashboard` as a multi-panel information-dense command center:

**Top metrics strip:** Indoor Temperature, Comfort Hours, Heat Loss (kW), Solar Gain (kW), Thermal Autonomy — each as a metric card with value + unit + label + trend indicator, styled with the Shop elevated-card shadow.

**24-hour thermal response chart:** Recharts line chart showing indoor vs outdoor temperature over 24h, comfort band overlay (18–26°C shaded), current-time marker. Chart container is a 28px-radius white card.

**3D Thermal Twin embed:** The R3F scene (from R5) embedded as a dashboard panel — 16:9 aspect, timeline scrubber below, mode toggle (Normal / Thermal / Heat Flow / Solar / Storage).

**Heat loss breakdown:** Horizontal bar chart showing % contribution by component (Roof, Walls, Floor, Windows, Infiltration).

**Design insight cards:** 3 cards surfacing the top actionable insights from the current simulation result (e.g., "Roof dominates heat loss — 41%").

**Current state badge:** Semantic state pill (UNDER-COMFORT / COMFORT / OVERHEATING) using cold/stable/hot semantic color tokens.

### R4. Shelter Designer — Integrated Engineering Workspace

Build `/shelter` as a single-page engineering workspace (not 7 separate disconnected screens):

**Split layout:** Left 40% = live 3D preview (simplified R3F scene, no thermal overlay, geometry only); Right 60% = parameter panels.

**Parameter panels (tabbed or sectioned):**
- Geometry: L/W/H inputs, orientation selector (compass rose or dropdown)
- Envelope: wall/roof/floor assembly selector with "Edit" drawer opening the wall-layer builder
- Openings: window area, window/door count
- Thermal system: thermal mass level, PCM toggle, shading toggle, ventilation mode

**Wall-layer builder (drawer/modal):** Visual stack editor showing layers from EXTERIOR → INTERIOR. Each layer: material name, thickness input, drag handle, remove button. Live R-value and U-value computed below the stack. Material picker opens the material library.

**Material library:** Searchable grid of material cards. Each card shows: name, k (W/m·K), ρ (kg/m³), Cp (J/kg·K), ε, α, thickness. Selecting a material opens the Material Inspector sidebar with full properties + computed thermal resistance + "Apply to Layer" action.

All design changes update the Zustand shelter-store in real time. A "Save Design" button persists to the project. No page navigation required to move between geometry/envelope/materials/thermal system.

### R5. Physics-Linked 3D Thermal Digital Twin — Pure Three.js/R3F

Build the `features/thermal-twin/` subsystem using **React Three Fiber + Three.js only**. There is no AR, no VR, no GLTF/OBJ/GLB file loading, no external 3D asset pipeline. The shelter model is **entirely procedurally generated** from the shelter-store geometry parameters (L, W, H, openings) using Three.js primitives: `BoxGeometry`, `PlaneGeometry`, extruded shapes, and custom `BufferGeometry` for the roof. The model is built in code, not imported.

**Architecture (strictly enforced):**
```
SimulationResult → ThermalTwinState → Visualization Mapping → Three.js/R3F → GPU/WebGL
```
The 3D system NEVER generates thermal numbers. It only reads `SimulationResult` from the simulation-store.

**Procedural shelter geometry (all Three.js primitives):**
- `Wall.tsx` — `BoxGeometry` scaled to shelter L/W/H, one instance per cardinal wall face
- `Roof.tsx` — `BufferGeometry` or extruded `Shape` forming a simple gabled or flat roof based on shelter config
- `Floor.tsx` — `PlaneGeometry` at y=0 with correct L/W dimensions
- `Window.tsx` — recessed `BoxGeometry` cutout approximation or transparent plane mesh positioned on the south wall
- `Door.tsx` — similarly positioned plane mesh

All geometry dimensions are reactive: changing L/W/H in the shelter-store causes immediate geometry re-computation in the scene via `useShelterStore()`.

**Materials:**
- Normal mode: `MeshStandardMaterial` with neutral architectural tones derived from Shop tokens (warm-fog, slate-ink)
- Thermal/overlay modes: `ShaderMaterial` or `MeshBasicMaterial` with vertex-color or uniform-driven temperature-to-color mapping

**Visualization modes (shader/material switching on the same geometry):**
- **Normal:** Standard `MeshStandardMaterial`, soft ambient + directional light
- **Thermal:** Each surface mesh receives a uniform `uTemperature` (from `SimulationResult` at the active timestep). A GLSL fragment shader maps the value to a cold→comfort→hot color ramp: `#3b82f6` (≤12°C) → `#22c55e` (18–26°C) → `#ef4444` (≥35°C)
- **Heat Flow:** Instanced arrow meshes or a `Points` particle system overlaid on wall surfaces, direction determined by the sign of the heat-flow vector at the active timestep
- **Solar:** Irradiance overlay on roof and south-facing wall using a uniform `uSolarIntensity`
- **Storage/PCM:** Thermal storage state overlay (charge %, colour-coded)

**Timeline:** A scrubber component (`TwinTimeline.tsx`) from 00:00 to 24:00. Dragging updates `thermalTwinStore.activeTimestep` (integer index into the `SimulationResult.timeline` array). All shader uniforms and overlay intensities derive solely from `SimulationResult[activeTimestep]`. Play/pause button auto-advances the timestep at 1 simulated hour per real second.

**Camera controls:** OrbitControls (`@react-three/drei`) — rotate, pan, zoom, reset. Raycaster on pointer-up to select a wall component (highlights the mesh + opens an Inspector panel showing: component name, material, thickness, current surface temperature at active timestep).

**Where the 3D twin appears in the app:**
1. **Dashboard embed** — the R3F canvas embedded as a card panel (fixed 16:9 aspect, Thermal mode default, timeline scrubber below, mode toggle buttons)
2. **Simulation results** — embedded in `/simulation/results` alongside the charts, showing the shelter in Thermal mode at the final timestep
3. **Full-screen `/thermal-twin` route** — full viewport canvas with all controls visible

**Standalone `/thermal-twin` page layout:**
```
┌── THERMAL TWIN ─────────────────────── 13:30 ─────────────┐
│                                                            │
│              R3F Canvas (full viewport)                    │
│         Procedural shelter + thermal overlay               │
│                                                            │
├── NORMAL | THERMAL | HEAT FLOW | SOLAR | STORAGE ─────────┤
├── 00:00 ─────────────●──────────────────── 24:00 ──[▶]── ┤
│  Outdoor -3.2°C   Solar 670 W/m²   Indoor 21.4°C  COMFORT │
└────────────────────────────────────────────────────────────┘
```

**Explicitly out of scope:** AR, VR, WebXR, GLTF/OBJ/GLB file import, Blender assets, physics simulation inside Three.js, cannon-es, rapier. None of these should appear in the codebase.

### R6. Simulation Workspace + Results Dashboard

**Setup (`/simulation/setup`):** Configuration form — duration, time step, comfort range, feature toggles (thermal mass, PCM, solar, ventilation). "Run Simulation" CTA.

**Running state (`/simulation/running`):** Step-by-step engine progress display. Each stage shown as a checklist item with a checkmark animation: Climate ✓, Geometry ✓, Materials ✓, Solar model ✓, Heat transfer ✓, Thermal storage ✓, Transient response ✓, Comfort analysis ✓. Mock data must be clearly labelled if the FastAPI backend isn't connected. Do not fake scientific calculations — show "MOCK DATA" if using seed data.

**Results (`/simulation/results`):** Multi-panel dashboard:
- Top 5-metric strip (indoor temp, comfort hours, heat loss, solar gain, autonomy)
- Indoor temperature 24h chart with outdoor overlay and comfort band
- Thermal state timeline bar (UNDER-COMFORT / COMFORT / OVERHEATING segments)
- Heat flow breakdown by component (horizontal bars with %)
- Solar gain chart

**Sub-result pages:** `/simulation/temperature`, `/simulation/heat-flow`, `/simulation/solar`, `/simulation/comfort`, `/simulation/thermal-state` — each a focused deep-dive view of that output domain.

### R7. Comparison, Optimization, Recommendation, and Resilience Modules

**Compare (`/compare`):** Side-by-side Design A vs Design B:
- Editable parameter table (insulation, windows, mass, PCM, shading)
- Stacked metrics comparison (comfort hours, heat loss, overheat, autonomy)
- Overlaid temperature chart (two lines, A and B, labeled)
- Difference analysis: Δ comfort, Δ heat loss, Δ autonomy with directional indicators

**Optimization (`/optimization`):**
- Objective selector (balance comfort/heat loss/energy)
- Variable toggles (insulation thickness, window area, orientation, thermal mass, shading, PCM, geometry)
- Constraint inputs (min/max comfort temp, max window area, max insulation)
- "Optimize Design" action → shows: candidates evaluated, feasible designs, simulation runs, best candidate
- Exposes objective and constraints explicitly — no hidden "AI confidence" score

**Recommendation (`/recommendation`):**
- Recommended configuration card (full parameter set)
- Performance justification section (comfort hours, heat loss, autonomy, overheat)
- Key drivers list (plain-language explanations of why each parameter was chosen)
- No fake AI confidence percentages

**Resilience (`/resilience`):**
- Top-level metrics: Thermal Autonomy (h), Climate Exposure, Freeze-Thaw Risk, Wind Exposure, Solar Exposure, Material Risk
- Autonomy diagram: heating failure → temperature decay → 16°C threshold → hours remaining
- Sub-pages: `/resilience/autonomy`, `/resilience/climate-risk`, `/resilience/degradation`, `/resilience/failure-intelligence`

**Failure Intelligence (`/resilience/failure-intelligence`):**
- Evidence-driven pattern display: issue + climate + observed pattern + consequence + risk level + recommended mitigation + source
- Architecture stub for future RAG pipeline (document → embeddings → vector search → evidence → recommendation → source)
- No LLM chatbot. No invented historical failures. Patterns must be seeded from real engineering principles in the mock data.

### R8. Reports Module

**`/reports`:** Generate and export:
- Thermal Design Report covering: project metadata, climate summary, shelter configuration, materials, thermal resistance values, temperature profile, heat flow breakdown, solar performance, comfort analysis, autonomy assessment, resilience summary, recommendation, validation status
- Export to PDF (client-side, e.g., `@react-pdf/renderer` or `html2canvas` + `jsPDF`)
- Export to JSON (structured `SimulationResult` + `ProjectState` snapshot)

---

## Acceptance Criteria

### Application Shell
- [ ] `npm run build` completes with zero TypeScript errors and zero ESLint errors
- [ ] `npm run dev` starts and all 14 navigation routes render without runtime errors in the browser console
- [ ] `styles/tokens.css` is the only file containing color hex values, border-radius values, shadow definitions, and font-family strings — no duplicates elsewhere
- [ ] Sidebar nav collapses to icon-only at <1024px and a bottom bar at <768px
- [ ] All pages are responsive: no horizontal scroll at 1440px, 1024px, 768px, or 375px viewport widths

### Design System Fidelity
- [ ] Primary action buttons (Run Simulation, Save Design, Optimize, Export) use Shop Violet `#5433eb` fill with white text
- [ ] All metric/data cards use 28px border radius and the dual-layer soft shadow
- [ ] All inputs and pill controls use `border-radius: 9999px`
- [ ] No hardcoded color values in any `.tsx` or `.css` file outside `styles/tokens.css`
- [ ] Font family resolves to GT Standard (or Inter fallback) at all text sizes

### State and Data
- [ ] MockRepository seeds a complete Ladakh passive shelter project that populates every page with realistic data on first load — no empty states
- [ ] Zustand stores update correctly: changing a shelter geometry parameter in `/shelter` is immediately reflected in the dashboard metrics and 3D preview
- [ ] `SimulationResult` Zod schema validates the mock data without errors (run `npx zod-validator` or equivalent)
- [ ] TanStack Query cache is invalidated correctly when a new simulation result arrives

### Dashboard
- [ ] Dashboard renders all 5 metric cards, the 24h temperature chart, the 3D twin embed (even if simplified), the heat loss chart, and the thermal state badge without blank panels
- [ ] Comfort band (18–26°C) is visually rendered on the temperature chart as a shaded region
- [ ] Current thermal state badge color is semantically correct: blue-toned for UNDER-COMFORT, green for COMFORT, red for OVERHEATING

### Shelter Designer
- [ ] Changing L/W/H values updates the 3D preview geometry in real time (<200ms visual update)
- [ ] Wall-layer builder correctly computes and displays R-value and U-value when layers are added/edited/removed
- [ ] Material library is searchable by name and filterable; selecting a material populates the Material Inspector with all 5 thermal properties
- [ ] "Save Design" persists the shelter configuration to the project-store and survives a page refresh (localStorage or sessionStorage)

### 3D Thermal Twin (Three.js / R3F — Procedural Only)
- [ ] The R3F canvas renders a complete procedural shelter (4 walls + roof + floor + window + door) using **only Three.js primitives** — no GLTF, OBJ, or GLB files are loaded anywhere in the codebase
- [ ] Changing L/W/H in the shelter-store causes the 3D geometry to update within one render cycle (no page reload, no manual refresh)
- [ ] Switching mode (Normal → Thermal → Heat Flow → Solar → Storage) visibly changes the surface shader/material on the rendered meshes
- [ ] In **Thermal mode**, each wall surface color correctly reflects the `SimulationResult` temperature at the active timestep (cold blue at low temps, green in comfort range, red at high temps)
- [ ] Scrubbing the timeline from 00:00 to 24:00 smoothly updates all thermal overlays to the correct simulation timestep data
- [ ] Play mode auto-advances through all 24 timesteps without freezing; the timestep clock updates visibly
- [ ] OrbitControls allow rotate, pan, and zoom without console errors; Reset button returns to the default isometric-style camera angle
- [ ] Clicking a wall mesh opens an Inspector showing: component name, assigned material, layer thickness, surface temperature at active timestep
- [ ] The twin renders correctly both embedded in the Dashboard card (≥300px height) and at full-screen in `/thermal-twin`
- [ ] No AR, VR, WebXR, cannon-es, rapier, or GLTF loader appears anywhere in `package.json` or source files

### Simulation Results
- [ ] Results page renders all required panels (5 metrics, temperature chart, thermal state bar, heat flow chart) populated with mock data
- [ ] Thermal state timeline bar correctly segments and colors the 24h period into UNDER-COMFORT / COMFORT / OVERHEATING
- [ ] If mock data is used (no live FastAPI), a visible "MOCK DATA" label appears on the simulation running screen

### Comparison
- [ ] Design A and Design B can be set to different shelter configurations from the project
- [ ] Overlaid temperature chart correctly renders two distinct labeled lines
- [ ] Difference analysis shows Δ values with direction indicators for all 4 metrics

### Reports
- [ ] "Export PDF" produces a downloadable PDF containing at minimum: project name, climate summary, shelter config, 5 thermal metrics, recommendation
- [ ] "Export JSON" produces a valid JSON file matching the `SimulationResult` + `ProjectState` structure

---

*Expecting this to run as a full team build — the scope spans 8+ feature modules, a 3D WebGL subsystem, a custom design token pipeline, and a complete state architecture.*

## 2026-09-27T09:12:15Z

The server restarted and the API quota limits should now be reset. Milestone 2 (Data, Schemas & Physics Core) was completed independently by another agent and passes compilation (`npx tsc --noEmit` exited with 0). 

Please resume orchestration starting with Milestone 3 (Dashboard).

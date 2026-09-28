# TRUESHEL V2 — E2E Testing Infrastructure Specification (`TEST_INFRA.md`)

**Document Version:** 1.0.0  
**Target Application:** TRUESHEL V2 (Next.js 15, TypeScript, Tailwind CSS v4, React Three Fiber)  
**Author:** E2E Test Track Lead (Test Writer E2E-1)  
**Date:** 2026-09-27  
**Scope Reference:** `/home/dev/Desktop/projects/trueShel/PROJECT.md` & `/home/dev/Desktop/projects/trueShel/.agents/teamwork/ORIGINAL_REQUEST.md`

---

## 1. Dual-Track Testing Philosophy & Principles

The TRUESHEL V2 engineering process operates under a **Dual-Track Orchestration Model**:
- **Track 1: Implementation Track (M1–M7):** Progressive feature construction from App Shell & Design System (M1), State & Physics Engine (M2), Shelter Designer (M3), Procedural 3D Thermal Twin (M4), Dashboard & Telemetry (M5), Simulation & Optimization Workspaces (M6), to Final Integration (M7).
- **Track 2: E2E Testing Track (Tiers 1–5):** Independent, parallel test suite authoring and continuous regression verification executed concurrently with implementation milestones.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Dual-Track Orchestration Architecture                │
│                                                                        │
│   Implementation Track (M1-M7)             E2E Testing Track (T1-T5)   │
│   ┌───────────────────────────┐           ┌───────────────────────────┐│
│   │ M1: App Shell & Tokens    │◄─────────►│ Tier 1: Feature Coverage  ││
│   │ M2: Schemas & Physics     │◄─────────►│ Tier 2: Boundary Cases    ││
│   │ M3: Shelter Designer      │◄─────────►│ Tier 3: Cross-Feature     ││
│   │ M4: 3D Procedural Twin    │◄─────────►│ Tier 4: Real-World Scen.  ││
│   │ M5: Dashboard & Telemetry │           │ Tier 5: Adversarial Audit ││
│   │ M6: Simulation Workspace  │           └─────────────┬─────────────┘│
│   │ M7: Final Integration     │◄────────────────────────┘              │
│   └─────────────┬─────────────┘                                        │
│                 ▼                                                      │
│        TEST_READY.md Published ──► Forensic Auditor ──► Sentinel       │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Testing Directives
1. **Opaque-Box & Requirement-Driven:** Every test case is derived strictly from observable interfaces and functional requirements in `ORIGINAL_REQUEST.md` and `PROJECT.md`, never from arbitrary implementation internals.
2. **Authoritative Expected Output Derivation:** Every expected value (thermal resistances, solar angles, barometric air densities, color hexes, route paths) is backed by physical equations (ISO 6946, lumped capacitance), design tokens, or formal schemas.
3. **Progressive Testability:** Tests are modularized into distinct tiers. Tests for current and completed milestones execute and assert immediately, while future milestone tests validate contractual interfaces and provide clean diagnostic feedback.
4. **Self-Contained Isolation:** Every test sets up its own state, isolates mocks, and avoids cross-test state leakage or ordering dependencies.
5. **Zero Facade Policy:** Facade tests that pass vacuously without exercising actual logic or inspecting real files are strictly forbidden. Assertions must verify actual file contents, schema parsing, boundary validations, and runtime behaviors.
6. **No Implementation Tampering:** Test writers produce and modify **test code only**. Implementation bugs are reported via the defect escalation protocol to implementing agents.

---

## 2. Directory Layout & Architecture

Test infrastructure is co-located within the standard project workspace per `PROJECT.md` guidelines (no test code inside `.agents/teamwork/`):

```
trueshel/
├── tests/
│   ├── runner.mjs                         # Unified automated test runner CLI
│   ├── e2e/
│   │   ├── tier1-features/                # Tier 1: Core feature coverage (>=5 tests/feat)
│   │   │   ├── design-tokens.test.mjs     # Feature 1: styles/tokens.css & zero-hardcoding
│   │   │   ├── route-availability.test.mjs# Feature 2: 14 primary routes & sub-routes
│   │   │   ├── app-shell-bounds.test.mjs  # Feature 3: Rail, header, bottom bar, breakpoints
│   │   │   ├── procedural-3d.test.mjs     # Feature 4: Three.js primitives & zero-model ban
│   │   │   └── schema-integrity.test.mjs  # Feature 5: Canonical Zod schemas & boundary parse
│   │   ├── tier2-boundary/                # Tier 2: Boundary conditions & corner stress
│   │   │   ├── thermal-physics-bounds.test.mjs
│   │   │   ├── geometry-limits.test.mjs
│   │   │   └── schema-rejections.test.mjs
│   │   ├── tier3-cross-feature/           # Tier 3: Inter-module state & data flows
│   │   │   ├── shelter-to-twin-sync.test.mjs
│   │   │   └── simulation-to-dashboard-flow.test.mjs
│   │   ├── tier4-real-world/              # Tier 4: Production workflows & Ladakh baseline
│   │   │   ├── ladakh-baseline-e2e.test.mjs
│   │   │   └── export-pipeline.test.mjs
│   │   └── tier5-adversarial/             # Tier 5: Forensic security & compliance audits
│   │       ├── forensic-token-audit.test.mjs
│   │       └── zero-model-audit.test.mjs
│   ├── fixtures/                          # Standardized test payloads & schemas
│   │   ├── ladakh-climate.json
│   │   ├── shelter-presets.json
│   │   └── simulation-sample.json
│   └── helpers/                           # Reusable verification utilities
│       ├── token-auditor.mjs              # Regex-based AST & token scanner
│       ├── route-checker.mjs              # Route AST & export validator
│       └── schema-harness.mjs             # Zod boundary tester
```

---

## 3. Test Runner & Framework Specifications

### 3.1 Technology Selection
- **Runner Core:** Native Node.js 22 Test Runner (`node:test`) paired with Strict Assertions (`node:assert/strict`).
- **Rationale:** 
  1. Guaranteed pre-installed zero-dependency runtime in Node `v22.23.3`.
  2. Ultra-low execution overhead (<200ms for full test suites).
  3. Native support for ES modules (`.mjs`), subtests, TAP/spec reporting, and parallel worker threads.
  4. Built-in code coverage and regex filtering (`--test-name-pattern`).
  5. Completely immune to React 19 / Next.js 15 peer dependency conflicts during early bootstrap phases.

### 3.2 Unified Test CLI (`tests/runner.mjs`)
The test runner provides a single, uniform interface across development, CI, and agent coordination:

```bash
# Run all E2E test tiers
node tests/runner.mjs

# Run specific tier
node tests/runner.mjs --tier=1
node tests/runner.mjs --tier=2

# Run specific feature test
node tests/runner.mjs --test=design-tokens
node tests/runner.mjs --test=procedural-3d

# Run with verbose output or JSON reporting
node tests/runner.mjs --verbose
node tests/runner.mjs --reporter=json
```

### 3.3 CI & Package.json Script Bindings
`package.json` binds the test runner to standard npm scripts:
```json
{
  "scripts": {
    "test": "node tests/runner.mjs",
    "test:e2e": "node tests/runner.mjs",
    "test:tier1": "node tests/runner.mjs --tier=1",
    "test:tier2": "node tests/runner.mjs --tier=2",
    "test:tier3": "node tests/runner.mjs --tier=3",
    "test:tier4": "node tests/runner.mjs --tier=4",
    "test:tier5": "node tests/runner.mjs --tier=5",
    "test:coverage": "node --test --experimental-test-coverage tests/e2e/**/*.test.mjs"
  }
}
```

---

## 4. Multi-Tier Coverage Strategy & Requirements Mapping

### 4.1 Tier 1: Core Feature Coverage (>=5 Tests Per Feature)
Tier 1 establishes unambiguous verification for the five foundational pillars of TRUESHEL V2:

#### Feature 1: Design System & Token Integrity (`styles/tokens.css`)
- **Authoritative Source:** `ORIGINAL_REQUEST.md` lines 13–25, 237, 243–247; `PROJECT.md` lines 5, 102–104, 195–200.
- **Minimum Test Cases (5+):**
  1. `T1.1.1`: Single Source of Truth — `styles/tokens.css` exists, defines the complete Shop DNA token palette in a Tailwind v4 `@theme` block (`--color-canvas: #f2f4f5`, `--color-surface: #ffffff`, `--color-shop-violet: #5433eb`, `--radius-card: 28px`, `--radius-pill: 9999px`, `--radius-inner: 20px`, soft dual-layer shadow).
  2. `T1.1.2`: Zero Hardcoded Hex Audit — Zero raw hex codes (`#[0-9a-fA-F]{3,8}`) in any `.tsx`, `.ts`, or `.css` file outside `styles/tokens.css` (excluding mock data and icon svgs).
  3. `T1.1.3`: Zero Arbitrary Radius Audit — Zero arbitrary Tailwind arbitrary radius classes (`rounded-[...]`) anywhere in `app/`, `components/`, `features/`, or `styles/`.
  4. `T1.1.4`: Zero Gradient & Glassmorphism Violation Audit — Zero forbidden utility classes (`bg-gradient-*`, `backdrop-blur-*`, glowing neon) in component markup.
  5. `T1.1.5`: Semantic Thermal State Colors — `tokens.css` defines non-decorative thermal state tokens: Cold `#3b82f6` ($\le 12^\circ\text{C}$), Comfort `#22c55e` ($18^\circ\text{C}–26^\circ\text{C}$), Hot `#ef4444` ($\ge 35^\circ\text{C}$), Warning `#f59e0b`.
  6. `T1.1.6`: shadcn/ui Variable Binding — `:root` in `tokens.css` correctly maps shadcn CSS variables (`--background`, `--foreground`, `--primary`, `--radius`) to Shop design tokens without duplicating hex values.

#### Feature 2: Route Reachability & Page Topology
- **Authoritative Source:** `ORIGINAL_REQUEST.md` lines 36–39, 42–69; `PROJECT.md` lines 9, 13–56, 110–113.
- **Minimum Test Cases (5+):**
  1. `T1.2.1`: Root & Isolated Onboarding Route — `app/page.tsx` and `app/onboarding/page.tsx` exist outside the `(workspace)` route group.
  2. `T1.2.2`: Workspace Route Group Layout — `app/(workspace)/layout.tsx` exists and implements the shared persistent shell (Navigation Rail + Header Bar).
  3. `T1.2.3`: 14 Primary Navigation Routes Reachability — All 14 primary routes exist with valid page modules:
     - `/dashboard`, `/climate`, `/shelter`, `/simulation`, `/compare`, `/optimization`, `/recommendation`, `/resilience`, `/thermal-twin`, `/reports`, `/settings`, `/onboarding`, `/simulation/setup`, `/simulation/results`.
  4. `T1.2.4`: Shelter Sub-Route Deep Links — All 7 shelter sub-routes exist (`/shelter/geometry`, `/shelter/envelope`, `/shelter/materials`, `/shelter/openings`, `/shelter/thermal-mass`, `/shelter/pcm`, `/shelter/summary`).
  5. `T1.2.5`: Simulation Sub-Result Deep Dives — All 5 simulation sub-result views exist (`/simulation/temperature`, `/simulation/heat-flow`, `/simulation/solar`, `/simulation/comfort`, `/simulation/thermal-state`).
  6. `T1.2.6`: Resilience Deep Dives — All 4 resilience sub-routes exist (`/resilience/autonomy`, `/resilience/climate-risk`, `/resilience/degradation`, `/resilience/failure-intelligence`).

#### Feature 3: App Shell, Navigation & Responsive Bounds
- **Authoritative Source:** `ORIGINAL_REQUEST.md` lines 36–40, 238–240; `PROJECT.md` lines 9, 106–108, 114–115.
- **Minimum Test Cases (5+):**
  1. `T1.3.1`: Desktop Navigation Rail — Rail component exists, renders 64px width in collapsed state, and expands to labeled 240px drawer.
  2. `T1.3.2`: Persistent Top Header Bar — Top header bar renders project selector and primary CTA "Run Simulation" using Shop Violet `#5433eb`.
  3. `T1.3.3`: Mobile Bottom Navigation Bar — Bottom navigation bar component exists and is responsive to mobile viewports (`<768px`) with 5 primary touch destinations.
  4. `T1.3.4`: Viewport Breakpoints Definition — Layout adheres to prescribed responsive bounds: Desktop (1440+), Laptop (1024–1439), Tablet (768–1023), Mobile (<768).
  5. `T1.3.5`: Horizontal Overflow Prevention — Container elements use `overflow-x-hidden` or fluid constraints preventing horizontal scrollbars across all standard widths (1440px, 1024px, 768px, 375px).

#### Feature 4: Procedural 3D Thermal Twin Constraints & Architecture
- **Authoritative Source:** `ORIGINAL_REQUEST.md` lines 123–176, 265–276; `PROJECT.md` lines 8, 140–159, 220–229.
- **Minimum Test Cases (5+):**
  1. `T1.4.1`: Strict Zero External 3D Models in `package.json` — Zero forbidden loaders or formats (`three-stdlib/loaders`, `gltf-loader`, `obj-loader`, `fbx-loader`, `@react-three/gltf`) in dependencies.
  2. `T1.4.2`: Strict Zero 3D Model Files in Repository — Zero `.gltf`, `.glb`, `.obj`, `.fbx`, `.dae`, `.blend`, or `.usdz` asset files anywhere in `public/` or `src/`.
  3. `T1.4.3`: Strict Zero External Physics Engines — Zero `cannon-es`, `@react-three/cannon`, `rapier`, `@react-three/rapier`, or `ammo.js` packages in `package.json` or imports.
  4. `T1.4.4`: Strict Zero Extended Reality (XR) — Zero `@react-three/xr`, `three/addons/webxr`, or WebXR APIs in dependencies or source code.
  5. `T1.4.5`: Pure Procedural Geometric Primitives — Shelter geometry subsystem defines `Wall.tsx` (using `BoxGeometry`), `Roof.tsx` (using `BufferGeometry` or extruded shapes), `Floor.tsx` (`PlaneGeometry`), `Window.tsx`, and `Door.tsx`.
  6. `T1.4.6`: 5 Shader Visualization Modes — Thermal twin store and shader architecture support exactly 5 modes: `normal`, `thermal`, `heat-flow`, `solar`, `storage`.

#### Feature 5: Canonical State & Zod Schema Integrity
- **Authoritative Source:** `ORIGINAL_REQUEST.md` lines 71–88, 248–253; `PROJECT.md` lines 6, 73–85, 119–127, 201–229.
- **Minimum Test Cases (5+):**
  1. `T1.5.1`: ProjectState Schema Validation — Zod schema validates full canonical `ProjectState` tree (`project`, `climate`, `shelter`, `simulation`, `comparison`, `optimization`, `recommendation`, `resilience`, `thermalTwin`).
  2. `T1.5.2`: SimulationResult 24h Vector Shape — Zod schema enforces 25-point/24-hour aligned vectors (`timeline`, `indoorTemperature`, `outdoorTemperature`, `solarIrradiance`, `heatGain`, `heatLoss`, `storage`, `comfort`, `thermalStates`, `autonomy`, `risk`).
  3. `T1.5.3`: ShelterConfig Geometry & Openings Bounds — Zod schema enforces positive dimensions ($L, W, H > 0$), wall thickness $> 0$, and bounds window area $\le 0.9 \times (W \times H)$.
  4. `T1.5.4`: ClimateData High-Altitude Schema — Zod schema validates location, latitude/longitude, altitude (e.g. 3500m AMSL), and barometric pressure ($\approx 65\text{ kPa}$).
  5. `T1.5.5`: Boundary Rejection on Corrupt Payload — Zod schema rejects malformed payloads (missing fields, negative conductivities, out-of-range temperatures) with explicit field-path errors.
  6. `T1.5.6`: 4 Decoupled Zustand Store Definitions — Store contracts exist for `project-store`, `shelter-store`, `simulation-store`, and `thermal-twin-store` with atomic selector interfaces.

---

### 4.2 Tier 2: Boundary & Corner Cases (>=5 Tests Per Feature)
- **Geometry Limits:** Minimum wall thickness (0.05m), maximum length (50m), pitch angle bounds (0° flat to 60° steep), zero opening count.
- **Thermal Physics Bounds:** $k \to 0.001\text{ W/m}\cdot K$, total assembly $R \to R_{si} + R_{se} \approx 0.17\text{ m}^2\cdot K/W$, negative outdoor temperatures ($-35^\circ\text{C}$ extreme Himalayan winter).
- **High Altitude Barometric Correction:** Atmospheric pressure and density formula:
  $$\rho(z) = \rho_0 \cdot \exp\left(-\frac{g \cdot M \cdot z}{R \cdot T}\right)$$
  Verifying $\rho(3500\text{m}) \approx 0.85\text{ kg/m}^3$ vs sea level $1.225\text{ kg/m}^3$ (preventing 40% overestimation of infiltration loss).
- **Thermal Autonomy Singularity Handling:** Initial temperature $T_{in} \le 16^\circ\text{C} \implies t_{\text{autonomy}} = 0.0\text{h}$; outdoor temperature $T_{out} \ge 16^\circ\text{C} \implies \text{autonomy} = \infty$ (capped at $24.0\text{h}$).
- **Timeline Scrubber Clamping:** Timestep indices $i < 0 \implies 0$, $i > 24 \implies 24$.

---

### 4.3 Tier 3: Cross-Feature Interactions & Workflows
- **Geometry $\leftrightarrow$ 3D Twin Reactive Binding:** Changing length/width in `shelter-store` instantly recalculates mesh dimensions and surface areas in 3D scene.
- **Assembly Edit $\leftrightarrow$ Real-Time R/U Value Update:** Adding or modifying an insulation layer in the wall-layer builder immediately triggers ISO 6946 recalculation:
  $$R_{\text{total}} = R_{si} + \sum_{i} \frac{d_i}{k_i} + R_{se}, \quad U = \frac{1}{R_{\text{total}}}$$
- **Simulation $\leftrightarrow$ Thermal Shader Binding:** Advancing `thermalTwinStore.activeTimestep` updates `uTemperature` uniform and surface color mapping on 3D meshes without page reload.
- **Compare Module Delta Calculation:** Validating Design A vs Design B $\Delta \text{Comfort}$, $\Delta \text{Heat Loss}$, $\Delta \text{Autonomy}$ calculations and directional badges.

---

### 4.4 Tier 4: Real-World Scenarios & Full System Acceptance
- **Ladakh High-Altitude Cold Desert Baseline:** Complete 24h simulation of passive solar shelter in Leh ($3,500\text{m}$ AMSL, diurnal ambient $-15^\circ\text{C}$ to $-1.5^\circ\text{C}$, direct solar gain through south glazing).
- **Multi-Stage Engine Progress Stepper:** Complete 8-stage simulation pipeline execution with visible `MOCK DATA` pill when backend is decoupled.
- **Dual Embed Verification:** R3F Canvas successfully mounts both as an embedded dashboard panel (fixed 16:9 aspect) and as a standalone full-screen viewport in `/thermal-twin`.
- **Engineering Report Export:** PDF and JSON exports validate snapshot completeness matching canonical `SimulationResult` and `ProjectState`.

---

### 4.5 Tier 5: Adversarial, Security & Forensic Auditing
- **Forensic Token Scanner:** Full static analysis across all `.tsx`, `.ts`, `.jsx`, `.js`, and `.css` files detecting any unapproved color hex, arbitrary radius, gradient, or neon class.
- **Forbidden Model Audit:** Recursive directory scan and AST inspection ensuring zero 3D model formats or loader libraries exist.
- **SSR Hydration Safety Audit:** Three.js / Canvas components employ dynamic client-only mounting (`ssr: false` or `typeof window !== 'undefined'`) to prevent Node.js SSR build crashes.
- **Layout Compliance Verification:** Enforce layout rules: `.agents/teamwork/` contains only metadata, no source/test leaks.

---

## 5. Authoritative Derivation & Formula Index

| Domain | Formula / Standard | Authoritative Reference | Expected Output Bounds |
|---|---|---|---|
| **Multi-Layer Thermal Resistance** | $R_{\text{total}} = R_{si} + \sum \frac{d_i}{k_i} + R_{se}$ | ISO 6946:2017 | $R_{si}=0.13, R_{se}=0.04\text{ m}^2\cdot K/W$, $R_{\text{total}} \ge 0.17$ |
| **Overall Heat Transfer Coefficient** | $U = \frac{1}{R_{\text{total}}}$ | ISO 6946:2017 | $0.05 \le U \le 5.88\text{ W/m}^2\cdot K$ |
| **Barometric Air Density at Altitude** | $\rho(z) = \frac{P_0 \cdot M}{R \cdot T_0} \left(1 - \frac{L \cdot z}{T_0}\right)^{\frac{g \cdot M}{R \cdot L}}$ | US Standard Atmosphere | $\rho(3500\text{m}) \approx 0.852\text{ kg/m}^3$ |
| **Thermal Autonomy Decay to 16°C** | $t_{\text{aut}} = \frac{C_{\text{eff}}}{\Sigma UA} \ln\left(\frac{T_{\text{in},0} - T_{\text{out}}}{16.0 - T_{\text{out}}}\right)$ | First-Law Transient Energy Balance | $t_{\text{aut}} \ge 0$, clamped to $24.0\text{h}$ |
| **Thermal Shader Color Mapping** | Cold ($\le 12^\circ\text{C}$): `#3b82f6`<br>Comfort ($18–26^\circ\text{C}$): `#22c55e`<br>Hot ($\ge 35^\circ\text{C}$): `#ef4444` | `ORIGINAL_REQUEST.md` line 148 | Linear RGB interpolation across thresholds |
| **Design System Radii** | Card: `28px`, Pill: `9999px`, Inner: `20px` | `ORIGINAL_REQUEST.md` line 20 | `--radius-card`, `--radius-pill`, `--radius-inner` |

---

## 6. Test Execution & Reporting Protocol

### 6.1 Running Tests
```bash
# Execute entire test suite
node tests/runner.mjs

# Execute Tier 1 tests
node tests/runner.mjs --tier=1

# Execute with TAP output for CI pipelines
node tests/runner.mjs --reporter=tap
```

### 6.2 Test Result Publishing Protocol (`TEST_READY.md`)
When all test suites across Tiers 1–4 are authored and passing, the E2E Test Track Lead generates `/home/dev/Desktop/projects/trueShel/TEST_READY.md`:
1. Summary of total test cases executed and passed (100% required).
2. Per-feature and per-tier breakdown matrix.
3. Verification results for all acceptance criteria.
4. Cryptographic / git checksum hash of tested files.
5. Official sign-off for Forensic Auditor and Sentinel review.

---

## 7. Implementation Defect Escalation Protocol

If an E2E test discovers a discrepancy between implementation code and authoritative requirements:
1. **Do NOT modify implementation code directly.** As Test Writer / QA, modify test code only.
2. Log the exact failure details in `progress.md`:
   - Offending file path and line number.
   - Requirement reference from `ORIGINAL_REQUEST.md` or `PROJECT.md`.
   - Observed value vs Expected value.
3. Classify severity:
   - **BLOCKER:** Token leak, forbidden 3D model, missing route, build crash.
   - **MAJOR:** Incorrect physical formula calculation, schema rejection on valid data.
   - **MINOR:** Formatting variance, secondary label discrepancy.
4. Notify the Orchestrator via `send_message` with defect citation.

---
*End of Specification — Approved by E2E Test Track Lead for TRUESHEL V2.*

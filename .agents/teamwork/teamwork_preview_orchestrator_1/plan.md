# Orchestration Plan: TRUESHEL V2

## Overview
TRUESHEL V2 is a professional climate-to-shelter thermal engineering web application built with Next.js 15, TypeScript, Tailwind CSS v4, and React Three Fiber.

## Phased Execution Strategy

### Phase 0: Survey & Requirements Mapping (Parallel Explorers)
- **Explorer 1 (App Shell, Design Tokens & Routing)**: Detailed analysis of R1, design tokens (`styles/tokens.css`, Shop design DNA), layout rails, header, 14 routes, responsiveness, shadcn/ui.
- **Explorer 2 (State, Schemas, Engineering Engine & Mock Repository)**: Detailed analysis of R2, R4, R6, R7, R8, `ProjectState` tree, Zod validation, Zustand stores, Ladakh mock repository, R-value/U-value calculation engine, report generators.
- **Explorer 3 (Procedural 3D Thermal Digital Twin & Visualization)**: Detailed analysis of R5, Three.js primitives procedural generation, R3F shaders (thermal, heat-flow, solar, storage), timeline scrubber, interaction controls, zero external 3D models constraint.

### Phase 1: Global Specification Synthesis
- Merge findings into `PROJECT.md` (Feature Inventory, Architecture, Interface Contracts, Code Layout, Milestone Decomposition).
- Prepare E2E Test Infrastructure Plan (`TEST_INFRA.md`).

### Phase 2: Parallel Dual-Track Launch
- **Track 1: E2E Testing Track**
  - Harness and runner configuration
  - Tier 1: Feature coverage (>=5 tests per feature)
  - Tier 2: Boundary & Corner cases (>=5 tests per feature)
  - Tier 3: Cross-feature combinations (pairwise)
  - Tier 4: Real-world application scenarios
  - Publishes `TEST_READY.md`
- **Track 2: Implementation Track**
  - M1: Next.js 15 Bootstrap, Tailwind v4 Design Tokens (`styles/tokens.css`), App Shell & Navigation Layout
  - M2: Domain Types, Zod Schemas, 4 Zustand Stores, Mock Repository (Ladakh dataset) & Calculations
  - M3: Engineering Command Center Dashboard & Charts
  - M4: Shelter Designer & Wall-Layer Builder with Real-time R/U Computation
  - M5: Procedural 3D Thermal Digital Twin (R3F, pure Three.js primitives, shaders & timeline)
  - M6: Simulation Workspace, Sub-result Deep Dives & Optimization / Recommendation / Resilience / Reports
  - M7: Final Integration, E2E Test Passing (Tiers 1-4) & Adversarial Hardening (Tier 5)

### Phase 3: Forensic Auditing & Final Verification
- Comprehensive review by Reviewers & Forensic Auditor.
- Verification of zero external models, zero hardcoding, zero token violations.
- Final handoff to Sentinel.

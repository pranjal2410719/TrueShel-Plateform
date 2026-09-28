# Execution Plan — TRUESHEL V2 Completion

## Overview
Resuming orchestration from Milestone 1 & 2 completion, driving Milestones 3 through 7 across all engineering requirements in `ORIGINAL_REQUEST.md`.

## Milestone Architecture
- **Milestone 3: Dashboard & Telemetry (`/dashboard`)**
  - Top 5 metric cards with Shop elevated shadow (Indoor Temp, Comfort Hours, Heat Loss kW, Solar Gain kW, Thermal Autonomy)
  - 24h Recharts thermal response chart with shaded comfort band (18–26°C), outdoor overlay, and time marker
  - 3D Thermal Twin embed panel (16:9 aspect, timeline scrubber, mode toggles)
  - Heat loss breakdown horizontal bar chart (% by component: Roof, Walls, Floor, Windows, Infiltration)
  - 3 actionable design insight cards
  - Semantic thermal state pill (UNDER-COMFORT / COMFORT / OVERHEATING)
  
- **Milestone 4: Procedural 3D Thermal Twin (`features/thermal-twin/` & `/thermal-twin`)**
  - Pure Three.js / React Three Fiber primitives ONLY (BoxGeometry, PlaneGeometry, BufferGeometry)
  - ZERO external 3D loaders (no GLTF/OBJ/GLB/Blender) and ZERO external physics engines (no rapier/cannon)
  - 5 shader/overlay modes: Normal, Thermal (cold/comfort/hot ramp), Heat Flow (flux vectors/particles), Solar, Storage/PCM
  - 24h timeline scrubber (`TwinTimeline.tsx`) synchronized with `SimulationResult` timesteps
  - Play/pause auto-advance engine (1 hour/second)
  - OrbitControls with reset camera action
  - Raycasting component selection and inspector card
  - Standalone `/thermal-twin` page + embed component for `/dashboard` and `/simulation/results`

- **Milestone 5: Shelter Designer Workspace (`/shelter`)**
  - 40/60 split: 40% live 3D preview, 60% parameter panels
  - Tabbed/sectioned parameter panels: Geometry (L/W/H, orientation), Envelope, Openings, Thermal mass & PCM
  - Visual wall-layer builder drawer: EXTERIOR -> INTERIOR stack with live ISO 6946 R-value and U-value computation
  - 14-material searchable library with Material Inspector sidebar
  - Real-time reactive updates to `shelter-store` and "Save Design" persistence

- **Milestone 6: Simulation Workspace & Advanced Engineering Modules**
  - `/simulation/setup`: configuration form with feature toggles
  - `/simulation/running`: 8-stage engine progress checklist with "MOCK DATA" banner
  - `/simulation/results` and 5 sub-result deep dives (temperature, heat-flow, solar, comfort, thermal-state)
  - `/compare`: side-by-side design comparison with delta metrics and dual-curve chart
  - `/optimization`: multi-objective controls, constraints, and candidate evaluation
  - `/recommendation`: parameter recommendations, justifications, key physics drivers (no fake AI percentages)
  - `/resilience`: autonomy decay curve to 16°C, exposure metrics, climate risk matrix
  - `/resilience/failure-intelligence`: cold-climate case catalog + RAG architecture stub
  - `/reports`: client-side PDF export + schema-validated JSON export

- **Milestone 7: Verification, Hardening & Forensic Integrity Audit**
  - Run full test suite (`npm test`)
  - Run build (`npm run build`) with zero TypeScript and ESLint errors
  - Validate token compliance (Shop design tokens in `styles/tokens.css`)
  - Independent Challenger and Forensic Auditor reviews
  - Victory reporting to Sentinel

## Execution Pattern
For each milestone:
1. Dispatch Explorer(s) to verify prerequisites, contracts, and design boundaries
2. Dispatch Worker with mandatory integrity warning to implement features
3. Dispatch Reviewers and Challengers to verify completeness and correctness
4. Dispatch Forensic Auditor for integrity verification
5. Record gate status and advance to next milestone

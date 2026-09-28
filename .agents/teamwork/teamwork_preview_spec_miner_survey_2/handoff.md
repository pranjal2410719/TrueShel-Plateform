# Handoff Report — Spec Miner 2: State, Domain Models, Zod Schemas & Mock Data

## 1. Observation
- Inspected `/home/dev/Desktop/projects/trueShel/.agents/teamwork/ORIGINAL_REQUEST.md`:
  - Lines 71–88: Requirement R2 specifies canonical `ProjectState` tree (`project`, `climate`, `shelter { geometry, orientation, envelope, openings, thermalMass, pcm }`, `simulation { status, configuration, result }`, `comparison`, `optimization`, `recommendation`, `resilience`, `thermalTwin`), `SimulationResult` shape (`timeline[]`, `indoorTemperature[]`, `outdoorTemperature[]`, `solarIrradiance[]`, `heatGain[]`, `heatLoss[]`, `storage[]`, `comfort[]`, `thermalStates[]`, `autonomy`, `risk`), four Zustand stores (`project-store`, `shelter-store`, `simulation-store`, `thermal-twin-store`), `MockRepository` seeding realistic Ladakh climate, and TanStack Query with Zod schemas.
  - Lines 105–122: Requirement R4 specifies Shelter Designer split workspace (3D preview + parameter panels), wall-layer builder with dynamic $R$-value and $U$-value calculation, and searchable Material Library with properties ($k, \rho, C_p, \epsilon, \alpha, \text{thickness}$).
  - Lines 177–191: Requirement R6 specifies Simulation Workspace with setup parameters, 8-stage running checklist (`Climate`, `Geometry`, `Materials`, `Solar model`, `Heat transfer`, `Thermal storage`, `Transient response`, `Comfort analysis`), Main Results dashboard, and 5 sub-result deep-dive pages (`/simulation/temperature`, `/simulation/heat-flow`, `/simulation/solar`, `/simulation/comfort`, `/simulation/thermal-state`).
  - Lines 192–222: Requirement R7 specifies Compare (`/compare`) with side-by-side editable table and dual Recharts curves, Optimization (`/optimization`) with explicit objectives and constraints, Recommendation (`/recommendation`) with physics justifications and no fake AI confidence scores, Resilience (`/resilience`) with autonomy decay to $16^\circ\text{C}$, and Failure Intelligence (`/resilience/failure-intelligence`) with evidence-driven patterns seeded from real engineering principles.
  - Lines 223–230: Requirement R8 specifies Reports module with client-side PDF export and structured JSON export of `SimulationResult` + `ProjectState`.
  - Lines 248–253: Acceptance criteria requires `MockRepository` to seed complete Ladakh passive shelter project populating every page with realistic data on first load without empty states, Zustand stores updating in real time, and Zod schemas validating mock data without errors.
- Inspected `/home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_orchestrator_1/plan.md`:
  - Explorer 2 assigned to state, schemas, engineering engine, and mock repository.

## 2. Logic Chain
1. From R2 and Acceptance Criteria, a unified canonical data model is needed so that all 14 routes can display populated data immediately on initial mount without waiting for backend computation or encountering undefined state errors.
2. From ISO 6946 building envelope standards, wall layers form a series thermal circuit where $R_{\text{total}} = R_{si} + \sum \frac{d_i}{k_i} + R_{se}$ and $U = \frac{1}{R_{\text{total}}}$. Implementing this in `lib/calculations/` and bonding it to `shelter-store` enables sub-200ms real-time recalculation as users modify layer thicknesses or materials.
3. From high-altitude building physics (Leh, Ladakh at $3,500\text{ m}$ elevation), air density drops to $\approx 0.852\text{ kg/m}^3$ ($\approx 30\%$ lower than sea level). Infiltration heat loss formulas must account for barometric pressure to avoid overestimating ventilation losses.
4. From First Law transient energy conservation, thermal autonomy decay following heating failure follows lumped capacitance exponential decay $T(t) = T_{\text{out}} + (T_0 - T_{\text{out}}) e^{-t/\tau}$. The time to reach $16.0^\circ\text{C}$ provides an objective, physics-grounded metric without arbitrary scores.
5. In order to decouple stores and avoid re-render storms across the 14 routes, the 4 Zustand stores must expose fine-grained atomic selectors and shallow comparisons (`useShallow`), avoiding circular store-to-store imports.

## 3. Caveats
- The 24-hour simulation timeline uses hourly timesteps (25 discrete points from 00:00 to 24:00). If higher temporal resolution (e.g., 15-minute intervals, 96 points) is required in future releases, array lengths in Zod schemas should be updated to a flexible length or parametrized.
- Solar irradiance equations in the client-side mock/calculation engine assume clear-sky winter conditions for high-altitude Leh. Micro-climate variations or localized mountain horizon shading are approximated via the overhang and orientation factors.

## 4. Conclusion
The domain models, Zod validation layer, 4 Zustand store specifications, ISO 6946 physics formulas, and Ladakh mock dataset have been completely mined and documented in `survey_report.md`. This satisfies all requirements for Phase 0 Explorer 2 and provides the exact blueprints for Milestone 2 and Milestone 6 implementation.

## 5. Verification Method
1. Inspect `/home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_spec_miner_survey_2/survey_report.md` to verify:
   - Full "Features Discovered" table (29 features)
   - Full "Edge Cases" table (15 edge cases)
   - Canonical `ProjectState` and `SimulationResult` TypeScript interfaces
   - Complete Zod schemas matching all state models
   - 4 Zustand store action contracts and selector patterns
   - Exact mathematical equations for R/U values, solar irradiance, infiltration at 3500m, and autonomy decay to 16°C
   - Complete 25-point 24h timeline data table for Ladakh winter design day
   - Detailed specifications for R4, R6, R7, and R8
2. Invalidation conditions: Any discrepancy between `survey_report.md` domain models and `ORIGINAL_REQUEST.md` R2/R4/R6/R7/R8, or unhandled physical edge cases in the calculation formulas.

## 2026-09-27T04:12:25Z
You are Spec Miner 2: State Architecture, Domain Models, Zod Schemas & Mock Data for TRUESHEL V2.
Your working directory is: /home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_spec_miner_survey_2/
Project root: /home/dev/Desktop/projects/trueShel

TASK:
1. Thoroughly read and analyze /home/dev/Desktop/projects/trueShel/.agents/teamwork/ORIGINAL_REQUEST.md.
2. Focus on:
   - R2 (ProjectState canonical type tree, SimulationResult shape, Zod validation layer for all schemas and API boundaries, TanStack Query integration).
   - 4 Zustand stores: project-store, shelter-store, simulation-store, thermal-twin-store. Store architecture and selector patterns.
   - MockRepository specification: realistic Ladakh high-altitude climate (extreme diurnal swings, low ambient temp, high solar irradiance) + passive solar shelter configuration and 24h simulation timeline data so all 14 routes are pre-populated on load.
   - Thermal engineering calculation formulas: R-value (sum of d_i / k_i), U-value (1 / sum(R_i)), solar irradiance, heat loss / heat gain balance, thermal autonomy decay to 16°C.
   - Domain specifications for R4 (Shelter parameters & materials library), R6 (Simulation setup & sub-result pages), R7 (Compare, Optimization, Recommendation, Resilience & Failure Intelligence), and R8 (Reports generation: PDF & JSON).
3. Write a comprehensive, detailed survey report to your working directory:
   /home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_spec_miner_survey_2/survey_report.md
4. Include a handoff report at /home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_spec_miner_survey_2/handoff.md following standard handoff protocol.
5. Notify the orchestrator via send_message when done.

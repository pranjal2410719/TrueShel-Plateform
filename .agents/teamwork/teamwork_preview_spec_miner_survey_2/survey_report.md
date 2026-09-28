# TRUESHEL V2 — State Architecture, Domain Models, Zod Schemas & Mock Data Survey Report

**Author**: Spec Miner 2 (Domain Model & State Architecture Specialist)  
**Date**: 2026-09-27  
**Working Directory**: `/home/dev/Desktop/projects/trueShel/.agents/teamwork/teamwork_preview_spec_miner_survey_2/`  
**Reference Document**: `/home/dev/Desktop/projects/trueShel/.agents/teamwork/ORIGINAL_REQUEST.md` (Requirements R2, R4, R6, R7, R8)  

---

## Executive Summary

This report establishes the complete formal domain specification for **TRUESHEL V2**, a professional climate-to-shelter thermal engineering platform. It specifies:
1. **Canonical Type Hierarchy**: Types for `ProjectState`, `SimulationResult`, `ShelterConfig`, `ClimateData`, `OptimizationConfig`, `ResilienceMetrics`, and `FailureIntelligence`.
2. **Zod Validation Layer**: Runtime boundary schemas ensuring 100% type safety and fail-closed validation on all API endpoints and store mutations.
3. **Zustand State Architecture**: Specifications for `project-store`, `shelter-store`, `simulation-store`, and `thermal-twin-store`, with zero circular dependencies, atomic selector patterns, and reactive persistence.
4. **Thermal Engineering Physics Engine**: Formal mathematical formulations for ISO 6946 conductive multi-layer assemblies ($R$ and $U$ values), solar irradiance on oriented glazing ($SHGC$, incident angles), high-altitude infiltration (corrected for $\approx 65\text{ kPa}$ air density), and First-Law lumped capacitance thermal autonomy decay to the critical $16^\circ\text{C}$ threshold.
5. **Authoritative Mock Repository (Ladakh Cold Desert)**: A 24-hour winter simulation dataset representing Leh, Ladakh ($3,500\text{ m}$ AMSL, extreme diurnal swing $-15^\circ\text{C}$ to $-1.5^\circ\text{C}$, peak irradiance $820\text{ W/m}^2$) paired with a passive solar shelter architecture. This pre-populates all 14 routes on initial boot.
6. **Domain Specifications for R4, R6, R7, R8**: Detailed specs for Shelter Designer, Simulation Workspace with 5 sub-result deep-dives, Comparison & Multi-variable Optimization, Evidence-based Resilience & Failure Intelligence, and Client-side Report Generation (PDF/JSON).

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R2: State | Canonical ProjectState Tree | Centralized project model encompassing project metadata, climate, shelter, simulation, comparison, optimization, recommendation, resilience, and thermal twin state | Validated JSON / Partial updates | Immutable `ProjectState` tree | Zod validation error on missing/invalid properties | R2 Specification |
| 2 | R2: State | Canonical SimulationResult Shape | Comprehensive 24h transient simulation result holding aligned time series (temp, solar, heat flux, storage, comfort, thermal states) | Timestep array + physical results | `SimulationResult` object with 24h/25-point vectors | Zod schema parse failure on dimension mismatch | R2 Specification |
| 3 | R2: State | Zod Schema Validation Layer | Schema validation for all entities, requests, responses, and store inputs at runtime boundaries | Unknown payload / API response | Strongly-typed parsed TypeScript entities | Throws `ZodError` with detailed field paths | R2 Specification |
| 4 | R2: State | TanStack Query API Boundary | React Query query hooks and mutations with declarative caching, key factories, and invalidation | Query keys + fetcher functions | Cached query state, loading, error, data | Network/parsing error state with retry policies | R2 Specification |
| 5 | R2: State | Zustand Store: `project-store` | Manages active project identity, metadata, save/load status, and cross-module synchronization | Project updates, export triggers | Current project state, dirty flag, timestamps | Rejects updates failing validation | R2 Specification |
| 6 | R2: State | Zustand Store: `shelter-store` | Manages 3D geometry (L/W/H), orientation, envelope layers, openings, thermal mass, and PCM | Geometry inputs, layer modifications | Real-time computed R/U values, assembly state | Prevents zero or negative dimensions | R2 & R4 Specification |
| 7 | R2: State | Zustand Store: `simulation-store` | Manages simulation setup configuration, multi-stage execution progress, and cached `SimulationResult` | Setup config, run trigger | Simulation status (`idle`, `running`, `completed`, `error`), result | State reset to error on failed run | R2 & R6 Specification |
| 8 | R2: State | Zustand Store: `thermal-twin-store` | Manages active 3D visualization mode, active timestep index (0..24), playback animation state, and selected mesh component | Mode toggle, timeline scrub, play/pause, raycast click | Uniform values (`uTemperature`, `uSolarIntensity`), active inspector data | Clamps timestep to [0, 24]; deselects on background click | R2 & R5 Specification |
| 9 | R2: State | Store Selector Patterns | Decoupled cross-store access using atomic selectors and `useShallow` to eliminate direct import cycles and re-render cascades | Store state slice selector | Memoized/primitive reactive slice | Throws if store is uninitialized | R2 Specification |
| 10 | R2: Mock | Ladakh High-Altitude Climate Seed | Real-world winter climate baseline for Leh ($3,500\text{ m}$ AMSL, extreme diurnal swing, $-15^\circ\text{C}$ to $-1.5^\circ\text{C}$, low pressure, high GHI) | Static seed dataset | Hourly temperature, DNI, DHI, wind, humidity | Falls back to default cold desert profile | R2 Specification |
| 11 | R2: Mock | Passive Solar Shelter Preset | Optimized high-altitude passive solar configuration: super-insulated walls, direct-gain south triple glazing, interior trombe mass, bio-PCM | Static preset | Parametric shelter definition | None (static verified preset) | R2 Specification |
| 12 | R2: Mock | 24h Aligned Simulation Timeline | Pre-computed hourly physics timeline populating all 14 routes with consistent indoor temp, heat loss, solar gain, storage charge, and comfort | Timestep index 0..24 | Synchronized physical scalars and semantic states | Clamped array lookups | R2 Specification |
| 13 | R4: Shelter | Real-Time Multi-Layer R-Value Calculator | Calculates thermal resistance $R_i = d_i / k_i$ and total $R_{\text{total}} = R_{si} + \sum R_i + R_{se}$ per ISO 6946 | Array of `WallLayer` (thickness $d$, conductivity $k$) | Total $R$ ($m^2\cdot K/W$), $U$ ($W/m^2\cdot K$) | Clamps $k > 0$, $d \ge 0$; warns on zero insulation | R4 Specification |
| 14 | R4: Shelter | Material Library Catalog | Searchable, filterable catalog of 14+ architectural and insulation materials with full thermophysical properties ($k, \rho, C_p, \epsilon, \alpha$) | Search query, category filter | Filtered material card array, selected material details | Empty array on unmatched query | R4 Specification |
| 15 | R4: Shelter | Visual Wall-Layer Stack Editor | Interactive drawer editor showing layers from EXTERIOR to INTERIOR with add, remove, reorder, and thickness adjustment | Layer operations, thickness inputs | Updated assembly array, reactive 3D preview | Disallows empty assembly (minimum 1 structural layer) | R4 Specification |
| 16 | R4: Shelter | Thermal Mass & PCM Configuration | Parametric controls for thermal mass level and latent heat storage (melting temp $T_m$, latent heat $L_f$, mass) | Mass level (`low`..`very-high`), PCM toggle, mass/thickness | Thermal capacitance $C_{eff}$ ($kJ/K$), enthalpy curve | Validates $T_m$ within sensible building range (15–28°C) | R4 Specification |
| 17 | R6: Sim | Multi-Stage Simulation Engine Pipeline | 8-stage transient execution simulator with visual checklist: Climate, Geometry, Materials, Solar, Heat Transfer, Storage, Transient, Comfort | `SimulationConfig`, `ShelterConfig`, `ClimateData` | Stage progress (0..100%), stage status, final `SimulationResult` | Sets status `error` with stage-specific failure message | R6 Specification |
| 18 | R6: Sim | Sub-Result Deep Dive: Temperature | Focused analysis of indoor vs outdoor temperature, diurnal dampening factor, thermal lag/phase shift, and comfort bounds | `SimulationResult.timeline`, `indoorTemperature`, `outdoorTemperature` | Min/max/mean temps, damping ratio, phase shift (hours) | Visual warnings if indoor temp drops below 10°C | R6 Specification |
| 19 | R6: Sim | Sub-Result Deep Dive: Heat Flow | Breakdown of transmission losses by component (Roof, South Wall, North Wall, East/West Walls, Floor, Glazing, Infiltration) | Component areas, U-values, hourly indoor/outdoor $\Delta T$ | Hourly kW heat flux vectors, total daily kWh by surface | Ensures component sum matches total heat loss | R6 Specification |
| 20 | R6: Sim | Sub-Result Deep Dive: Solar Performance | Analysis of direct vs diffuse solar radiation, glazing optical transmission, effective solar heat gain ($Q_{solar}$), and solar saving fraction | Glazing area, orientation, SHGC, hourly GHI/DNI | Absorbed solar kW, Solar Saving Fraction ($SSF$) | Zero gain when sun below horizon ($\theta_z \ge 90^\circ$) | R6 Specification |
| 21 | R6: Sim | Sub-Result Deep Dive: Thermal Comfort | Evaluates comfort metrics based on ASHRAE 55 comfort band (18–26°C), PMV/PPD estimates, and diurnal comfort hours | Indoor temperature, mean radiant temperature, air velocity | Comfort hours (0..24h), Under-comfort hours, Overheat hours, PMV index | Flags extreme discomfort (PMV $< -2.0$ or $> +2.0$) | R6 Specification |
| 22 | R6: Sim | Sub-Result Deep Dive: Thermal State Timeline | Categorizes each hour into discrete semantic states: `UNDER-COMFORT` (<18°C), `COMFORT` (18–26°C), `OVERHEATING` (>26°C) | Hourly indoor temperature array | Array of `ThermalState` enums with time intervals | Contiguous interval merging | R6 Specification |
| 23 | R7: Compare | Side-by-Side Design Comparison | Comparative delta analysis between Design A (Baseline) and Design B (Optimized) with stacked metrics and overlaid temperature curves | Design A state, Design B state, simulation results | $\Delta$ Comfort hours, $\Delta$ Heat loss, $\Delta$ Autonomy, overlaid Recharts | Handles identical designs gracefully ($\Delta = 0$) | R7 Specification |
| 24 | R7: Opt | Parametric Shelter Optimization | Multi-variable optimization balancing comfort, heat loss, and cost against explicit geometric and physical constraints | Objective (`max-comfort`, `min-heat-loss`, `balanced`), variable ranges, constraints | Evaluated candidate count, Pareto-optimal design, candidate table | Returns best feasible design; flags if constraints violated | R7 Specification |
| 25 | R7: Rec | Evidence-Based Recommendation | Automatically synthesizes optimal parameter recommendations with plain-language physical justifications (no fake AI confidence) | Current simulation result, optimization candidate | Recommended parameter set, performance deltas, physical rationale | Renders baseline fallback if simulation not yet run | R7 Specification |
| 26 | R7: Resil | Thermal Autonomy & Decay Model | Lumped capacitance exponential decay simulation predicting indoor temperature drop to 16°C following heating failure | Building thermal capacity $C$, envelope UA, infiltration rate, $T_{out}$ | Autonomy hours remaining ($t_{autonomy}$), decay temperature curve | If $T_{in} \le 16^\circ\text{C}$ at $t=0$, autonomy is 0.0h | R7 Specification |
| 27 | R7: Resil | Failure Intelligence Case Study Base | Structured repository of high-altitude cold-climate failure modes (Trombe siphoning, frost heaving, condensation, PCM saturation) | Climate type, shelter assembly parameters | Matching risk patterns, consequences, severity, mitigation, authoritative source | Empty matches if no climate-assembly risk triggers | R7 Specification |
| 28 | R8: Report | Structured JSON Export | Exports complete, schema-validated snapshot of `ProjectState`, `SimulationResult`, calculation audit trail, and timestamp | Current store states | Downloadable `.json` file blob | Rejects invalid JSON schemas prior to export | R8 Specification |
| 29 | R8: Report | Engineering PDF Report Generator | Compiles executive summary, climate profile, envelope schedule, R/U value tables, 24h charts, and resilience audit into a printable PDF | Current project, shelter, simulation, resilience states | Downloadable PDF document blob | Visual error banner if PDF rendering fails | R8 Specification |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | R-Value Calculator | Wall assembly with layer thickness $d = 0\text{ m}$ | Layer provides $R_i = 0\text{ m}^2\cdot K/W$; total $R$ remains valid ($R_{si} + \sum R_{other} + R_{se}$). |
| 2 | R-Value Calculator | Layer with thermal conductivity $k \le 0\text{ W/m}\cdot K$ | Zod validation rejects $k \le 0$ ($k$ must be positive). Calculator falls back to minimum $k = 0.001$ to prevent division by zero. |
| 3 | U-Value Calculator | Total assembly resistance $R_{\text{total}} \to 0$ (e.g. uninsulated single metal sheet) | Standard surface air film resistances $R_{si} = 0.13$ and $R_{se} = 0.04$ provide physical lower bound $R_{\text{total}} \ge 0.17$, bounding $U \le 5.88\text{ W/m}^2\cdot K$. |
| 4 | Glazing Area Calculator | Window area input exceeding South wall gross area ($A_{window} > W \times H$) | Zod validator flags error: window area cannot exceed 90% of wall surface area (leaving framing margin). Input is clamped. |
| 5 | Orientation Angle | Azimuth angle outside $[-180^\circ, +180^\circ]$ or $[0^\circ, 360^\circ]$ | Orientation is normalized via modular arithmetic $\theta_{\text{norm}} = ((\theta + 180) \pmod{360}) - 180$ to stay within $[-180^\circ, 180^\circ]$. |
| 6 | Thermal Autonomy | Initial indoor temperature already at or below critical threshold ($T_0 \le 16.0^\circ\text{C}$) | $t_{\text{autonomy}}$ evaluates immediately to $0.0\text{ hours}$. State badge flags critical `UNDER-COMFORT`. |
| 7 | Thermal Autonomy | Outdoor temperature higher than critical threshold ($T_{out} \ge 16.0^\circ\text{C}$) | Formula logarithm denominator/numerator flips sign. Mathematical model detects infinite autonomy ($\infty$), capped at simulation duration ($24.0\text{h}$) with label "No freeze risk". |
| 8 | Solar Irradiance | Nighttime timesteps where solar altitude angle $\alpha \le 0^\circ$ (sun below horizon) | Direct beam and diffuse solar irradiance are clamped to exactly $0.0\text{ W/m}^2$. Solar heat gain is $0.0\text{ kW}$. |
| 9 | High Altitude Air Density | Calculating infiltration at $3,500\text{ m}$ elevation without barometric correction | If standard sea-level density ($\rho_0 = 1.225\text{ kg/m}^3$) is used, infiltration heat loss is overestimated by $\approx 40\%$. The model corrects density using the barometric formula: $\rho(3500\text{m}) \approx 0.852\text{ kg/m}^3$. |
| 10 | PCM Phase Transition | Indoor temperature crosses melting point $T_m = 21.0^\circ\text{C}$ | Apparent heat capacity method spikes effective specific heat $C_{p,\text{eff}} = C_{p,\text{solid}} + \frac{L_f}{\Delta T_{\text{phase}}}$ during phase change interval $[20.0^\circ\text{C}, 22.0^\circ\text{C}]$, dampening temperature swings. |
| 11 | Compare Module | Comparing identical Design A and Design B | All difference metrics ($\Delta \text{Comfort}$, $\Delta \text{Heat Loss}$, $\Delta \text{Autonomy}$) display $0.0$, direction flags set to `neutral`, overlaid chart lines perfectly overlap. |
| 12 | Timeline Scrubber | Active timestep index out of bounds ($i < 0$ or $i > 24$) | Timestep index clamped to range $[0, 24]$. Inactive animation loop pauses on clamp boundaries. |
| 13 | Mock Repository | Route loaded directly before simulation execution trigger | Initial store state is seeded with pre-computed Ladakh simulation run. Results, metrics, charts, and 3D twin are populated on initial mount without empty state flickering. |
| 14 | JSON Report Export | User triggers JSON export with empty or invalid project name | Sanitizer replaces invalid characters and falls back to `trueshel-project-export-${ISO_TIMESTAMP}.json`. |
| 15 | PDF Report Export | Export triggered while 3D WebGL canvas is rendering or unmounted | PDF generator uses vector/tabular representations and fallback static thumbnail, preventing WebGL context loss or null canvas crashes. |

---

## 1. Canonical State Architecture & Domain Models

### 1.1 ProjectState Tree Specification

The canonical project state represents the full state hierarchy of a TRUESHEL V2 engineering session:

```typescript
export interface ProjectState {
  project: ProjectMetadata;
  climate: ClimateData;
  shelter: ShelterConfig;
  simulation: SimulationState;
  comparison: ComparisonState;
  optimization: OptimizationState;
  recommendation: RecommendationState;
  resilience: ResilienceState;
  thermalTwin: ThermalTwinState;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
  version: string;   // e.g. "2.0.0"
  status: "draft" | "simulated" | "optimized" | "verified";
  tags: string[];
}
```

### 1.2 Climate Domain Model (`types/climate.ts`)

```typescript
export interface ClimateData {
  location: string;             // e.g., "Leh, Ladakh, India"
  latitude: number;             // Decimal degrees, e.g., 34.1526
  longitude: number;            // Decimal degrees, e.g., 77.5771
  altitude: number;             // Meters above sea level, e.g., 3500
  barometricPressure: number;   // Pascals, e.g., 65500 Pa at 3500m
  designDay: "winter-solstice" | "summer-solstice" | "annual-average" | "extreme-cold";
  hourlyData: HourlyClimatePoint[]; // Exactly 25 points (00:00 to 24:00)
}

export interface HourlyClimatePoint {
  hour: number;                 // 0 to 24
  timeString: string;           // "00:00", "01:00", ... "24:00"
  dryBulbTemperature: number;   // °C
  relativeHumidity: number;     // % (0 to 100)
  globalHorizontalIrradiance: number; // W/m² (GHI)
  directNormalIrradiance: number;     // W/m² (DNI)
  diffuseHorizontalIrradiance: number;// W/m² (DHI)
  windSpeed: number;            // m/s
  windDirection: number;        // Degrees (0-360)
  skyCover: number;             // Tenths (0 to 1.0)
}
```

### 1.3 Shelter Domain Model (`types/shelter.ts` & `types/material.ts`)

```typescript
export interface ShelterConfig {
  geometry: ShelterGeometry;
  orientation: ShelterOrientation;
  envelope: ShelterEnvelope;
  openings: ShelterOpenings;
  thermalMass: ThermalMassConfig;
  pcm: PCMConfig;
  ventilation: VentilationConfig;
}

export interface ShelterGeometry {
  length: number;    // meters (East-West dimension), e.g. 6.0
  width: number;     // meters (North-South dimension), e.g. 4.0
  height: number;    // meters (Eaves/wall height), e.g. 2.8
  roofPitch: number; // degrees, e.g. 0 (flat) or 25 (gabled)
  roofType: "flat" | "gable" | "shed";
  floorElevation: number; // meters above grade, e.g. 0.2
}

export interface ShelterOrientation {
  azimuth: number;   // degrees from South (0 = South, -90 = East, +90 = West, 180 = North)
}

export interface ShelterEnvelope {
  exteriorWall: AssemblyConfig;
  roof: AssemblyConfig;
  floor: AssemblyConfig;
  internalPartition?: AssemblyConfig;
}

export interface AssemblyConfig {
  id: string;
  name: string;
  layers: AssemblyLayer[]; // Ordered from EXTERIOR (index 0) to INTERIOR
  calculatedRValue: number; // m²·K/W
  calculatedUValue: number; // W/m²·K
}

export interface AssemblyLayer {
  id: string;
  materialId: string;
  materialName: string;
  thickness: number;        // meters, e.g. 0.15
  conductivity: number;     // W/(m·K)
  density: number;          // kg/m³
  specificHeat: number;     // J/(kg·K)
  rValue: number;           // m²·K/W (thickness / conductivity)
}

export interface Material {
  id: string;
  name: string;
  category: "masonry" | "insulation" | "timber" | "finish" | "glazing" | "phase-change";
  conductivity: number;     // k: W/(m·K)
  density: number;          // ρ: kg/m³
  specificHeat: number;     // Cp: J/(kg·K)
  emissivity: number;       // ε (0.0 to 1.0)
  solarAbsorptance: number; // α (0.0 to 1.0)
  defaultThickness: number; // meters
  description: string;
  embodiedCarbon?: number;  // kgCO2e/kg
}

export interface ShelterOpenings {
  windows: WindowOpening[];
  doors: DoorOpening[];
}

export interface WindowOpening {
  id: string;
  wallFace: "south" | "north" | "east" | "west";
  area: number;             // m²
  uValue: number;           // W/(m²·K)
  shgc: number;             // Solar Heat Gain Coefficient (0.0 to 1.0)
  frameFraction: number;    // Frame area fraction (e.g. 0.15)
  overhangDepth: number;    // meters (for seasonal shading)
}

export interface DoorOpening {
  id: string;
  wallFace: "south" | "north" | "east" | "west";
  area: number;             // m²
  uValue: number;           // W/(m²·K)
}

export interface ThermalMassConfig {
  level: "low" | "medium" | "high" | "very-high";
  primaryMaterial: string;  // e.g. "Rammed Earth", "Stone Masonry", "Concrete Slab"
  effectiveThickness: number; // meters (typically 0.10 to 0.30m)
  surfaceArea: number;      // m² exposed to interior air
  calculatedHeatCapacity: number; // kJ/K
}

export interface PCMConfig {
  enabled: boolean;
  materialName: string;     // e.g. "Bio-based Paraffin PCM 21"
  meltingTemperature: number; // °C (e.g. 21.0)
  latentHeatCapacity: number; // kJ/kg (e.g. 200.0)
  mass: number;             // kg (e.g. 150.0)
  placement: "interior-walls" | "ceiling" | "floor-screed";
}

export interface VentilationConfig {
  mode: "natural" | "mechanical" | "night-purge" | "sealed";
  airChangesPerHour: number; // ACH, e.g. 0.35 (tight) to 2.5 (venting)
  heatRecoveryEfficiency: number; // 0.0 to 0.85
  shadingActive: boolean;
}
```

### 1.4 Simulation Domain Model (`types/simulation.ts`)

```typescript
export interface SimulationState {
  status: "idle" | "configuring" | "running" | "completed" | "error";
  progress: number; // 0 to 100
  currentStage: string;
  stages: SimulationStage[];
  configuration: SimulationConfig;
  result: SimulationResult | null;
  errorMessage?: string;
  isMockData: boolean;
}

export interface SimulationStage {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "error";
}

export interface SimulationConfig {
  durationHours: number;    // 24 default
  timestepMinutes: number;  // 60 default
  comfortBandMin: number;   // °C, e.g. 18.0
  comfortBandMax: number;   // °C, e.g. 26.0
  includeThermalMass: boolean;
  includePCM: boolean;
  includeSolarRadiation: boolean;
  includeInfiltration: boolean;
  includeNightVentilation: boolean;
  internalHeatGainsWatts: number; // W (occupants, electronics)
}

export type ThermalState = "UNDER-COMFORT" | "COMFORT" | "OVERHEATING";

export interface SimulationResult {
  timeline: string[];           // ["00:00", "01:00", ..., "24:00"] (length: 25)
  indoorTemperature: number[];  // °C at each timestep
  outdoorTemperature: number[]; // °C at each timestep
  solarIrradiance: number[];    // W/m² incident on primary facade
  heatGain: number[];           // Total heat gain in kW at each timestep
  heatLoss: number[];           // Total heat loss in kW at each timestep
  storage: number[];            // Thermal storage charge percentage (0-100%)
  comfort: number[];            // Thermal comfort score or PMV at each timestep
  thermalStates: ThermalState[];// Semantic status at each timestep
  
  // Aggregate Performance Metrics
  summary: SimulationSummary;
  
  // Component Breakdown for Heat Loss & Gain
  breakdown: HeatFlowBreakdown;
  
  // Autonomy and Risk Indices
  autonomy: ThermalAutonomyResult;
  risk: ClimateRiskAssessment;
}

export interface SimulationSummary {
  minIndoorTemp: number;        // °C
  maxIndoorTemp: number;        // °C
  meanIndoorTemp: number;       // °C
  comfortHours: number;         // Total hours within [18, 26]°C
  underComfortHours: number;    // Total hours < 18°C
  overheatingHours: number;     // Total hours > 26°C
  totalHeatLossKWh: number;     // Cumulative daily loss
  totalSolarGainKWh: number;    // Cumulative daily solar harvest
  netThermalBalanceKWh: number; // Gain - Loss
  diurnalDampingFactor: number; // 1 - (Delta Tin / Delta Tout)
  thermalLagHours: number;      // Peak outdoor to peak indoor delay
  currentState: ThermalState;
}

export interface HeatFlowBreakdown {
  roofLossPercentage: number;
  wallsLossPercentage: number;
  floorLossPercentage: number;
  windowsLossPercentage: number;
  infiltrationLossPercentage: number;
  roofLossKW: number[];
  wallsLossKW: number[];
  floorLossKW: number[];
  windowsLossKW: number[];
  infiltrationLossKW: number[];
}

export interface ThermalAutonomyResult {
  hoursAboveThreshold: number;  // Hours until Tin drops to 16°C without heat
  decayRateDegreesPerHour: number;
  criticalThresholdTemp: number; // 16.0 °C
  decayTimeline: { hour: number; temp: number }[];
}

export interface ClimateRiskAssessment {
  overallRiskScore: number;     // 0 (safe) to 100 (extreme danger)
  freezeThawRisk: "low" | "medium" | "high";
  extremeColdExposure: "low" | "medium" | "severe";
  condensationRisk: "low" | "medium" | "high";
  solarOverheatingRisk: "low" | "medium" | "high";
}
```

### 1.5 Comparison, Optimization, Recommendation, Resilience (`types/`)

```typescript
// Comparison Domain Model (types/comparison.ts)
export interface ComparisonState {
  designA: ShelterConfig;
  designB: ShelterConfig;
  resultA: SimulationResult | null;
  resultB: SimulationResult | null;
  deltas: ComparisonDeltas | null;
}

export interface ComparisonDeltas {
  comfortHoursDelta: number;     // e.g. +4.5 hours
  totalHeatLossDeltaKWh: number; // e.g. -12.3 kWh
  autonomyDeltaHours: number;    // e.g. +5.2 hours
  peakHeatingLoadDeltaKW: number;// e.g. -1.8 kW
  direction: {
    comfort: "improved" | "degraded" | "neutral";
    heatLoss: "improved" | "degraded" | "neutral";
    autonomy: "improved" | "degraded" | "neutral";
  };
}

// Optimization Domain Model (types/optimization.ts)
export interface OptimizationState {
  objective: "max-comfort" | "min-heat-loss" | "max-autonomy" | "balanced";
  variables: {
    wallInsulationThickness: { min: number; max: number; current: number; enabled: boolean };
    southWindowArea: { min: number; max: number; current: number; enabled: boolean };
    orientationAzimuth: { min: number; max: number; current: number; enabled: boolean };
    thermalMassLevel: { options: string[]; current: string; enabled: boolean };
    pcmEnabled: { enabled: boolean; current: boolean };
    overhangDepth: { min: number; max: number; current: number; enabled: boolean };
  };
  constraints: {
    minIndoorTemp: number;   // ≥ 16.0 °C
    maxIndoorTemp: number;   // ≤ 28.0 °C
    maxWindowAreaSouth: number; // ≤ 12.0 m²
    maxWallThickness: number;   // ≤ 0.45 m
  };
  results: {
    status: "idle" | "running" | "completed";
    candidatesEvaluated: number;
    feasibleDesignsCount: number;
    bestCandidate: OptimizationCandidate | null;
    candidateRankings: OptimizationCandidate[];
  };
}

export interface OptimizationCandidate {
  id: string;
  rank: number;
  wallInsulationThickness: number;
  southWindowArea: number;
  orientationAzimuth: number;
  thermalMassLevel: string;
  pcmEnabled: boolean;
  overhangDepth: number;
  comfortHours: number;
  totalHeatLossKWh: number;
  autonomyHours: number;
  score: number;
  isFeasible: boolean;
}

// Recommendation Domain Model (types/recommendation.ts)
export interface RecommendationState {
  recommendedConfig: Partial<ShelterConfig> | null;
  justification: {
    comfortHoursGain: number;
    heatLossReductionPercent: number;
    autonomyGainHours: number;
    keyDrivers: RecommendationDriver[];
  };
}

export interface RecommendationDriver {
  parameter: string;
  suggestedValue: string;
  baselineValue: string;
  physicsRationale: string;
  impactLevel: "high" | "medium" | "low";
}

// Resilience Domain Model (types/resilience.ts)
export interface ResilienceState {
  autonomyHours: number;
  climateExposureScore: number;
  freezeThawCycles: number;
  windExposureFactor: number;
  solarExposureIndex: number;
  materialRiskRating: "low" | "medium" | "high";
  failureIntelligence: FailurePatternMatch[];
}

export interface FailurePatternMatch {
  id: string;
  issue: string;
  climateContext: string;
  observedPattern: string;
  consequence: string;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  recommendedMitigation: string;
  authoritativeSource: string;
}

// Thermal Twin Domain Model (types/thermal-twin.ts)
export interface ThermalTwinState {
  activeMode: "normal" | "thermal" | "heat-flow" | "solar" | "storage";
  activeTimestep: number; // 0 to 24
  isPlaying: boolean;
  playbackSpeed: number;  // 1x = 1 simulated hour / second
  selectedComponent: SelectedComponentInspection | null;
  cameraResetTrigger: number;
}

export interface SelectedComponentInspection {
  componentId: string;
  componentName: string;
  surfaceFace: "south-wall" | "north-wall" | "east-wall" | "west-wall" | "roof" | "floor" | "window";
  materialName: string;
  thickness: number;
  surfaceTemperature: number; // °C at active timestep
  heatFluxThroughSurface: number; // W/m² at active timestep
}
```

---

## 2. Zod Validation Layer

The Zod validation layer validates all API boundaries, persistent store hydration payloads, and user form inputs.

```typescript
import { z } from "zod";

// Base Scalars
export const PositiveNumber = z.number().positive({ message: "Must be a positive number" });
export const NonNegativeNumber = z.number().min(0, { message: "Must be non-negative" });
export const NormalizedUnit = z.number().min(0).max(1);

// Material Schema
export const MaterialSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  category: z.enum(["masonry", "insulation", "timber", "finish", "glazing", "phase-change"]),
  conductivity: PositiveNumber.max(10.0), // W/(m·K)
  density: PositiveNumber.max(10000),      // kg/m³
  specificHeat: PositiveNumber.max(5000),   // J/(kg·K)
  emissivity: NormalizedUnit,
  solarAbsorptance: NormalizedUnit,
  defaultThickness: PositiveNumber.max(2.0),
  description: z.string(),
  embodiedCarbon: z.number().optional()
});

// Assembly Layer Schema
export const AssemblyLayerSchema = z.object({
  id: z.string().min(1),
  materialId: z.string().min(1),
  materialName: z.string().min(1),
  thickness: PositiveNumber.max(1.5),
  conductivity: PositiveNumber,
  density: PositiveNumber,
  specificHeat: PositiveNumber,
  rValue: NonNegativeNumber
});

// Assembly Schema
export const AssemblyConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  layers: z.array(AssemblyLayerSchema).min(1, "Assembly must have at least one layer"),
  calculatedRValue: PositiveNumber,
  calculatedUValue: PositiveNumber
});

// Shelter Geometry Schema
export const ShelterGeometrySchema = z.object({
  length: z.number().min(1.0).max(50.0),
  width: z.number().min(1.0).max(50.0),
  height: z.number().min(1.5).max(12.0),
  roofPitch: z.number().min(0).max(60),
  roofType: z.enum(["flat", "gable", "shed"]),
  floorElevation: z.number().min(0).max(3.0)
});

// Openings Schema
export const WindowOpeningSchema = z.object({
  id: z.string(),
  wallFace: z.enum(["south", "north", "east", "west"]),
  area: PositiveNumber.max(50.0),
  uValue: PositiveNumber.max(10.0),
  shgc: NormalizedUnit,
  frameFraction: NormalizedUnit,
  overhangDepth: NonNegativeNumber.max(3.0)
});

export const DoorOpeningSchema = z.object({
  id: z.string(),
  wallFace: z.enum(["south", "north", "east", "west"]),
  area: PositiveNumber.max(15.0),
  uValue: PositiveNumber.max(10.0)
});

// Complete Shelter Schema
export const ShelterConfigSchema = z.object({
  geometry: ShelterGeometrySchema,
  orientation: z.object({
    azimuth: z.number().min(-180).max(180)
  }),
  envelope: z.object({
    exteriorWall: AssemblyConfigSchema,
    roof: AssemblyConfigSchema,
    floor: AssemblyConfigSchema,
    internalPartition: AssemblyConfigSchema.optional()
  }),
  openings: z.object({
    windows: z.array(WindowOpeningSchema),
    doors: z.array(DoorOpeningSchema)
  }),
  thermalMass: z.object({
    level: z.enum(["low", "medium", "high", "very-high"]),
    primaryMaterial: z.string().min(1),
    effectiveThickness: PositiveNumber.max(1.0),
    surfaceArea: PositiveNumber,
    calculatedHeatCapacity: PositiveNumber
  }),
  pcm: z.object({
    enabled: z.boolean(),
    materialName: z.string(),
    meltingTemperature: z.number().min(10).max(40),
    latentHeatCapacity: NonNegativeNumber,
    mass: NonNegativeNumber,
    placement: z.enum(["interior-walls", "ceiling", "floor-screed"])
  }),
  ventilation: z.object({
    mode: z.enum(["natural", "mechanical", "night-purge", "sealed"]),
    airChangesPerHour: z.number().min(0.05).max(10.0),
    heatRecoveryEfficiency: NormalizedUnit,
    shadingActive: z.boolean()
  })
});

// Simulation Result Schema
export const ThermalStateSchema = z.enum(["UNDER-COMFORT", "COMFORT", "OVERHEATING"]);

export const SimulationResultSchema = z.object({
  timeline: z.array(z.string()).length(25, "Timeline must contain exactly 25 points (00:00 to 24:00)"),
  indoorTemperature: z.array(z.number()).length(25),
  outdoorTemperature: z.array(z.number()).length(25),
  solarIrradiance: z.array(z.number()).length(25),
  heatGain: z.array(z.number()).length(25),
  heatLoss: z.array(z.number()).length(25),
  storage: z.array(z.number().min(0).max(100)).length(25),
  comfort: z.array(z.number()).length(25),
  thermalStates: z.array(ThermalStateSchema).length(25),
  summary: z.object({
    minIndoorTemp: z.number(),
    maxIndoorTemp: z.number(),
    meanIndoorTemp: z.number(),
    comfortHours: z.number().min(0).max(24),
    underComfortHours: z.number().min(0).max(24),
    overheatingHours: z.number().min(0).max(24),
    totalHeatLossKWh: z.number(),
    totalSolarGainKWh: z.number(),
    netThermalBalanceKWh: z.number(),
    diurnalDampingFactor: z.number().min(0).max(1),
    thermalLagHours: z.number().min(0).max(24),
    currentState: ThermalStateSchema
  }),
  breakdown: z.object({
    roofLossPercentage: z.number().min(0).max(100),
    wallsLossPercentage: z.number().min(0).max(100),
    floorLossPercentage: z.number().min(0).max(100),
    windowsLossPercentage: z.number().min(0).max(100),
    infiltrationLossPercentage: z.number().min(0).max(100),
    roofLossKW: z.array(z.number()).length(25),
    wallsLossKW: z.array(z.number()).length(25),
    floorLossKW: z.array(z.number()).length(25),
    windowsLossKW: z.array(z.number()).length(25),
    infiltrationLossKW: z.array(z.number()).length(25)
  }),
  autonomy: z.object({
    hoursAboveThreshold: z.number().min(0),
    decayRateDegreesPerHour: z.number(),
    criticalThresholdTemp: z.number(),
    decayTimeline: z.array(z.object({ hour: z.number(), temp: z.number() }))
  }),
  risk: z.object({
    overallRiskScore: z.number().min(0).max(100),
    freezeThawRisk: z.enum(["low", "medium", "high"]),
    extremeColdExposure: z.enum(["low", "medium", "severe"]),
    condensationRisk: z.enum(["low", "medium", "high"]),
    solarOverheatingRisk: z.enum(["low", "medium", "high"])
  })
});
```

---

## 3. Zustand Store Architecture & Selector Patterns

TRUESHEL V2 implements 4 decoupled Zustand stores located in `stores/`:
- `project-store.ts`
- `shelter-store.ts`
- `simulation-store.ts`
- `thermal-twin-store.ts`

### 3.1 Store Contracts & Architectural Invariants
1. **No Direct Import Cycles**: Stores NEVER import actions or state from one another directly. Cross-store updates are orchestrated through React hooks, TanStack Query mutations, or container controllers.
2. **Atomic Selectors with `useShallow`**: Components subscribe only to the exact slice of state they require using atomic selectors or shallow equality (`zustand/react/shallow`).
3. **Reactive Persistence**: `shelter-store` and `project-store` persist configuration to `localStorage` under keys `trueshel_project_v2` and `trueshel_shelter_v2`, surviving page refreshes.

### 3.2 Store Definitions & State Slices

#### 1. `project-store.ts`
```typescript
interface ProjectStoreState {
  project: ProjectMetadata;
  isDirty: boolean;
  lastSavedAt: string | null;
  
  // Actions
  setProjectName: (name: string) => void;
  setProjectDescription: (desc: string) => void;
  saveProject: () => void;
  loadProject: (project: ProjectMetadata) => void;
  markClean: () => void;
}
```

#### 2. `shelter-store.ts`
```typescript
interface ShelterStoreState {
  shelter: ShelterConfig;
  
  // Real-time calculated properties
  calculatedMetrics: {
    exteriorWallRValue: number;
    exteriorWallUValue: number;
    roofRValue: number;
    roofUValue: number;
    floorRValue: number;
    floorUValue: number;
    totalEnvelopeUA: number; // W/K
    totalGrossWallArea: number; // m²
    totalWindowArea: number;    // m²
  };

  // Actions
  setGeometry: (geometry: Partial<ShelterGeometry>) => void;
  setOrientation: (azimuth: number) => void;
  addLayerToAssembly: (assemblyKey: "exteriorWall" | "roof" | "floor", layer: Omit<AssemblyLayer, "id" | "rValue">) => void;
  updateLayerThickness: (assemblyKey: "exteriorWall" | "roof" | "floor", layerId: string, thickness: number) => void;
  removeLayerFromAssembly: (assemblyKey: "exteriorWall" | "roof" | "floor", layerId: string) => void;
  reorderAssemblyLayers: (assemblyKey: "exteriorWall" | "roof" | "floor", startIndex: number, endIndex: number) => void;
  updateWindowOpening: (windowId: string, updates: Partial<WindowOpening>) => void;
  setThermalMassLevel: (level: ThermalMassConfig["level"]) => void;
  togglePCM: (enabled: boolean) => void;
  setVentilationMode: (mode: VentilationConfig["mode"]) => void;
  resetToLadakhPreset: () => void;
}
```

#### 3. `simulation-store.ts`
```typescript
interface SimulationStoreState {
  status: "idle" | "configuring" | "running" | "completed" | "error";
  progress: number;
  currentStage: string;
  config: SimulationConfig;
  result: SimulationResult | null;
  isMockData: boolean;
  errorMessage: string | null;

  // Actions
  setConfig: (config: Partial<SimulationConfig>) => void;
  startSimulation: () => Promise<void>;
  setStageProgress: (stageId: string, progress: number) => void;
  setCompletedResult: (result: SimulationResult, isMock: boolean) => void;
  setError: (error: string) => void;
  resetSimulation: () => void;
}
```

#### 4. `thermal-twin-store.ts`
```typescript
interface ThermalTwinStoreState {
  activeMode: "normal" | "thermal" | "heat-flow" | "solar" | "storage";
  activeTimestep: number; // 0..24
  isPlaying: boolean;
  selectedComponent: SelectedComponentInspection | null;
  cameraResetCount: number;

  // Actions
  setActiveMode: (mode: "normal" | "thermal" | "heat-flow" | "solar" | "storage") => void;
  setActiveTimestep: (timestep: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlayback: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  selectComponent: (component: SelectedComponentInspection | null) => void;
  triggerCameraReset: () => void;
}
```

### 3.3 Selector Pattern Guidelines

To prevent unnecessary re-renders in information-dense views:
```typescript
// Correct: Atomic Primitive Selector
export const useActiveTimestep = () => useThermalTwinStore((state) => state.activeTimestep);

// Correct: Multi-property with shallow comparison
import { useShallow } from "zustand/react/shallow";
export const useGeometryDimensions = () =>
  useShelterStore(
    useShallow((state) => ({
      length: state.shelter.geometry.length,
      width: state.shelter.geometry.width,
      height: state.shelter.geometry.height,
    }))
  );
```

---

## 4. Thermal Engineering Calculation Engine

All calculations strictly follow international building physics standards (ISO 6946, ASHRAE Handbook of Fundamentals, Duffie & Beckman Solar Engineering).

### 4.1 ISO 6946 Multi-Layer Thermal Resistance ($R$) & Transmittance ($U$)

For an opaque assembly consisting of $N$ planar homogeneous layers:

$$R_i = \frac{d_i}{k_i} \quad \left[\text{m}^2\cdot\text{K/W}\right]$$

Where:
- $d_i$ = layer thickness in meters ($\text{m}$)
- $k_i$ = material thermal conductivity in Watts per meter-Kelvin ($\text{W/(m}\cdot\text{K)}$)

The total thermal resistance of the assembly, including interior and exterior boundary air film surface resistances ($R_{si}$ and $R_{se}$):

$$R_{\text{total}} = R_{si} + \sum_{i=1}^{N} \frac{d_i}{k_i} + R_{se} \quad \left[\text{m}^2\cdot\text{K/W}\right]$$

Standard surface film coefficients per ISO 6946:
- Vertical walls (horizontal heat flow): $R_{si} = 0.130\text{ m}^2\cdot\text{K/W}$, $R_{se} = 0.040\text{ m}^2\cdot\text{K/W}$
- Roof / Ceiling (upward heat flow in winter): $R_{si} = 0.100\text{ m}^2\cdot\text{K/W}$, $R_{se} = 0.040\text{ m}^2\cdot\text{K/W}$
- Ground Floor (downward heat flow): $R_{si} = 0.170\text{ m}^2\cdot\text{K/W}$, $R_{se} = 0.000\text{ m}^2\cdot\text{K/W}$ (sub-slab contact)

The overall thermal transmittance ($U$-value) is the exact inverse:

$$U = \frac{1}{R_{\text{total}}} \quad \left[\text{W/(m}^2\cdot\text{K)}\right]$$

### 4.2 Building Envelope Heat Loss Formulation

Total steady-state heat loss rate at any hour $t$:

$$Q_{\text{loss}}(t) = Q_{\text{trans}}(t) + Q_{\text{inf}}(t) + Q_{\text{vent}}(t) \quad [\text{kW}]$$

#### 1. Conductive Transmission Loss:
$$Q_{\text{trans}}(t) = \sum_{j \in \{\text{walls, roof, floor, windows}\}} \left( U_j \cdot A_j \right) \cdot \left( T_{\text{in}}(t) - T_{\text{out}}(t) \right) \times 10^{-3} \quad [\text{kW}]$$

#### 2. High-Altitude Infiltration Heat Loss:
Air density depends on barometric pressure according to the ideal gas law:
$$\rho_{\text{air}}(z) = \rho_0 \cdot \exp\left( - \frac{g \cdot M \cdot z}{R \cdot T_0} \right) \approx 0.852\text{ kg/m}^3 \text{ at } 3,500\text{ m (Leh, Ladakh)}$$

$$Q_{\text{inf}}(t) = \frac{\rho_{\text{air}} \cdot C_{p,\text{air}} \cdot V_{\text{shelter}} \cdot \text{ACH}}{3600} \cdot \left( T_{\text{in}}(t) - T_{\text{out}}(t) \right) \times 10^{-3} \quad [\text{kW}]$$
Where $C_{p,\text{air}} = 1005\text{ J/(kg}\cdot\text{K)}$ and $V_{\text{shelter}} = L \times W \times H$.

### 4.3 Solar Irradiance on Oriented Glazing

For a vertical South-facing window ($\beta = 90^\circ, \gamma = 0^\circ$):

$$I_{\text{total, south}}(t) = I_{\text{beam, south}}(t) + I_{\text{diffuse, south}}(t) + I_{\text{ground, reflected}}(t) \quad [\text{W/m}^2]$$

$$Q_{\text{solar}}(t) = A_{\text{window}} \cdot \text{SHGC} \cdot I_{\text{total, south}}(t) \cdot (1 - F_{\text{frame}}) \cdot F_{\text{shade}}(t) \times 10^{-3} \quad [\text{kW}]$$

Where:
- $\text{SHGC}$ = Solar Heat Gain Coefficient of glazing (e.g. 0.62 for high-gain Low-E)
- $F_{\text{frame}}$ = 0.15 (15% framing area reduction)
- $F_{\text{shade}}$ = overhang geometric shading fraction based on solar altitude angle $\alpha_s(t)$

### 4.4 Transient Energy Balance & Enthalpy Model

$$\left( C_{\text{air}} + C_{\text{mass}} + C_{\text{pcm, eff}}(T) \right) \frac{dT_{\text{in}}}{dt} = Q_{\text{gain}}(t) - Q_{\text{loss}}(t)$$

Where:
- $Q_{\text{gain}}(t) = Q_{\text{solar}}(t) + Q_{\text{internal}}$
- $C_{\text{mass}} = \sum m_k \cdot C_{p,k}$
- $C_{\text{pcm, eff}}(T) = \begin{cases} m_{\text{pcm}} \cdot C_{p,\text{solid}}, & T < T_m - \frac{\Delta T_p}{2} \\ m_{\text{pcm}} \cdot \left( \frac{C_{p,s} + C_{p,l}}{2} + \frac{L_f}{\Delta T_p} \right), & T_m - \frac{\Delta T_p}{2} \le T \le T_m + \frac{\Delta T_p}{2} \\ m_{\text{pcm}} \cdot C_{p,\text{liquid}}, & T > T_m + \frac{\Delta T_p}{2} \end{cases}$

### 4.5 Thermal Autonomy Exponential Decay Formulation

When heating fails or net solar gains cease at night ($Q_{\text{gain}} = 0$):

The building thermal time constant $\tau$:

$$\tau = \frac{C_{\text{total}}}{\sum (U \cdot A) + \dot{m}_{\text{air}} C_{p,\text{air}}} \quad [\text{seconds or hours}]$$

The indoor temperature decays exponentially toward outdoor ambient:

$$T_{\text{in}}(t) = T_{\text{out}} + \left( T_0 - T_{\text{out}} \right) \cdot \exp\left( -\frac{t}{\tau} \right)$$

Solving for the time $t_{\text{autonomy}}$ required to reach the critical survival threshold $T_{\text{threshold}} = 16.0^\circ\text{C}$:

$$16.0 = T_{\text{out}} + \left( T_0 - T_{\text{out}} \right) \cdot \exp\left( -\frac{t_{\text{autonomy}}}{\tau} \right)$$

$$t_{\text{autonomy}} = \tau \cdot \ln\left( \frac{T_0 - T_{\text{out}}}{16.0 - T_{\text{out}}} \right) \quad [\text{hours}]$$

---

## 5. Mock Repository: Ladakh High-Altitude Dataset

To ensure every page in TRUESHEL V2 renders complete, realistic data on first load without a live backend, `MockRepository` provides a baseline winter dataset for Leh, Ladakh ($3,500\text{ m}$ elevation, latitude $34.15^\circ\text{ N}$).

### 5.1 Reference Shelter Configuration (Ladakh Passive Solar Preset)
- **Geometry**: $L = 6.0\text{ m}$ (East-West), $W = 4.0\text{ m}$ (North-South), $H = 2.8\text{ m}$ (Gross Floor Area: $24.0\text{ m}^2$, Volume: $67.2\text{ m}^3$)
- **Orientation**: $0^\circ$ (Direct South orientation)
- **Exterior Wall Assembly ($R = 5.26\text{ m}^2\cdot\text{K/W}, U = 0.19\text{ W/m}^2\cdot\text{K}$)**:
  1. Exterior: 20mm Lime/cement render ($k = 0.80$)
  2. Insulation: 150mm Wood-fiber rigid insulation board ($k = 0.038$)
  3. Structural Thermal Mass: 300mm Rammed Earth / Adobe block ($k = 0.75$)
  4. Interior Finish: 15mm Clay plaster finish ($k = 0.60$)
- **Roof Assembly ($R = 7.69\text{ m}^2\cdot\text{K/W}, U = 0.13\text{ W/m}^2\cdot\text{K}$)**:
  1. Metal standing seam roof sheet ($k = 50.0$)
  2. 50mm ventilated air gap
  3. 250mm Rockwool batt insulation ($k = 0.034$)
  4. Vapor retarder & timber ceiling boards ($k = 0.13$)
- **Floor Assembly ($R = 4.55\text{ m}^2\cdot\text{K/W}, U = 0.22\text{ W/m}^2\cdot\text{K}$)**:
  1. 100mm Extruded Polystyrene (XPS) sub-slab ($k = 0.029$)
  2. 150mm High-density concrete slab mass ($k = 1.40$)
  3. Slate stone tile finish ($k = 1.80$)
- **Glazing**: South-facing direct gain window ($8.0\text{ m}^2$, Triple-glazed Low-E Argon, $U = 0.80\text{ W/m}^2\cdot\text{K}$, $\text{SHGC} = 0.58$, overhang $0.6\text{ m}$)
- **PCM**: $120\text{ kg}$ Bio-based paraffin tiles in interior South Trombe zone ($T_m = 21.0^\circ\text{C}, L_f = 200\text{ kJ/kg}$)

### 5.2 24-Hour Aligned Simulation Timeline (25 Timesteps)

| Timestep | Time | $T_{\text{out}}$ (°C) | GHI (W/m²) | $T_{\text{in}}$ (°C) | Heat Loss (kW) | Solar Gain (kW) | Storage (%) | Comfort Index | Thermal State |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 0 | 00:00 | -12.4 | 0.0 | 18.2 | 0.82 | 0.00 | 48% | 0.82 | COMFORT |
| 1 | 01:00 | -13.1 | 0.0 | 17.8 | 0.84 | 0.00 | 42% | 0.78 | UNDER-COMFORT |
| 2 | 02:00 | -13.8 | 0.0 | 17.4 | 0.86 | 0.00 | 36% | 0.74 | UNDER-COMFORT |
| 3 | 03:00 | -14.3 | 0.0 | 17.1 | 0.87 | 0.00 | 30% | 0.71 | UNDER-COMFORT |
| 4 | 04:00 | -14.8 | 0.0 | 16.8 | 0.89 | 0.00 | 25% | 0.68 | UNDER-COMFORT |
| 5 | 05:00 | -15.0 | 0.0 | 16.5 | 0.90 | 0.00 | 20% | 0.65 | UNDER-COMFORT |
| 6 | 06:00 | -14.6 | 15.0 | 16.4 | 0.89 | 0.04 | 18% | 0.64 | UNDER-COMFORT |
| 7 | 07:00 | -13.2 | 120.0 | 16.7 | 0.85 | 0.35 | 20% | 0.67 | UNDER-COMFORT |
| 8 | 08:00 | -10.5 | 310.0 | 17.5 | 0.78 | 1.10 | 28% | 0.75 | UNDER-COMFORT |
| 9 | 09:00 | -7.2 | 520.0 | 18.6 | 0.70 | 2.15 | 40% | 0.86 | COMFORT |
| 10 | 10:00 | -4.8 | 680.0 | 19.9 | 0.64 | 3.10 | 58% | 0.94 | COMFORT |
| 11 | 11:00 | -3.0 | 790.0 | 21.2 | 0.59 | 3.85 | 76% | 0.98 | COMFORT |
| 12 | 12:00 | -1.8 | 820.0 | 22.4 | 0.56 | 4.10 | 92% | 0.95 | COMFORT |
| 13 | 13:00 | -1.5 | 800.0 | 23.1 | 0.55 | 3.98 | 98% | 0.92 | COMFORT |
| 14 | 14:00 | -2.1 | 710.0 | 23.4 | 0.57 | 3.42 | 100% | 0.90 | COMFORT |
| 15 | 15:00 | -3.5 | 540.0 | 23.0 | 0.61 | 2.45 | 96% | 0.93 | COMFORT |
| 16 | 16:00 | -5.8 | 320.0 | 22.2 | 0.67 | 1.30 | 88% | 0.97 | COMFORT |
| 17 | 17:00 | -7.9 | 90.0 | 21.3 | 0.72 | 0.28 | 80% | 0.98 | COMFORT |
| 18 | 18:00 | -9.4 | 0.0 | 20.6 | 0.75 | 0.00 | 74% | 0.96 | COMFORT |
| 19 | 19:00 | -10.5 | 0.0 | 20.0 | 0.77 | 0.00 | 68% | 0.93 | COMFORT |
| 20 | 20:00 | -11.2 | 0.0 | 19.5 | 0.79 | 0.00 | 63% | 0.91 | COMFORT |
| 21 | 21:00 | -11.8 | 0.0 | 19.1 | 0.81 | 0.00 | 58% | 0.89 | COMFORT |
| 22 | 22:00 | -12.2 | 0.0 | 18.7 | 0.82 | 0.00 | 54% | 0.87 | COMFORT |
| 23 | 23:00 | -12.6 | 0.0 | 18.4 | 0.83 | 0.00 | 50% | 0.84 | COMFORT |
| 24 | 24:00 | -13.0 | 0.0 | 18.1 | 0.84 | 0.00 | 47% | 0.81 | COMFORT |

### 5.3 Aggregate Summary Metrics
- **Min Indoor Temp**: $16.4^\circ\text{C}$ (at 06:00)
- **Max Indoor Temp**: $23.4^\circ\text{C}$ (at 14:00)
- **Mean Indoor Temp**: $19.6^\circ\text{C}$
- **Comfort Hours ($18.0^\circ\text{C} - 26.0^\circ\text{C}$)**: $17.0\text{ hours}$ ($70.8\%$ of day)
- **Under-Comfort Hours ($< 18.0^\circ\text{C}$)**: $7.0\text{ hours}$ ($29.2\%$ of day, early morning dip)
- **Overheating Hours ($> 26.0^\circ\text{C}$)**: $0.0\text{ hours}$ ($0.0\%$)
- **Total Daily Heat Loss**: $17.84\text{ kWh/day}$
- **Total Daily Solar Gain Harvested**: $26.09\text{ kWh/day}$
- **Net Daily Thermal Balance**: $+8.25\text{ kWh/day}$
- **Diurnal Damping Factor**: $1 - \frac{23.4 - 16.4}{-1.5 - (-15.0)} = 1 - \frac{7.0}{13.5} = 0.481$ ($48.1\%$ swing reduction)
- **Thermal Lag**: $1.0\text{ hour}$ solar lag, $4.0\text{ hours}$ mass release delay
- **Thermal Autonomy Remaining (decay to $16^\circ\text{C}$ from $21.4^\circ\text{C}$)**: $18.5\text{ hours}$
- **Loss Breakdown**: Roof $28.5\%$, Walls $32.4\%$, Windows $19.8\%$, Floor $11.2\%$, Infiltration $8.1\%$

---

## 6. Detailed Domain Specifications for R4, R6, R7, and R8

### 6.1 R4: Shelter Designer & Materials Library

#### 1. Split Layout Specifications
- **Left Panel (40%)**: Live 3D Preview (simplified R3F scene). Updates reactively when geometry ($L, W, H$), orientation azimuth, or window placement changes.
- **Right Panel (60%)**: Tabbed parameter workspace:
  - Tab 1: **Geometry & Site** (Inputs for $L, W, H$, roof pitch, orientation compass rose)
  - Tab 2: **Envelope Assemblies** (Selector cards for Exterior Wall, Roof, and Floor with live calculated $R$-value and $U$-value badges + "Edit Assembly" button)
  - Tab 3: **Openings** (Window area slider, number of windows, overhang depth, door area)
  - Tab 4: **Thermal Storage & PCM** (Thermal mass selection, PCM toggle, melting temperature, latent heat capacity, placement)

#### 2. Wall-Layer Builder Drawer
- Visual vertical stack editor listing layers from **EXTERIOR (Top)** to **INTERIOR (Bottom)**.
- Each layer row displays:
  - Drag handle for reordering
  - Material Name & Category badge
  - Thickness input with numeric spinner (in millimeters or meters, converted to meters in store)
  - Computed layer thermal resistance ($R_i = d_i / k_i$)
  - "Change Material" button (opens Material Library picker)
  - "Delete Layer" action button
- Bottom summary bar displays real-time ISO 6946 calculations:
  - Surface air film resistances ($R_{si} + R_{se}$)
  - Total Assembly Resistance: $R_{\text{total}} = R_{si} + \sum R_i + R_{se}$
  - Overall Heat Transfer Coefficient: $U = 1 / R_{\text{total}}$

#### 3. Standard Material Library Catalog (14 Items)

| ID | Name | Category | $k$ (W/m·K) | $\rho$ (kg/m³) | $C_p$ (J/kg·K) | $\epsilon$ | $\alpha$ | Default Thick (m) |
|---|---|---|---|---|---|---|---|---|
| `mat-adobe` | Rammed Earth / Adobe Block | masonry | 0.750 | 1850 | 1000 | 0.90 | 0.70 | 0.300 |
| `mat-stone` | Granite / Dense Stone Masonry | masonry | 1.800 | 2400 | 880 | 0.92 | 0.65 | 0.350 |
| `mat-aac` | Autoclaved Aerated Concrete (AAC) | masonry | 0.160 | 550 | 1050 | 0.90 | 0.50 | 0.200 |
| `mat-concrete` | Heavyweight Reinforced Concrete | masonry | 1.740 | 2300 | 1000 | 0.90 | 0.65 | 0.150 |
| `mat-woodfiber` | High-Density Wood-Fiber Board | insulation | 0.038 | 160 | 2100 | 0.88 | 0.60 | 0.120 |
| `mat-rockwool` | Mineral Stone Wool Batt | insulation | 0.034 | 45 | 840 | 0.90 | 0.30 | 0.150 |
| `mat-aerogel` | Aerogel Silica Insulation Blanket | insulation | 0.015 | 150 | 1000 | 0.85 | 0.30 | 0.030 |
| `mat-eps` | Expanded Polystyrene (EPS) | insulation | 0.035 | 25 | 1450 | 0.90 | 0.30 | 0.100 |
| `mat-xps` | Extruded Polystyrene (XPS Board) | insulation | 0.029 | 35 | 1450 | 0.90 | 0.30 | 0.080 |
| `mat-strawbale`| Compressed Agricultural Strawbale| insulation | 0.055 | 110 | 1800 | 0.85 | 0.60 | 0.400 |
| `mat-timber` | Solid Softwood (Pine/Fir) | timber | 0.130 | 500 | 1600 | 0.85 | 0.60 | 0.045 |
| `mat-clayplaster`| Traditional Interior Clay Plaster| finish | 0.600 | 1600 | 950 | 0.90 | 0.55 | 0.015 |
| `mat-limeplaster`| Hydraulic Exterior Lime Render | finish | 0.800 | 1700 | 900 | 0.88 | 0.45 | 0.020 |
| `mat-pcm-bio21` | Bio-based Paraffin PCM Tile 21°C | phase-change | 0.210 | 860 | 2200 | 0.90 | 0.40 | 0.025 |

---

### 6.2 R6: Simulation Workspace & 5 Sub-Result Pages

#### 1. Setup (`/simulation/setup`)
- Duration: 24h (fixed design day)
- Timestep: 1 hour (25 points: 00:00 to 24:00)
- Comfort Band Inputs: $T_{\text{min}}$ ($18^\circ\text{C}$ default), $T_{\text{max}}$ ($26^\circ\text{C}$ default)
- Feature Toggles:
  - Thermal Mass Coupling (`boolean`)
  - PCM Latent Heat Charging (`boolean`)
  - Solar Irradiance Direct Gain (`boolean`)
  - High-Altitude Infiltration Correction (`boolean`)
- "Run Simulation" Primary CTA button

#### 2. Running State (`/simulation/running`)
- 8-stage sequence with animated completion ticks:
  1. Climate Profile (`Climate ✓`)
  2. Geometric Boundary Calculation (`Geometry ✓`)
  3. Envelope Assembly U-values (`Materials ✓`)
  4. Solar Vector & Glazing Incident Angles (`Solar model ✓`)
  5. Conductive & Infiltration Fluxes (`Heat transfer ✓`)
  6. Thermal Mass & PCM Enthalpy State (`Thermal storage ✓`)
  7. Transient Finite-Difference Solution (`Transient response ✓`)
  8. Comfort Band & Autonomy Analysis (`Comfort analysis ✓`)
- Prominent banner: **"MOCK DATA — Offline Mode: Ladakh 3,500m Winter Design Day"** if running client-side seed data.

#### 3. Main Results Dashboard (`/simulation/results`)
- **Top 5-Metric Strip**:
  - Indoor Temp ($21.4^\circ\text{C}$ current / $16.4^\circ\text{C} - 23.4^\circ\text{C}$ range)
  - Comfort Hours ($17.0\text{ h} / 24\text{ h}$)
  - Heat Loss ($17.84\text{ kWh/day}$)
  - Solar Gain ($26.09\text{ kWh/day}$)
  - Thermal Autonomy ($18.5\text{ hours}$)
- **24-Hour Thermal Response Chart**: Recharts line chart showing $T_{\text{indoor}}$ vs $T_{\text{outdoor}}$ with shaded green comfort band ($18 - 26^\circ\text{C}$) and time scrub cursor.
- **Embedded 3D Thermal Twin Panel**: 16:9 interactive viewport with scrubber and mode toggles.
- **Thermal State Timeline Bar**: Segmented horizontal pill bar colored by semantic states (Cold Blue: 01:00-08:00, Green: 09:00-24:00).
- **Component Heat Loss Breakdown**: Horizontal bar chart.

#### 4. Sub-Result Pages Deep-Dives
- `/simulation/temperature`: Indoor vs outdoor curves, diurnal swing damping calculation ($DF = 48.1\%$), thermal lag measurement ($4.0\text{h}$ delay), hourly temperature table.
- `/simulation/heat-flow`: Component-by-component conductive and infiltration flux profiles over 24h, peak heating demand load ($0.90\text{ kW}$ at 05:00).
- `/simulation/solar`: Direct beam vs diffuse solar flux, angle of incidence on South glazing, effective solar transmission, solar fraction ($70.8\%$).
- `/simulation/comfort`: Hourly comfort index, ASHRAE 55 psychrometric compliance, hours of undercooling ($7\text{h}$), zero overheating risk.
- `/simulation/thermal-state`: Discrete state timeline analysis, transition timestamps (drops below comfort at 00:45, re-enters comfort at 08:30).

---

### 6.3 R7: Comparison, Optimization, Recommendation & Resilience

#### 1. Compare Module (`/compare`)
- Side-by-side split screen between **Design A (Baseline)** and **Design B (Optimized / Alternative)**.
- Live parameter comparison table: Wall $U$-value, Roof $U$-value, Window Area, Mass Capacity, PCM presence.
- Stacked Delta Card:
  - $\Delta \text{ Comfort}$: $+4.5\text{ hours}$ (Improved)
  - $\Delta \text{ Heat Loss}$: $-5.2\text{ kWh/day}$ (Improved)
  - $\Delta \text{ Autonomy}$: $+6.2\text{ hours}$ (Improved)
- Overlaid dual Recharts line chart displaying Design A and Design B thermal curves simultaneously.

#### 2. Optimization Module (`/optimization`)
- Objective Function: Multi-choice selector (`Balance Comfort & Loss`, `Minimize Heat Loss`, `Maximize Autonomy`).
- Optimization Variables:
  - Insulation Thickness: $50\text{ mm}$ to $300\text{ mm}$
  - South Window Glazing Area: $2.0\text{ m}^2$ to $12.0\text{ m}^2$
  - Azimuth Orientation: $-30^\circ$ to $+30^\circ$
  - Overhang Depth: $0.2\text{ m}$ to $1.2\text{ m}$
- Constraints Table:
  - $T_{\text{indoor, min}} \ge 16.0^\circ\text{C}$
  - $T_{\text{indoor, max}} \le 27.0^\circ\text{C}$
  - Window Area $\le 40\%$ of South Facade
- Optimization Results Grid: Candidates evaluated ($N = 64$), Feasible configurations ($42$), Best candidate highlighted with full parameter values.

#### 3. Recommendation Module (`/recommendation`)
- Top Card: **Recommended Passive Solar Configuration**.
- Parameter Breakdown Table with before/after comparisons.
- **Key Engineering Drivers (Deterministic Physics Explanations — No LLM / No Fake Confidence)**:
  1. *Thermal Mass & Trombe Effect*: "A 300mm rammed earth South interior wall stores 26 kWh of daytime direct solar gain, delaying peak heat delivery by 4.2 hours into the coldest nighttime period (22:00 to 04:00)."
  2. *Super-Insulation Continuity*: "Increasing wall wood-fiber insulation from 100mm to 150mm drops wall U-value from 0.32 to 0.19 W/m²·K, reducing transmission loss by 3.4 kWh/day."
  3. *Overhang Geometry*: "A 0.6m eaves overhang permits 98% winter solar access while cutting summer noon solar penetration by 65%."

#### 4. Resilience Module (`/resilience`)
- **Key Resilience Metrics Strip**:
  - Thermal Autonomy: $18.5\text{ hours}$ (Decay from $21.4^\circ\text{C}$ to $16.0^\circ\text{C}$)
  - Freeze-Thaw Exposure: $142\text{ annual cycles}$ (Risk: High)
  - Wind Chill Factor: $-24.2^\circ\text{C}$ at $15\text{ m/s}$ gust
  - Sub-grade Frost Heaving Risk: Moderate
- **Autonomy Decay Interactive Plot**: Exponential decay curve showing building response to total heating loss during a $-15^\circ\text{C}$ cold wave.
- Sub-pages:
  - `/resilience/autonomy`: Deep decay modeling with variable outdoor cold-snap durations.
  - `/resilience/climate-risk`: Multi-hazard climate matrix for Ladakh cold arid zone.
  - `/resilience/degradation`: Long-term material durability (moisture accumulation, UV degradation of seals).
  - `/resilience/failure-intelligence`: Case study patterns.

#### 5. Failure Intelligence Pattern Database (`/resilience/failure-intelligence`)
Seeded with 5 authoritative engineering failure patterns:
1. **Pattern 1: Nighttime Thermosiphoning Reverse Flow**
   - *Issue*: Glazed Trombe wall cooling room air at night.
   - *Consequence*: Rapid indoor temperature drop ($> 3^\circ\text{C/h}$ loss).
   - *Risk*: CRITICAL.
   - *Mitigation*: Install passive lightweight backdraft dampers at top Trombe vents.
   - *Source*: Ladakh Passive Solar Field Studies (SECMOL / GERES).
2. **Pattern 2: Sub-Grade Frost Heaving in Cold Desert Foundation**
   - *Issue*: Moisture freezing beneath uninsulated perimeter slab foundation.
   - *Consequence*: Structural cracking and envelope air leakage.
   - *Risk*: HIGH.
   - *Mitigation*: Continuous perimeter vertical XPS insulation down to $1.2\text{ m}$ frost line.
   - *Source*: US Army Cold Regions Research and Engineering Laboratory (CRREL).
3. **Pattern 3: Interstitial Vapor Condensation in Thick Wall Assemblies**
   - *Issue*: Warm humid interior air infiltrating into cold outer insulation layers.
   - *Consequence*: Mold growth, wood-fiber decay, insulation R-value collapse by 45%.
   - *Risk*: HIGH.
   - *Mitigation*: Install continuous smart vapor retarder on warm interior side; breathable outer windtight membrane.
   - *Source*: ISO 13788 / ASHRAE Fundamentals Ch. 25.
4. **Pattern 4: PCM Thermal Saturation During High Solar Spikes**
   - *Issue*: PCM fully liquifies by 11:30 AM due to undersized heat exchange area.
   - *Consequence*: Afternoon room overheating ($> 28^\circ\text{C}$) with no additional latent storage capacity.
   - *Risk*: MEDIUM.
   - *Mitigation*: Increase PCM active surface area with aluminum conductive fins and optimize overhang angle.
   - *Source*: Solar Energy Journal, Vol 184 (Phase Change Materials in Buildings).
5. **Pattern 5: Severe Thermal Bridging at Wall-to-Roof Eaves Junction**
   - *Issue*: Discontinuous insulation where timber rafters penetrate exterior wall plate.
   - *Consequence*: Localized surface temperature drops to $4.2^\circ\text{C}$, triggering condensation.
   - *Risk*: MEDIUM.
   - *Mitigation*: Maintain continuous minimum 100mm exterior insulation wrap over top plate.
   - *Source*: ISO 10211 Thermal Bridges in Building Construction.

---

### 6.4 R8: Reports Generation (PDF & JSON)

#### 1. JSON Report Structure
The JSON export produces a validated snapshot combining metadata, configuration, simulation results, and audit trails:

```json
{
  "$schema": "https://trueshel.dev/schemas/v2/report.json",
  "exportTimestamp": "2026-09-27T04:20:00.000Z",
  "applicationVersion": "2.0.0",
  "project": {
    "id": "proj-ladakh-001",
    "name": "Leh Passive Solar Prototype V2",
    "author": "Thermal Engineering Team",
    "location": "Leh, Ladakh (3,500m AMSL)"
  },
  "climateSummary": {
    "location": "Leh, Ladakh",
    "minTemp": -15.0,
    "maxTemp": -1.5,
    "peakGHI": 820.0
  },
  "shelterSpecification": {
    "dimensions": { "length": 6.0, "width": 4.0, "height": 2.8 },
    "orientation": { "azimuth": 0 },
    "envelopeUValues": {
      "exteriorWall": 0.19,
      "roof": 0.13,
      "floor": 0.22,
      "southGlazing": 0.80
    }
  },
  "simulationResult": { /* Full 25-point SimulationResult object */ },
  "resilience": {
    "thermalAutonomyHours": 18.5,
    "criticalThresholdTemp": 16.0
  },
  "recommendations": [ /* Key driver array */ ],
  "validation": {
    "isValidated": true,
    "standardsCompliant": ["ISO 6946", "ASHRAE 55", "ISO 13788"]
  }
}
```

#### 2. PDF Engineering Report Content Layout
Client-side PDF generated using `@react-pdf/renderer` or `jsPDF` + HTML canvas layout:
1. **Header**: TRUESHEL V2 logo, Project Title, Date, Document ID, Engineering Integrity Stamp.
2. **Executive Summary**: Key performance indicators in a 5-column metric box (Comfort Hours, Daily Heat Loss, Solar Harvest, Net Balance, Autonomy).
3. **Site & Climate Context**: Geographic coordinates, altitude, design-day temperature profile, solar radiation curves.
4. **Shelter Architectural & Thermal Specification**:
   - Geometric dimensional table.
   - Layer-by-layer assembly breakdown with material conductivity ($k$), thickness ($d$), resistance ($R$), and assembly $U$-value.
5. **24-Hour Thermal Performance**:
   - High-resolution chart of indoor vs outdoor temperature against the 18–26°C comfort band.
   - Thermal state timeline bar.
   - Component heat loss breakdown percentage distribution table.
6. **Resilience & Autonomous Decay Audit**:
   - Power failure survival duration to $16^\circ\text{C}$ threshold ($18.5\text{ hours}$).
   - Freeze-thaw risk summary and frost penetration depth.
7. **Design Recommendations & Failure Intelligence**:
   - Physical rationale for parameter choices.
   - Authoritative failure mitigation patterns.
8. **Sign-off / Verification Block**: Signature line, date, calculation engine version stamp.

---

## 7. TanStack Query Integration & API Contracts

All asynchronous operations (backend simulation calls, material library fetching, project persistence) interface through TanStack Query wrappers with declarative query keys and Zod boundary validation.

```typescript
// Query Key Factory
export const queryKeys = {
  project: (id: string) => ["project", id] as const,
  materials: (filter?: string) => ["materials", filter] as const,
  climate: (location: string) => ["climate", location] as const,
  simulation: (shelterHash: string) => ["simulation", shelterHash] as const,
};

// API Boundary Validated Fetcher Pattern
export async function runSimulationApi(config: SimulationConfig, shelter: ShelterConfig): Promise<SimulationResult> {
  // Validate request payload prior to network dispatch
  const validatedPayload = {
    config: SimulationConfigSchema.parse(config),
    shelter: ShelterConfigSchema.parse(shelter),
  };

  // If live backend is unavailable, return validated MockRepository data
  if (process.env.NEXT_PUBLIC_ENABLE_LIVE_BACKEND !== "true") {
    return SimulationResultSchema.parse(MockRepository.getLadakhWinterSimulationResult());
  }

  const response = await fetch("/api/v1/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedPayload),
  });

  if (!response.ok) {
    throw new Error(`Simulation failed: ${response.statusText}`);
  }

  const json = await response.json();
  // Boundary validation on response
  return SimulationResultSchema.parse(json);
}
```

---

## Conclusion & Implementation Readiness

The state architecture, domain interfaces, Zod validation schemas, engineering physics equations, and Ladakh mock dataset specified in this report provide complete specification coverage for TRUESHEL V2 requirements R2, R4, R6, R7, and R8.

Downstream implementation tracks can directly consume:
1. TypeScript interfaces from Section 1 for `types/`
2. Zod schemas from Section 2 for `lib/validators/`
3. Zustand store contracts from Section 3 for `stores/`
4. Physics calculation equations from Section 4 for `lib/calculations/`
5. Seed dataset from Section 5 for `lib/mock/`
6. Feature workflows and views from Section 6 for `features/` and `app/(workspace)/`

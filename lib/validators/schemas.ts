/**
 * lib/validators/schemas.ts
 * Complete Zod schemas for all TRUESHEL V2 domain types.
 * Each schema mirrors its corresponding TypeScript interface exactly.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives / enums
// ---------------------------------------------------------------------------

export const ClimateZoneSchema = z.enum([
  'high-altitude-cold',
  'hot-arid',
  'tropical',
  'temperate',
  'cold-continental',
]);

export const WindExposureSchema = z.enum(['low', 'moderate', 'high', 'extreme']);
export const SolarExposureSchema = z.enum(['low', 'moderate', 'high', 'very-high']);

export const OrientationSchema = z.enum([
  'north',
  'south',
  'east',
  'west',
  'northeast',
  'northwest',
  'southeast',
  'southwest',
]);

export const RiskLevelSchema = z.enum(['low', 'moderate', 'high', 'critical']);

export const ThermalStateSchema = z.enum(['under-comfort', 'comfort', 'overheating']);
export const SimulationStatusSchema = z.enum(['idle', 'running', 'complete', 'error']);

// ---------------------------------------------------------------------------
// Climate
// ---------------------------------------------------------------------------

/** Validates an array of exactly 24 numeric values (one per hour of a day). */
const hourlyArray = z.array(z.number()).length(24);

export const ClimateDataSchema = z.object({
  location: z.string().min(1),
  region: z.string().min(1),
  zone: ClimateZoneSchema,
  /** Altitude in metres above sea level */
  altitude: z.number().min(0).max(9000),
  hourlyTemperature: hourlyArray,
  hourlySolarIrradiance: hourlyArray,
  hourlyWindSpeed: hourlyArray,
  hourlyHumidity: hourlyArray,
  dailyMinTemp: z.number(),
  dailyMaxTemp: z.number(),
  avgSolarIrradiance: z.number().min(0),
  windExposure: WindExposureSchema,
  solarExposure: SolarExposureSchema,
  freezeThawRisk: z.enum(['low', 'moderate', 'high']),
  designImplications: z.array(z.string()),
});

export type ClimateDataInput = z.input<typeof ClimateDataSchema>;

// ---------------------------------------------------------------------------
// Material
// ---------------------------------------------------------------------------

export const ThermalMaterialSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['insulation', 'structural', 'finish', 'composite', 'pcm']),
  /** W/m·K — must be strictly positive */
  thermalConductivity: z.number().positive(),
  /** kg/m³ */
  density: z.number().positive(),
  /** J/kg·K */
  specificHeat: z.number().positive(),
  /** 0–1 */
  emissivity: z.number().min(0).max(1),
  /** 0–1 */
  solarAbsorptivity: z.number().min(0).max(1),
  /** mm */
  defaultThickness: z.number().positive(),
});

export const WallLayerSchema = z.object({
  id: z.string().min(1),
  material: ThermalMaterialSchema,
  thickness: z.number().positive(),
  order: z.number().int().min(0),
});

export const WallAssemblySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  layers: z.array(WallLayerSchema).min(1),
  /** m²K/W */
  rValue: z.number().min(0),
  /** W/m²K */
  uValue: z.number().positive(),
});

export type ThermalMaterialInput = z.input<typeof ThermalMaterialSchema>;
export type WallAssemblyInput = z.input<typeof WallAssemblySchema>;

// ---------------------------------------------------------------------------
// Shelter
// ---------------------------------------------------------------------------

export const ThermalMassLevelSchema = z.enum(['low', 'medium', 'high']);
export const VentilationModeSchema = z.enum(['natural', 'controlled', 'mechanical', 'none']);

export const ShelterGeometrySchema = z.object({
  length: z.number().min(2).max(50),
  width: z.number().min(2).max(50),
  height: z.number().min(2).max(10),
  roofType: z.enum(['flat', 'gabled', 'shed']),
});

export const ShelterOpeningsSchema = z.object({
  windowArea: z.number().min(0),
  windowCount: z.number().int().min(0),
  doorCount: z.number().int().min(0),
  windowOrientation: OrientationSchema,
});

export const ThermalMassConfigSchema = z.object({
  level: ThermalMassLevelSchema,
  material: z.string().min(1),
  thickness: z.number().positive(),
});

export const PCMConfigSchema = z.object({
  enabled: z.boolean(),
  meltingPoint: z.number(),
  latentHeat: z.number().positive(),
  thickness: z.number().min(0),
  location: z.enum(['wall', 'ceiling', 'floor']),
});

export const ShelterEnvelopeSchema = z.object({
  wall: WallAssemblySchema,
  roof: WallAssemblySchema,
  floor: WallAssemblySchema,
});

export const ShelterDesignSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  geometry: ShelterGeometrySchema,
  orientation: OrientationSchema,
  envelope: ShelterEnvelopeSchema,
  openings: ShelterOpeningsSchema,
  thermalMass: ThermalMassConfigSchema,
  pcm: PCMConfigSchema,
  shadingEnabled: z.boolean(),
  ventilationMode: VentilationModeSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ShelterDesignInput = z.input<typeof ShelterDesignSchema>;

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

export const SimulationConfigurationSchema = z.object({
  durationHours: z.number().int().min(1).max(8760),
  timeStepHours: z.number().positive().max(1),
  comfortTempMin: z.number().min(-20).max(40),
  comfortTempMax: z.number().min(-20).max(60),
  useThermalMass: z.boolean(),
  usePCM: z.boolean(),
  useSolar: z.boolean(),
  useVentilation: z.boolean(),
}).refine(
  (d) => d.comfortTempMax > d.comfortTempMin,
  { message: 'comfortTempMax must be greater than comfortTempMin' },
);

export const HeatFlowBreakdownSchema = z.object({
  roof: z.number().min(0).max(100),
  walls: z.number().min(0).max(100),
  floor: z.number().min(0).max(100),
  windows: z.number().min(0).max(100),
  infiltration: z.number().min(0).max(100),
});

export const ComfortAnalysisSchema = z.object({
  comfortHours: z.number().min(0),
  underComfortHours: z.number().min(0),
  overheatingHours: z.number().min(0),
  comfortRatio: z.number().min(0).max(1),
});

export const SimulationResultSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  shelterDesignId: z.string().min(1),
  configuration: SimulationConfigurationSchema,
  timeline: z.array(z.number()).length(24),
  indoorTemperature: z.array(z.number()).length(24),
  outdoorTemperature: z.array(z.number()).length(24),
  solarIrradiance: z.array(z.number()).length(24),
  heatGain: z.array(z.number()).length(24),
  heatLoss: z.array(z.number()).length(24),
  storage: z.array(z.number()).length(24),
  comfort: ComfortAnalysisSchema,
  thermalStates: z.array(ThermalStateSchema).length(24),
  heatFlowBreakdown: HeatFlowBreakdownSchema,
  peakHeatLoss: z.number().min(0),
  peakSolarGain: z.number().min(0),
  autonomy: z.number().min(0).max(24),
  risk: RiskLevelSchema,
  completedAt: z.string().datetime(),
});

export const SimulationStateSchema = z.object({
  status: SimulationStatusSchema,
  configuration: SimulationConfigurationSchema,
  result: SimulationResultSchema.nullable(),
  progress: z.number().int().min(0).max(100),
  currentStep: z.string().nullable(),
  error: z.string().nullable(),
});

export type SimulationResultInput = z.input<typeof SimulationResultSchema>;
export type SimulationStateInput = z.input<typeof SimulationStateSchema>;

// ---------------------------------------------------------------------------
// Recommendation
// ---------------------------------------------------------------------------

export const PerformanceMetricsSchema = z.object({
  comfortHours: z.number().min(0),
  heatLoss: z.number().min(0),
  autonomy: z.number().min(0),
  overheatingHours: z.number().min(0),
  solarGain: z.number().min(0),
});

export const DesignDriverSchema = z.object({
  parameter: z.string().min(1),
  impact: z.enum(['positive', 'negative']),
  explanation: z.string().min(1),
});

export const RecommendationSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  recommendedDesign: ShelterDesignSchema,
  performance: PerformanceMetricsSchema,
  drivers: z.array(DesignDriverSchema),
  comparedToBaseline: z.object({
    comfortHoursDelta: z.number(),
    heatLossDelta: z.number(),
    autonomyDelta: z.number(),
  }),
  generatedAt: z.string().datetime(),
});

export type RecommendationInput = z.input<typeof RecommendationSchema>;

// ---------------------------------------------------------------------------
// Resilience
// ---------------------------------------------------------------------------

export const FailurePatternSchema = z.object({
  id: z.string().min(1),
  issue: z.string().min(1),
  climate: z.string().min(1),
  observedPattern: z.string().min(1),
  potentialConsequence: z.string().min(1),
  risk: RiskLevelSchema,
  mitigations: z.array(z.string().min(1)).min(1),
  source: z.string().min(1),
});

export const ResilienceAssessmentSchema = z.object({
  thermalAutonomy: z.number().min(0),
  climateExposure: RiskLevelSchema,
  freezeThawRisk: RiskLevelSchema,
  windExposure: RiskLevelSchema,
  solarExposure: RiskLevelSchema,
  materialRisk: RiskLevelSchema,
  overallRisk: RiskLevelSchema,
  failurePatterns: z.array(FailurePatternSchema),
  autonomyDiagram: z.object({
    failureHour: z.number().min(0).max(24),
    decayRate: z.number(),
    thresholdTemp: z.number(),
    autonomyHours: z.number().min(0),
  }),
});

export type ResilienceAssessmentInput = z.input<typeof ResilienceAssessmentSchema>;

// ---------------------------------------------------------------------------
// Top-level project schemas
// ---------------------------------------------------------------------------

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ProjectStateSchema = z.object({
  project: ProjectSchema,
  climate: ClimateDataSchema,
  shelter: ShelterDesignSchema,
  simulation: SimulationStateSchema,
  comparison: z.object({
    designA: ShelterDesignSchema.nullable(),
    designB: ShelterDesignSchema.nullable(),
    resultA: SimulationResultSchema.nullable(),
    resultB: SimulationResultSchema.nullable(),
  }),
  optimization: z.object({
    status: z.enum(['idle', 'running', 'complete']),
    objective: z.string(),
    variables: z.array(z.string()),
    constraints: z.record(z.string(), z.number()),
    result: ShelterDesignSchema.nullable(),
    candidatesEvaluated: z.number().int().min(0),
    feasibleDesigns: z.number().int().min(0),
  }),
  recommendation: RecommendationSchema.nullable(),
  resilience: ResilienceAssessmentSchema.nullable(),
  thermalTwin: z.object({
    activeTimestep: z.number().int().min(0).max(23),
    mode: z.enum(['normal', 'thermal', 'heat-flow', 'solar', 'storage']),
    isPlaying: z.boolean(),
    selectedComponent: z.string().nullable(),
  }),
});

export type ProjectInput = z.input<typeof ProjectSchema>;
export type ProjectStateInput = z.input<typeof ProjectStateSchema>;

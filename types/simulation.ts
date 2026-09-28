/**
 * Simulation state and result types for TRUESHEL V2.
 * All time-series arrays have one entry per hour of the simulation timeline.
 */

export type ThermalState = 'under-comfort' | 'comfort' | 'overheating';
export type SimulationStatus = 'idle' | 'running' | 'complete' | 'error';

export interface SimulationConfiguration {
  /** Total simulation duration in hours */
  durationHours: number;
  /** Time-step granularity in hours (e.g. 1 = hourly) */
  timeStepHours: number;
  /** Lower comfort band in °C */
  comfortTempMin: number;
  /** Upper comfort band in °C */
  comfortTempMax: number;
  useThermalMass: boolean;
  usePCM: boolean;
  useSolar: boolean;
  useVentilation: boolean;
}

export interface HeatFlowBreakdown {
  /** Percentage of total heat flow through roof */
  roof: number;
  /** Percentage of total heat flow through walls */
  walls: number;
  /** Percentage of total heat flow through floor */
  floor: number;
  /** Percentage of total heat flow through windows */
  windows: number;
  /** Percentage of total heat flow through air infiltration */
  infiltration: number;
}

export interface ComfortAnalysis {
  /** Number of hours within comfort band */
  comfortHours: number;
  /** Number of hours below comfort minimum */
  underComfortHours: number;
  /** Number of hours above comfort maximum */
  overheatingHours: number;
  /** comfortHours / totalHours, range 0–1 */
  comfortRatio: number;
}

export interface SimulationResult {
  id: string;
  projectId: string;
  shelterDesignId: string;
  configuration: SimulationConfiguration;
  /** Hour indices 0–23 (or 0–durationHours-1) */
  timeline: number[];
  /** Indoor air temperature in °C per time step */
  indoorTemperature: number[];
  /** Outdoor dry-bulb temperature in °C per time step */
  outdoorTemperature: number[];
  /** Global horizontal irradiance in W/m² per time step */
  solarIrradiance: number[];
  /** Net heat gain into the shelter in kW per time step */
  heatGain: number[];
  /** Net heat loss from the shelter in kW per time step */
  heatLoss: number[];
  /** Thermal energy stored (mass + PCM) in kWh per time step */
  storage: number[];
  comfort: ComfortAnalysis;
  /** Thermal state classification per time step */
  thermalStates: ThermalState[];
  heatFlowBreakdown: HeatFlowBreakdown;
  /** Peak instantaneous heat loss in kW */
  peakHeatLoss: number;
  /** Peak instantaneous solar gain in kW */
  peakSolarGain: number;
  /** Hours of passive thermal autonomy before interior drops below comfort min */
  autonomy: number;
  risk: 'low' | 'moderate' | 'high' | 'critical';
  completedAt: string;
}

export interface SimulationState {
  status: SimulationStatus;
  configuration: SimulationConfiguration;
  result: SimulationResult | null;
  /** Overall simulation progress as integer 0–100 */
  progress: number;
  /** Human-readable label for the current processing step */
  currentStep: string | null;
  error: string | null;
}

/**
 * MockRepository — TRUESHEL V2
 * Realistic Ladakh high-altitude cold-climate seed data.
 * Ladakh, India: ~3500 m ASL, cold desert, high solar irradiance.
 *
 * All types conform to @/types (types/index.ts).
 */

import type {
  ClimateData,
  SimulationResult,
  ShelterDesign,
  ThermalMaterial,
  WallLayer,
  WallAssembly,
  ShelterEnvelope,
  Project,
  ProjectState,
  SimulationState,
} from '@/types';

// ---------------------------------------------------------------------------
// Climate Data — Leh, Ladakh (winter profile)
// ---------------------------------------------------------------------------

export const LADAKH_CLIMATE: ClimateData = {
  location: 'Leh, Ladakh',
  region: 'Jammu & Kashmir, India',
  zone: 'high-altitude-cold',
  altitude: 3500,
  // 24-hour winter temperature profile: -8°C at midnight, peaks ~6°C at 11:00–12:00, drops back
  hourlyTemperature: [
    -8, -9, -10, -11, -12, -11, -8, -4, 0, 3, 5, 6,
    6, 5, 4, 2, -1, -4, -6, -7, -8, -8, -8, -8,
  ],
  // Solar: 0 at night, peaks ~620 W/m² at noon (clear high-altitude sky)
  hourlySolarIrradiance: [
    0, 0, 0, 0, 0, 0, 50, 180, 380, 520, 600, 620,
    610, 560, 460, 320, 160, 40, 0, 0, 0, 0, 0, 0,
  ],
  // Wind: moderate katabatic patterns, slightly stronger in afternoon
  hourlyWindSpeed: [
    5, 5, 5, 6, 6, 7, 7, 7, 6, 6, 6, 7,
    7, 7, 7, 8, 8, 7, 6, 6, 5, 5, 5, 5,
  ],
  // Low humidity — cold desert, peaks slightly near dawn
  hourlyHumidity: [
    35, 35, 36, 36, 37, 37, 36, 34, 32, 30, 29, 28,
    28, 29, 30, 31, 33, 34, 35, 35, 35, 35, 35, 35,
  ],
  dailyMinTemp: -12,
  dailyMaxTemp: 6,
  avgSolarIrradiance: 620,
  windExposure: 'high',
  solarExposure: 'very-high',
  freezeThawRisk: 'high',
  designImplications: [
    'Maximise thermal retention through high insulation values',
    'Capture daytime solar gain through south-facing glazing',
    'Control envelope heat losses — especially nocturnal',
    'Manage openings carefully to balance solar gain vs. heat loss',
    'Use thermal mass to buffer daytime solar gains into night',
  ],
};

export const ALPINE_CLIMATE: ClimateData = {
  location: 'Zermatt, Alps',
  region: 'Switzerland',
  zone: 'cold-continental',
  altitude: 1620,
  hourlyTemperature: [
    -5, -6, -7, -8, -8, -7, -5, -2, 1, 3, 4, 5,
    5, 4, 3, 1, -1, -3, -4, -4, -5, -5, -5, -5,
  ],
  hourlySolarIrradiance: [
    0, 0, 0, 0, 0, 0, 30, 120, 280, 420, 500, 540,
    520, 460, 360, 220, 100, 20, 0, 0, 0, 0, 0, 0,
  ],
  hourlyWindSpeed: [
    3, 3, 4, 4, 5, 5, 6, 6, 5, 5, 5, 6,
    6, 6, 5, 5, 4, 4, 3, 3, 3, 3, 3, 3,
  ],
  hourlyHumidity: [
    55, 56, 57, 58, 58, 57, 55, 52, 48, 45, 43, 42,
    42, 44, 46, 48, 50, 52, 54, 55, 55, 55, 55, 55,
  ],
  dailyMinTemp: -8,
  dailyMaxTemp: 5,
  avgSolarIrradiance: 540,
  windExposure: 'moderate',
  solarExposure: 'moderate',
  freezeThawRisk: 'high',
  designImplications: [
    'Heavy snow load requires steep gabled roof',
    'Moderate solar: balanced glazing ratio',
    'High freeze-thaw: robust envelope insulation',
    'Wind exposure: compact plan reduces losses',
  ],
};

export const ARCTIC_CLIMATE: ClimateData = {
  location: 'Longyearbyen, Svalbard',
  region: 'Norway',
  zone: 'cold-continental',
  altitude: 10,
  hourlyTemperature: [
    -15, -16, -17, -18, -18, -17, -15, -12, -8, -5, -3, -2,
    -2, -3, -5, -8, -10, -12, -13, -14, -14, -15, -15, -15,
  ],
  hourlySolarIrradiance: [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 150, 250, 300,
    280, 200, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  hourlyWindSpeed: [
    8, 8, 9, 9, 10, 10, 11, 11, 10, 10, 10, 11,
    11, 11, 10, 10, 9, 9, 8, 8, 8, 8, 8, 8,
  ],
  hourlyHumidity: [
    70, 71, 72, 73, 73, 72, 70, 68, 65, 62, 60, 58,
    58, 60, 62, 65, 68, 70, 72, 73, 73, 73, 73, 73,
  ],
  dailyMinTemp: -18,
  dailyMaxTemp: -2,
  avgSolarIrradiance: 300,
  windExposure: 'extreme',
  solarExposure: 'low',
  freezeThawRisk: 'moderate',
  designImplications: [
    'Extreme wind: low compact form essential',
    'Minimal solar: small well-insulated windows',
    'Extreme cold: maximum insulation thickness',
    'Low ceiling height reduces volume to heat',
  ],
};

export const DESERT_CLIMATE: ClimateData = {
  location: 'Phoenix, Arizona',
  region: 'USA',
  zone: 'hot-arid',
  altitude: 331,
  hourlyTemperature: [
    8, 7, 6, 5, 5, 5, 6, 8, 12, 16, 20, 24,
    27, 29, 30, 30, 28, 25, 21, 17, 14, 12, 10, 9,
  ],
  hourlySolarIrradiance: [
    0, 0, 0, 0, 0, 0, 100, 300, 550, 750, 900, 1000,
    1020, 980, 880, 720, 500, 250, 50, 0, 0, 0, 0, 0,
  ],
  hourlyWindSpeed: [
    2, 2, 3, 3, 4, 4, 5, 5, 4, 4, 4, 5,
    5, 5, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2,
  ],
  hourlyHumidity: [
    45, 46, 48, 50, 50, 48, 45, 40, 35, 30, 25, 20,
    18, 15, 15, 18, 22, 28, 35, 40, 42, 44, 45, 45,
  ],
  dailyMinTemp: 5,
  dailyMaxTemp: 30,
  avgSolarIrradiance: 1020,
  windExposure: 'low',
  solarExposure: 'very-high',
  freezeThawRisk: 'low',
  designImplications: [
    'Extreme solar: shading devices essential',
    'High thermal mass to buffer diurnal swing',
    'Small windows to reduce heat gain',
    'Light-colored exterior to reflect radiation',
  ],
};

export const TROPICAL_CLIMATE: ClimateData = {
  location: 'Mumbai, India',
  region: 'India',
  zone: 'tropical',
  altitude: 14,
  hourlyTemperature: [
    24, 23, 23, 22, 22, 23, 24, 26, 28, 30, 31, 32,
    33, 33, 32, 31, 30, 29, 28, 27, 26, 25, 25, 24,
  ],
  hourlySolarIrradiance: [
    0, 0, 0, 0, 0, 0, 50, 200, 450, 650, 800, 900,
    920, 880, 780, 620, 400, 180, 30, 0, 0, 0, 0, 0,
  ],
  hourlyWindSpeed: [
    3, 3, 4, 4, 5, 5, 6, 7, 8, 8, 7, 7,
    6, 6, 5, 5, 4, 4, 3, 3, 3, 3, 3, 3,
  ],
  hourlyHumidity: [
    75, 76, 78, 80, 80, 78, 75, 70, 65, 60, 55, 50,
    48, 50, 55, 60, 65, 70, 72, 74, 75, 75, 75, 75,
  ],
  dailyMinTemp: 22,
  dailyMaxTemp: 33,
  avgSolarIrradiance: 920,
  windExposure: 'moderate',
  solarExposure: 'very-high',
  freezeThawRisk: 'low',
  designImplications: [
    'High humidity: ventilation critical',
    'Solar shading prevents overheating',
    'Lightweight construction with low thermal mass',
    'Large openings for cross-ventilation',
  ],
};

export const TEMPERATE_CLIMATE: ClimateData = {
  location: 'Barcelona, Spain',
  region: 'Spain',
  zone: 'temperate',
  altitude: 12,
  hourlyTemperature: [
    8, 7, 7, 6, 6, 7, 8, 10, 13, 16, 18, 20,
    21, 22, 21, 20, 18, 16, 14, 12, 11, 10, 9, 8,
  ],
  hourlySolarIrradiance: [
    0, 0, 0, 0, 0, 0, 30, 150, 350, 520, 650, 720,
    700, 620, 500, 350, 180, 50, 0, 0, 0, 0, 0, 0,
  ],
  hourlyWindSpeed: [
    4, 4, 5, 5, 6, 6, 7, 7, 6, 6, 6, 7,
    7, 7, 6, 6, 5, 5, 4, 4, 4, 4, 4, 4,
  ],
  hourlyHumidity: [
    60, 62, 64, 65, 65, 63, 60, 56, 52, 48, 45, 42,
    40, 42, 45, 48, 52, 56, 58, 60, 60, 60, 60, 60,
  ],
  dailyMinTemp: 6,
  dailyMaxTemp: 22,
  avgSolarIrradiance: 720,
  windExposure: 'moderate',
  solarExposure: 'high',
  freezeThawRisk: 'low',
  designImplications: [
    'Mild climate: moderate insulation sufficient',
    'South glazing for winter solar gain',
    'Shading for summer overheating prevention',
    'Natural ventilation for shoulder seasons',
  ],
};

export const CLIMATE_ZONES = {
  'high-altitude-cold': LADAKH_CLIMATE,
  'cold-continental': ALPINE_CLIMATE,
  'hot-arid': DESERT_CLIMATE,
  tropical: TROPICAL_CLIMATE,
  temperate: TEMPERATE_CLIMATE,
};

// ---------------------------------------------------------------------------
// Material Library — 10 materials conforming to ThermalMaterial
// ---------------------------------------------------------------------------

export const MATERIAL_LIBRARY: ThermalMaterial[] = [
  {
    id: 'mat-concrete',
    name: 'Dense Concrete',
    category: 'structural',
    thermalConductivity: 1.75,
    density: 2300,
    specificHeat: 880,
    solarAbsorptivity: 0.72,
    emissivity: 0.90,
    defaultThickness: 150,
  },
  {
    id: 'mat-eps',
    name: 'EPS Rigid Insulation',
    category: 'insulation',
    thermalConductivity: 0.036,
    density: 20,
    specificHeat: 1450,
    solarAbsorptivity: 0.20,
    emissivity: 0.85,
    defaultThickness: 100,
  },
  {
    id: 'mat-rockwool',
    name: 'Rock Wool Batt',
    category: 'insulation',
    thermalConductivity: 0.040,
    density: 60,
    specificHeat: 840,
    solarAbsorptivity: 0.25,
    emissivity: 0.88,
    defaultThickness: 100,
  },
  {
    id: 'mat-pcm-paraffin',
    name: 'Paraffin PCM (21°C)',
    category: 'pcm',
    thermalConductivity: 0.20,
    density: 860,
    specificHeat: 2000,
    solarAbsorptivity: 0.40,
    emissivity: 0.85,
    defaultThickness: 25,
  },
  {
    id: 'mat-timber',
    name: 'Structural Timber',
    category: 'structural',
    thermalConductivity: 0.13,
    density: 500,
    specificHeat: 1600,
    solarAbsorptivity: 0.60,
    emissivity: 0.88,
    defaultThickness: 100,
  },
  {
    id: 'mat-rammed-earth',
    name: 'Rammed Earth',
    category: 'structural',
    thermalConductivity: 1.10,
    density: 2000,
    specificHeat: 1000,
    solarAbsorptivity: 0.68,
    emissivity: 0.92,
    defaultThickness: 200,
  },
  {
    id: 'mat-stone',
    name: 'Local Granite Stone',
    category: 'structural',
    thermalConductivity: 2.80,
    density: 2650,
    specificHeat: 790,
    solarAbsorptivity: 0.75,
    emissivity: 0.89,
    defaultThickness: 200,
  },
  {
    id: 'mat-lime-plaster',
    name: 'Lime Plaster',
    category: 'finish',
    thermalConductivity: 0.80,
    density: 1600,
    specificHeat: 1000,
    solarAbsorptivity: 0.45,
    emissivity: 0.90,
    defaultThickness: 15,
  },
  {
    id: 'mat-composite-panel',
    name: 'SIP Composite Panel',
    category: 'composite',
    thermalConductivity: 0.028,
    density: 115,
    specificHeat: 1300,
    solarAbsorptivity: 0.30,
    emissivity: 0.88,
    defaultThickness: 150,
  },
  {
    id: 'mat-membrane',
    name: 'Waterproof Membrane',
    category: 'finish',
    thermalConductivity: 0.19,
    density: 1200,
    specificHeat: 1800,
    solarAbsorptivity: 0.85,
    emissivity: 0.92,
    defaultThickness: 5,
  },
];

/** Lookup helper — throws if the material ID is not in the library. */
function getMaterial(id: string): ThermalMaterial {
  const mat = MATERIAL_LIBRARY.find((m) => m.id === id);
  if (!mat) throw new Error(`Material not found: ${id}`);
  return mat;
}

// ---------------------------------------------------------------------------
// Helper — build a WallLayer from a material ID and thickness
// ---------------------------------------------------------------------------

function makeLayer(materialId: string, thicknessMm: number, order: number): WallLayer {
  const material = getMaterial(materialId);
  return {
    id: `layer-${materialId}-${thicknessMm}-${order}`,
    material,
    thickness: thicknessMm,
    order,
  };
}

/** Compute R-value (m²K/W) from a set of layers (surface resistances excluded). */
function computeRValue(layers: WallLayer[]): number {
  return layers.reduce(
    (sum, l) => sum + (l.thickness / 1000) / l.material.thermalConductivity,
    0,
  );
}

/** Build a WallAssembly from ordered material/thickness pairs. */
function buildAssembly(
  id: string,
  name: string,
  specs: Array<{ matId: string; thicknessMm: number }>,
): WallAssembly {
  const layers = specs.map((s, i) => makeLayer(s.matId, s.thicknessMm, i));
  const rValue = computeRValue(layers);
  const uValue = 1 / rValue;
  return { id, name, layers, rValue, uValue };
}

// ---------------------------------------------------------------------------
// Default Envelope assemblies
// ---------------------------------------------------------------------------

const wallAssembly: WallAssembly = buildAssembly('asm-wall-001', 'Insulated Rammed-Earth Wall', [
  { matId: 'mat-lime-plaster', thicknessMm: 15 },   // Interior finish
  { matId: 'mat-rammed-earth', thicknessMm: 200 },  // High-mass inner leaf
  { matId: 'mat-eps', thicknessMm: 100 },           // Primary insulation
  { matId: 'mat-lime-plaster', thicknessMm: 20 },   // Exterior render
]);

const roofAssembly: WallAssembly = buildAssembly('asm-roof-001', 'Insulated Concrete Flat Roof', [
  { matId: 'mat-lime-plaster', thicknessMm: 10 },
  { matId: 'mat-concrete', thicknessMm: 150 },
  { matId: 'mat-eps', thicknessMm: 120 },
  { matId: 'mat-membrane', thicknessMm: 5 },
]);

const floorAssembly: WallAssembly = buildAssembly('asm-floor-001', 'Insulated Concrete Floor Slab', [
  { matId: 'mat-lime-plaster', thicknessMm: 15 },
  { matId: 'mat-concrete', thicknessMm: 100 },
  { matId: 'mat-eps', thicknessMm: 80 },
]);

const defaultEnvelope: ShelterEnvelope = {
  wall: wallAssembly,
  roof: roofAssembly,
  floor: floorAssembly,
};

// ---------------------------------------------------------------------------
// Default Shelter Design — 6 m × 4 m × 3 m, south-facing
// ---------------------------------------------------------------------------

export const DEFAULT_SHELTER_DESIGN: ShelterDesign = {
  id: 'shelter-001',
  name: 'Ladakh Passive Shelter — Type A',
  geometry: {
    length: 6,
    width: 4,
    height: 3,
    roofType: 'flat',
  },
  orientation: 'south',
  envelope: defaultEnvelope,
  openings: {
    windowArea: 6.6,   // m² total (south main 4.8 + south vent 0.6 + east 0.9 + north 0.3)
    windowCount: 4,
    doorCount: 1,
    windowOrientation: 'south',
  },
  thermalMass: {
    level: 'high',
    material: 'mat-rammed-earth',
    thickness: 200,
  },
  pcm: {
    enabled: true,
    meltingPoint: 21,
    latentHeat: 200,
    thickness: 25,
    location: 'wall',
  },
  shadingEnabled: false,
  ventilationMode: 'controlled',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Default Project
// ---------------------------------------------------------------------------

export const DEFAULT_PROJECT: Project = {
  id: 'proj-001',
  name: 'Leh Winter Housing Study',
  description:
    'Passive shelter performance study for high-altitude cold climate in Leh, Ladakh. ' +
    'Evaluating thermal autonomy, comfort hours, and heat loss pathways.',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Simulation Result — realistic 24-hour Ladakh passive shelter run
// ---------------------------------------------------------------------------

export const LADAKH_SIMULATION_RESULT: SimulationResult = {
  id: 'sim-ladakh-001',
  projectId: 'proj-001',
  shelterDesignId: 'shelter-001',
  configuration: {
    durationHours: 24,
    timeStepHours: 1,
    comfortTempMin: 18,
    comfortTempMax: 26,
    useThermalMass: true,
    usePCM: true,
    useSolar: true,
    useVentilation: true,
  },
  timeline: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  // Indoor follows outdoor with ~4 h thermal lag and significantly damped amplitude
  indoorTemperature: [
    14.2, 13.8, 13.4, 13.1, 12.9, 12.8, 13.2, 14.1,
    15.8, 17.4, 19.2, 20.8, 21.9, 22.4, 22.1, 21.3,
    20.1, 18.9, 17.8, 16.9, 16.1, 15.5, 15.0, 14.6,
  ],
  outdoorTemperature: [
    -8, -9, -10, -11, -12, -11, -8, -4,
    0, 3, 5, 6, 6, 5, 4, 2,
    -1, -4, -6, -7, -8, -8, -8, -8,
  ],
  solarIrradiance: [
    0, 0, 0, 0, 0, 0, 50, 180,
    380, 520, 600, 620, 610, 560, 460, 320,
    160, 40, 0, 0, 0, 0, 0, 0,
  ],
  // kW net heat gain (solar through glazing, accounting for SHGC and area)
  heatGain: [
    0, 0, 0, 0, 0, 0, 0.4, 1.2,
    2.1, 2.8, 3.2, 3.4, 3.4, 3.1, 2.6, 1.8,
    0.9, 0.2, 0, 0, 0, 0, 0, 0,
  ],
  // kW conducted/convected heat loss through envelope
  heatLoss: [
    3.8, 3.9, 4.0, 4.0, 4.1, 4.0, 3.8, 3.5,
    3.2, 2.9, 2.7, 2.6, 2.6, 2.7, 2.8, 3.0,
    3.3, 3.5, 3.7, 3.8, 3.9, 3.9, 3.8, 3.8,
  ],
  // kWh stored (+) or released (-) by thermal mass + PCM
  storage: [
    0.2, 0.1, 0.0, 0.0, 0.0, 0.0, 0.1, 0.3,
    0.6, 0.9, 1.1, 1.2, 1.2, 1.1, 0.9, 0.7,
    0.4, 0.2, 0.1, 0.0, 0.0, 0.0, 0.0, 0.1,
  ],
  thermalStates: [
    'under-comfort', 'under-comfort', 'under-comfort', 'under-comfort',
    'under-comfort', 'under-comfort', 'under-comfort', 'under-comfort',
    'under-comfort', 'comfort', 'comfort', 'comfort',
    'comfort', 'comfort', 'comfort', 'comfort',
    'comfort', 'comfort', 'comfort', 'under-comfort',
    'under-comfort', 'under-comfort', 'under-comfort', 'under-comfort',
  ],
  comfort: {
    comfortHours: 10,
    underComfortHours: 14,
    overheatingHours: 0,
    comfortRatio: 0.417,
  },
  heatFlowBreakdown: {
    roof: 41,
    walls: 32,
    floor: 11,
    windows: 9,
    infiltration: 7,
  },
  peakHeatLoss: 4.1,
  peakSolarGain: 3.42,
  autonomy: 11.2,
  risk: 'moderate',
  completedAt: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Default simulation state (idle, no error)
// ---------------------------------------------------------------------------

const DEFAULT_SIMULATION_STATE: SimulationState = {
  status: 'idle',
  configuration: {
    durationHours: 24,
    timeStepHours: 1,
    comfortTempMin: 18,
    comfortTempMax: 26,
    useThermalMass: true,
    usePCM: true,
    useSolar: true,
    useVentilation: true,
  },
  result: null,
  progress: 0,
  currentStep: null,
  error: null,
};

// ---------------------------------------------------------------------------
// Exported accessor
// ---------------------------------------------------------------------------

export function getMockProjectState(): ProjectState {
  return {
    project: DEFAULT_PROJECT,
    climate: LADAKH_CLIMATE,
    shelter: DEFAULT_SHELTER_DESIGN,
    simulation: DEFAULT_SIMULATION_STATE,
    comparison: {
      designA: null,
      designB: null,
      resultA: null,
      resultB: null,
    },
    optimization: {
      status: 'idle',
      objective: 'maximize-comfort',
      variables: ['insulation-thickness', 'window-area', 'thermal-mass'],
      constraints: { maxUValue: 0.35, minAutonomy: 8 },
      result: null,
      candidatesEvaluated: 0,
      feasibleDesigns: 0,
    },
    recommendation: null,
    resilience: null,
    thermalTwin: {
      activeTimestep: 0,
      mode: 'normal',
      isPlaying: false,
      selectedComponent: null,
    },
  };
}

import type { ClimateData, ClimateZone } from '@/types';

export interface ClimateAdaptation {
  geometry: {
    length: number;
    width: number;
    height: number;
    roofType: 'flat' | 'gabled' | 'shed';
  };
  envelope: {
    wallThickness: number;
    roofThickness: number;
    floorThickness: number;
  };
  openings: {
    windowToWallRatio: number;
    windowOrientation: 'north' | 'south' | 'east' | 'west';
    windowCount: number;
  };
  shading: {
    enabled: boolean;
    overhangDepth: number;
  };
  thermalMass: {
    level: 'low' | 'medium' | 'high';
  };
  rationale: string[];
}

const ZONE_DEFAULTS: Record<ClimateZone, Omit<ClimateAdaptation, 'rationale'>> = {
  'high-altitude-cold': {
    geometry: { length: 6, width: 4, height: 2.8, roofType: 'gabled' },
    envelope: { wallThickness: 0.35, roofThickness: 0.3, floorThickness: 0.25 },
    openings: { windowToWallRatio: 0.35, windowOrientation: 'south', windowCount: 4 },
    shading: { enabled: false, overhangDepth: 0 },
    thermalMass: { level: 'high' },
  },
  'hot-arid': {
    geometry: { length: 7, width: 5, height: 3.2, roofType: 'flat' },
    envelope: { wallThickness: 0.25, roofThickness: 0.2, floorThickness: 0.2 },
    openings: { windowToWallRatio: 0.2, windowOrientation: 'north', windowCount: 2 },
    shading: { enabled: true, overhangDepth: 0.8 },
    thermalMass: { level: 'high' },
  },
  tropical: {
    geometry: { length: 8, width: 6, height: 3.5, roofType: 'shed' },
    envelope: { wallThickness: 0.15, roofThickness: 0.15, floorThickness: 0.15 },
    openings: { windowToWallRatio: 0.45, windowOrientation: 'east', windowCount: 6 },
    shading: { enabled: true, overhangDepth: 1.2 },
    thermalMass: { level: 'low' },
  },
  temperate: {
    geometry: { length: 6, width: 4, height: 3, roofType: 'gabled' },
    envelope: { wallThickness: 0.2, roofThickness: 0.2, floorThickness: 0.15 },
    openings: { windowToWallRatio: 0.3, windowOrientation: 'south', windowCount: 3 },
    shading: { enabled: true, overhangDepth: 0.5 },
    thermalMass: { level: 'medium' },
  },
  'cold-continental': {
    geometry: { length: 5.5, width: 3.5, height: 2.6, roofType: 'gabled' },
    envelope: { wallThickness: 0.4, roofThickness: 0.35, floorThickness: 0.3 },
    openings: { windowToWallRatio: 0.25, windowOrientation: 'south', windowCount: 3 },
    shading: { enabled: false, overhangDepth: 0 },
    thermalMass: { level: 'high' },
  },
};

export function deriveGeometryFromClimate(climate: ClimateData): ClimateAdaptation {
  const base = ZONE_DEFAULTS[climate.zone] ?? ZONE_DEFAULTS['high-altitude-cold'];
  const rationale: string[] = [];

  const geometry = { ...base.geometry };
  const envelope = { ...base.envelope };
  const openings = { ...base.openings };
  const shading = { ...base.shading };
  const thermalMass = { ...base.thermalMass };

  if (climate.solarExposure === 'very-high') {
    openings.windowToWallRatio = Math.min(openings.windowToWallRatio + 0.1, 0.5);
    openings.windowOrientation = 'south';
    rationale.push('Very high solar exposure: increased south glazing for passive solar gain');
  } else if (climate.solarExposure === 'low') {
    openings.windowToWallRatio = Math.max(openings.windowToWallRatio - 0.1, 0.1);
    rationale.push('Low solar exposure: reduced glazing to minimize heat loss');
  }

  if (climate.windExposure === 'high' || climate.windExposure === 'extreme') {
    geometry.height = Math.min(geometry.height, 2.8);
    geometry.roofType = 'gabled';
    rationale.push('High wind exposure: reduced height and gabled roof for wind resistance');
  } else if (climate.windExposure === 'low') {
    rationale.push('Low wind exposure: standard height acceptable');
  }

  if (climate.freezeThawRisk === 'high') {
    envelope.wallThickness += 0.05;
    envelope.roofThickness += 0.05;
    geometry.roofType = 'gabled';
    rationale.push('High freeze-thaw risk: increased wall/roof thickness and steep roof for snow shedding');
  }

  if (climate.dailyMinTemp < -10) {
    envelope.wallThickness += 0.05;
    envelope.roofThickness += 0.05;
    thermalMass.level = 'high';
    rationale.push(`Extreme cold (${climate.dailyMinTemp}°C): increased insulation and thermal mass`);
  } else if (climate.dailyMaxTemp > 30) {
    shading.enabled = true;
    shading.overhangDepth = Math.max(shading.overhangDepth, 0.8);
    rationale.push(`High temperatures (${climate.dailyMaxTemp}°C): shading devices recommended`);
  }

  if (climate.dailyMaxTemp > 25 && climate.dailyMinTemp < 10) {
    thermalMass.level = 'high';
    rationale.push('Large diurnal swing: high thermal mass to buffer day-night temperature variation');
  }

  if (rationale.length === 0) {
    rationale.push('Standard geometry suitable for this climate zone');
  }

  return { geometry, envelope, openings, shading, thermalMass, rationale };
}

export const CLIMATE_ZONE_LABELS: Record<ClimateZone, string> = {
  'high-altitude-cold': 'High-Altitude Cold (Ladakh)',
  'hot-arid': 'Hot Arid (Desert)',
  tropical: 'Tropical (Coastal)',
  temperate: 'Temperate (Mediterranean)',
  'cold-continental': 'Cold Continental (Arctic)',
};

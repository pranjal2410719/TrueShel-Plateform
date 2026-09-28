/**
 * Climate data types for TRUESHEL V2
 * Covers high-altitude cold, arid, tropical, temperate, and cold-continental zones.
 */

export type ClimateZone =
  | 'high-altitude-cold'
  | 'hot-arid'
  | 'tropical'
  | 'temperate'
  | 'cold-continental';

export type WindExposure = 'low' | 'moderate' | 'high' | 'extreme';
export type SolarExposure = 'low' | 'moderate' | 'high' | 'very-high';

export interface ClimateData {
  location: string;
  region: string;
  zone: ClimateZone;
  /** Elevation above sea level in meters */
  altitude: number;
  /** 24 hourly dry-bulb temperatures in °C (hour 0–23) */
  hourlyTemperature: number[];
  /** 24 hourly global horizontal irradiance values in W/m² */
  hourlySolarIrradiance: number[];
  /** 24 hourly wind speed values in m/s */
  hourlyWindSpeed: number[];
  /** 24 hourly relative humidity values in % */
  hourlyHumidity: number[];
  dailyMinTemp: number;
  dailyMaxTemp: number;
  avgSolarIrradiance: number;
  windExposure: WindExposure;
  solarExposure: SolarExposure;
  freezeThawRisk: 'low' | 'moderate' | 'high';
  designImplications: string[];
}

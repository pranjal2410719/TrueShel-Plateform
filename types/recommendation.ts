/**
 * Design recommendation types for TRUESHEL V2.
 * Captures the recommended design, performance metrics, and delta vs baseline.
 */

import { ShelterDesign } from './shelter';

export interface PerformanceMetrics {
  /** Hours within comfort band */
  comfortHours: number;
  /** Peak heat loss in kW */
  heatLoss: number;
  /** Passive thermal autonomy in hours */
  autonomy: number;
  /** Hours above comfort max */
  overheatingHours: number;
  /** Peak solar gain in kW */
  solarGain: number;
}

export interface DesignDriver {
  /** Design parameter or variable name */
  parameter: string;
  impact: 'positive' | 'negative';
  /** Plain-language explanation of why this parameter drives performance */
  explanation: string;
}

export interface Recommendation {
  id: string;
  projectId: string;
  recommendedDesign: ShelterDesign;
  performance: PerformanceMetrics;
  drivers: DesignDriver[];
  comparedToBaseline: {
    /** Positive value means more comfort hours than baseline */
    comfortHoursDelta: number;
    /** Negative value means lower (better) heat loss than baseline */
    heatLossDelta: number;
    /** Positive value means more passive autonomy than baseline */
    autonomyDelta: number;
  };
  generatedAt: string;
}

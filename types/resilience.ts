/**
 * Resilience assessment types for TRUESHEL V2.
 * Models failure patterns, risk levels, and thermal autonomy decay curves.
 */

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface FailurePattern {
  id: string;
  /** Short title of the failure mode */
  issue: string;
  /** Climate context where this failure is observed */
  climate: string;
  /** Observed symptom or pattern in the field */
  observedPattern: string;
  /** Expected consequence if unmitigated */
  potentialConsequence: string;
  risk: RiskLevel;
  /** Actionable mitigation strategies */
  mitigations: string[];
  /** Literature or case-study source reference */
  source: string;
}

export interface ResilienceAssessment {
  /** Hours of passive thermal autonomy under design-day conditions */
  thermalAutonomy: number;
  climateExposure: RiskLevel;
  freezeThawRisk: RiskLevel;
  windExposure: RiskLevel;
  solarExposure: RiskLevel;
  materialRisk: RiskLevel;
  overallRisk: RiskLevel;
  failurePatterns: FailurePattern[];
  autonomyDiagram: {
    /** Hour at which indoor temperature first crosses threshold */
    failureHour: number;
    /** Rate of indoor temperature decay in °C/hour after envelope failure */
    decayRate: number;
    /** Minimum acceptable indoor temperature in °C */
    thresholdTemp: number;
    /** Total hours before threshold is breached */
    autonomyHours: number;
  };
}

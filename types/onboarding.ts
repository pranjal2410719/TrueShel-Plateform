// Types for onboarding data collected from the user
export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface ClimateData {
  altitude: number;
  hourlyTemperature: number[]; // 24‑hour profile
  hourlySolarIrradiance: number[];
  // other fields can be added as needed
}

export interface SupplyItem {
  name: string;
  quantity: number; // in appropriate units (e.g., kg, pieces)
}

export interface OnboardingState {
  location?: LocationData;
  climate?: ClimateData;
  supplies: SupplyItem[];
}

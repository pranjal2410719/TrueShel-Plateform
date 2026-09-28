/**
 * Reference Schema Validation and Physical Contract Verification Engine
 * Implements strict boundary validation per PROJECT.md and survey_2 specifications.
 */

export class ValidationError extends Error {
  constructor(field, message) {
    super(`Validation error at '${field}': ${message}`);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Validates a ClimateData record
 */
export function validateClimateData(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('climate', 'Must be a valid object');
  }
  if (typeof data.location !== 'string' || data.location.trim().length === 0) {
    throw new ValidationError('climate.location', 'Location must be a non-empty string');
  }
  if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
    throw new ValidationError('climate.latitude', 'Latitude must be between -90 and +90');
  }
  if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
    throw new ValidationError('climate.longitude', 'Longitude must be between -180 and +180');
  }
  if (typeof data.altitude !== 'number' || data.altitude < -500 || data.altitude > 9000) {
    throw new ValidationError('climate.altitude', 'Altitude must be within [-500, 9000] meters');
  }
  if (typeof data.barometricPressure !== 'number' || data.barometricPressure <= 0) {
    throw new ValidationError('climate.barometricPressure', 'Barometric pressure must be positive');
  }
  return true;
}

/**
 * Validates a single WallLayer
 */
export function validateWallLayer(layer, pathPrefix = 'layer') {
  if (!layer || typeof layer !== 'object') {
    throw new ValidationError(pathPrefix, 'Must be an object');
  }
  if (typeof layer.name !== 'string' || layer.name.length === 0) {
    throw new ValidationError(`${pathPrefix}.name`, 'Layer name must be a non-empty string');
  }
  if (typeof layer.thickness !== 'number' || layer.thickness <= 0 || layer.thickness > 2.0) {
    throw new ValidationError(`${pathPrefix}.thickness`, 'Thickness must be between 0.001m and 2.0m');
  }
  if (typeof layer.conductivity !== 'number' || layer.conductivity <= 0 || layer.conductivity > 500) {
    throw new ValidationError(`${pathPrefix}.conductivity`, 'Thermal conductivity k must be positive (W/m·K)');
  }
  return true;
}

/**
 * Validates ShelterConfig
 */
export function validateShelterConfig(shelter) {
  if (!shelter || typeof shelter !== 'object') {
    throw new ValidationError('shelter', 'Shelter must be an object');
  }

  // Geometry
  const geom = shelter.geometry;
  if (!geom || typeof geom !== 'object') {
    throw new ValidationError('shelter.geometry', 'Missing geometry object');
  }
  if (typeof geom.length !== 'number' || geom.length <= 0 || geom.length > 100) {
    throw new ValidationError('shelter.geometry.length', 'Length must be > 0 and <= 100m');
  }
  if (typeof geom.width !== 'number' || geom.width <= 0 || geom.width > 100) {
    throw new ValidationError('shelter.geometry.width', 'Width must be > 0 and <= 100m');
  }
  if (typeof geom.height !== 'number' || geom.height <= 0 || geom.height > 20) {
    throw new ValidationError('shelter.geometry.height', 'Height must be > 0 and <= 20m');
  }

  // Openings
  const openings = shelter.openings;
  if (!openings || typeof openings !== 'object') {
    throw new ValidationError('shelter.openings', 'Missing openings object');
  }
  if (typeof openings.windowArea !== 'number' || openings.windowArea < 0) {
    throw new ValidationError('shelter.openings.windowArea', 'Window area cannot be negative');
  }
  const grossSouthWallArea = geom.length * geom.height;
  const maxGlazingLimit = 0.90 * grossSouthWallArea;
  if (openings.windowArea > maxGlazingLimit) {
    throw new ValidationError(
      'shelter.openings.windowArea',
      `Window area (${openings.windowArea} m²) cannot exceed 90% of gross facade area (${grossSouthWallArea} m²)`
    );
  }

  // Envelope layers
  if (shelter.envelope) {
    if (Array.isArray(shelter.envelope.wallLayers)) {
      shelter.envelope.wallLayers.forEach((l, idx) => validateWallLayer(l, `shelter.envelope.wallLayers[${idx}]`));
    }
  }

  return true;
}

/**
 * Validates SimulationResult aligned 24h transient vectors
 */
export function validateSimulationResult(result) {
  if (!result || typeof result !== 'object') {
    throw new ValidationError('simulationResult', 'Result must be an object');
  }

  const expectedLength = 25; // 00:00 to 24:00 inclusive = 25 timesteps
  const vectorFields = [
    'timeline',
    'indoorTemperature',
    'outdoorTemperature',
    'solarIrradiance',
    'heatGain',
    'heatLoss',
    'storage',
    'comfort',
    'thermalStates'
  ];

  for (const field of vectorFields) {
    const arr = result[field];
    if (!Array.isArray(arr)) {
      throw new ValidationError(`simulationResult.${field}`, `Field must be an array`);
    }
    if (arr.length !== expectedLength) {
      throw new ValidationError(
        `simulationResult.${field}`,
        `Vector must have exactly ${expectedLength} points (got ${arr.length})`
      );
    }
  }

  // Check state enum values
  const validStates = ['UNDER-COMFORT', 'COMFORT', 'OVERHEATING'];
  result.thermalStates.forEach((state, i) => {
    if (!validStates.includes(state)) {
      throw new ValidationError(`simulationResult.thermalStates[${i}]`, `Invalid thermal state: ${state}`);
    }
  });

  return true;
}

/**
 * ISO 6946 Multi-Layer Thermal Resistance Calculation
 */
export function calculateAssemblyThermalResistance(layers, surfaceType = 'wall') {
  // ISO 6946 standard surface film resistances (m²·K/W)
  const filmResistances = {
    wall: { rsi: 0.13, rse: 0.04 },
    roof: { rsi: 0.10, rse: 0.04 },
    floor: { rsi: 0.17, rse: 0.04 }
  };

  const films = filmResistances[surfaceType] || filmResistances.wall;
  let rLayers = 0;

  for (const layer of layers) {
    if (layer.conductivity <= 0) {
      throw new Error(`Thermal conductivity k must be > 0 (got ${layer.conductivity})`);
    }
    rLayers += layer.thickness / layer.conductivity;
  }

  const rTotal = films.rsi + rLayers + films.rse;
  const uValue = 1 / rTotal;

  return {
    rLayers: Number(rLayers.toFixed(3)),
    rTotal: Number(rTotal.toFixed(3)),
    uValue: Number(uValue.toFixed(3)),
    rsi: films.rsi,
    rse: films.rse
  };
}

/**
 * Lumped Capacitance Autonomy Decay Calculation to 16°C
 */
export function calculateThermalAutonomy(thermalCapacitance, totalUA, tInsideInitial, tOutside, thresholdTemp = 16.0) {
  if (tInsideInitial <= thresholdTemp) {
    return {
      autonomyHours: 0.0,
      decayCurve: [tInsideInitial],
      isFreezeRisk: true
    };
  }

  if (tOutside >= thresholdTemp) {
    return {
      autonomyHours: 24.0, // Infinite/no risk within day, capped at 24h
      decayCurve: Array(25).fill(tInsideInitial),
      isFreezeRisk: false
    };
  }

  // First-Law decay: t_aut = (C / UA) * ln((T_in - T_out) / (T_thresh - T_out))
  const deltaInitial = tInsideInitial - tOutside;
  const deltaThresh = thresholdTemp - tOutside;
  const timeConstantTau = thermalCapacitance / totalUA; // hours
  const autonomyHours = Math.max(0, timeConstantTau * Math.log(deltaInitial / deltaThresh));

  // Synthesize hourly decay curve over 24h
  const decayCurve = [];
  for (let h = 0; h <= 24; h++) {
    const tempAtH = tOutside + deltaInitial * Math.exp(-h / timeConstantTau);
    decayCurve.push(Number(tempAtH.toFixed(2)));
  }

  return {
    autonomyHours: Number(Math.min(24.0, autonomyHours).toFixed(1)),
    decayCurve,
    isFreezeRisk: autonomyHours < 24.0
  };
}

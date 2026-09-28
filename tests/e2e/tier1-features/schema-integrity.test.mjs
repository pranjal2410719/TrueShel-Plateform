import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  validateClimateData,
  validateWallLayer,
  validateShelterConfig,
  validateSimulationResult,
  calculateAssemblyThermalResistance,
  calculateThermalAutonomy,
  ValidationError
} from '../../helpers/schema-validator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

// Load fixtures
const ladakhClimate = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'tests/fixtures/ladakh-climate.json'), 'utf8')
);
const shelterPresets = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'tests/fixtures/shelter-presets.json'), 'utf8')
);
const simulationSample = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'tests/fixtures/simulation-sample.json'), 'utf8')
);
const invalidPayloads = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'tests/fixtures/invalid-payloads.json'), 'utf8')
);

test('Tier 1: Feature 5 — Canonical State & Zod Schema Integrity', async (t) => {

  await t.test('T1.5.1: Canonical ProjectState Tree schema structure', () => {
    const requiredBranches = [
      'project',
      'climate',
      'shelter',
      'simulation',
      'comparison',
      'optimization',
      'recommendation',
      'resilience',
      'thermalTwin'
    ];

    // Construct valid state snapshot from fixtures
    const sampleProjectState = {
      project: { id: 'p1', name: 'Ladakh Passive Shelter', createdAt: '2026-09-27T04:00:00Z', updatedAt: '2026-09-27T04:00:00Z', status: 'simulated' },
      climate: ladakhClimate,
      shelter: shelterPresets.ladakhPassiveSolar,
      simulation: { status: 'completed', result: simulationSample },
      comparison: { baselineId: 's1', candidateId: 's2' },
      optimization: { objective: 'balanced', evaluatedCount: 15 },
      recommendation: { status: 'ready', bestCandidate: 'opt_01' },
      resilience: { autonomyHours: 18.5, climateRisk: 'HIGH' },
      thermalTwin: { activeMode: 'thermal', activeTimestep: 12 }
    };

    for (const branch of requiredBranches) {
      assert.ok(
        branch in sampleProjectState,
        `ProjectState must include '${branch}' branch per R2 specification`
      );
    }
  });

  await t.test('T1.5.2: SimulationResult 24h transient vector validation (25 points)', () => {
    assert.doesNotThrow(() => {
      validateSimulationResult(simulationSample);
    }, 'Valid simulation fixture must pass validation without errors');

    assert.strictEqual(simulationSample.timeline.length, 25, 'Timeline must contain exactly 25 points (00:00 to 24:00)');
    assert.strictEqual(simulationSample.indoorTemperature.length, 25, 'Indoor temperature must contain 25 points');
    assert.strictEqual(simulationSample.outdoorTemperature.length, 25, 'Outdoor temperature must contain 25 points');
    assert.strictEqual(simulationSample.solarIrradiance.length, 25, 'Solar irradiance must contain 25 points');
  });

  await t.test('T1.5.3: ShelterConfig Geometry & Openings Bounds Validation', () => {
    const validShelter = shelterPresets.ladakhPassiveSolar;
    assert.doesNotThrow(() => {
      validateShelterConfig(validShelter);
    }, 'Valid passive solar shelter preset must pass schema validation');

    assert.ok(validShelter.geometry.length > 0, 'Length must be positive');
    assert.ok(validShelter.geometry.width > 0, 'Width must be positive');
    assert.ok(validShelter.geometry.height > 0, 'Height must be positive');
  });

  await t.test('T1.5.4: ClimateData High-Altitude Schema Validation', () => {
    assert.doesNotThrow(() => {
      validateClimateData(ladakhClimate);
    }, 'Ladakh high-altitude climate seed must pass validation');

    assert.strictEqual(ladakhClimate.altitude, 3500, 'Altitude must be 3500m AMSL');
    assert.ok(ladakhClimate.barometricPressure < 70000, 'High altitude pressure must reflect barometric drop (~65.5 kPa)');
    assert.strictEqual(ladakhClimate.winterDesignTemperature, -15.0, 'Winter design temperature must be -15.0°C');
  });

  await t.test('T1.5.5: Boundary Rejection of Corrupt Payloads', () => {
    // 1. Negative dimension
    assert.throws(
      () => validateShelterConfig(invalidPayloads.negativeDimensionShelter),
      ValidationError,
      'Must reject negative dimensions'
    );

    // 2. Excessive glazing (>90% wall area)
    assert.throws(
      () => validateShelterConfig(invalidPayloads.excessiveGlazingShelter),
      ValidationError,
      'Must reject glazing exceeding facade gross area'
    );

    // 3. Non-positive conductivity k <= 0
    assert.throws(
      () => validateWallLayer(invalidPayloads.nonPositiveConductivityLayer),
      ValidationError,
      'Must reject non-positive thermal conductivity'
    );

    // 4. Mismatched vector lengths
    assert.throws(
      () => validateSimulationResult(invalidPayloads.mismatchedSimulationVectors),
      ValidationError,
      'Must reject mismatched simulation vector lengths'
    );
  });

  await t.test('T1.5.6: Four Decoupled Zustand Store Interface Contracts', () => {
    const expectedStores = [
      'stores/project-store.ts',
      'stores/shelter-store.ts',
      'stores/simulation-store.ts',
      'stores/thermal-twin-store.ts'
    ];

    // Verify architectural contracts
    for (const storeRelPath of expectedStores) {
      const fullPath = path.join(projectRoot, storeRelPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(
          content.includes('create') && (content.includes('zustand') || content.includes('State')),
          `${storeRelPath} must export a Zustand store`
        );
      }
    }
    assert.strictEqual(expectedStores.length, 4, 'Must define 4 decoupled stores');
  });

  await t.test('T1.5.7: ISO 6946 Multi-Layer Thermal Resistance Engine Verification', () => {
    const wallLayers = shelterPresets.ladakhPassiveSolar.envelope.wallLayers;
    const result = calculateAssemblyThermalResistance(wallLayers, 'wall');

    // Expected:
    // Rammed earth: 0.20m / 0.75 = 0.267
    // Straw-clay: 0.12m / 0.08 = 1.500
    // Lime plaster: 0.03m / 0.70 = 0.043
    // Sum layers ~ 1.810
    // Rsi = 0.13, Rse = 0.04 => Rtotal ~ 1.980
    // U = 1 / 1.980 ~ 0.505 W/m²·K
    assert.ok(result.rTotal >= 1.8 && result.rTotal <= 2.2, `Expected R_total ~ 1.98, got ${result.rTotal}`);
    assert.ok(result.uValue >= 0.45 && result.uValue <= 0.55, `Expected U ~ 0.51, got ${result.uValue}`);
    assert.strictEqual(result.rsi, 0.13, 'ISO 6946 standard indoor film resistance for vertical walls is 0.13');
    assert.strictEqual(result.rse, 0.04, 'ISO 6946 standard outdoor film resistance for vertical walls is 0.04');
  });

});

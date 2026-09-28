// evaluateDesign.test.ts – basic unit tests for the thermal evaluator
import { evaluateShelterDesign } from '@/lib/calculations/evaluateDesign';
import { DEFAULT_SHELTER_DESIGN } from '@/lib/mock/repository';

describe('evaluateShelterDesign', () => {
  test('returns a valid SimulationResult with sensible comfort hours', () => {
    const result = evaluateShelterDesign(DEFAULT_SHELTER_DESIGN);
    expect(result).toBeDefined();
    expect(result.comfort.comfortHours).toBeGreaterThan(0);
    expect(result.autonomy).toBeGreaterThan(0);
    expect(['low', 'moderate', 'high', 'critical']).toContain(result.risk);
  });

  test('increasing wall insulation reduces peak heat loss', () => {
    const baseResult = evaluateShelterDesign(DEFAULT_SHELTER_DESIGN);
    // Clone design and increase wall layer thickness by 50%
    const modified = JSON.parse(JSON.stringify(DEFAULT_SHELTER_DESIGN));
    const wallLayers = modified.envelope.wall.layers as any[];
    wallLayers.forEach((layer) => {
      layer.thickness = (layer.thickness || 0) * 1.5;
    });
    const modResult = evaluateShelterDesign(modified);
    expect(modResult.peakHeatLoss).toBeLessThanOrEqual(baseResult.peakHeatLoss);
  });
});
